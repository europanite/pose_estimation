/// <reference types="@react-three/fiber" />
import React from 'react';
import { Platform, Text, View } from 'react-native';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import AvatarRig, { type AvatarSceneMetrics } from './AvatarRigKalidokit';
import { posePointToVector } from './poseRig';
import type { PosePerson } from './types';

type MediaPipeLandmark = {
  x: number;
  y: number;
  z: number;
  visibility?: number;
  score?: number;
};

type PosePersonWithWorldLandmarks = PosePerson & {
  mediapipeWorldLandmarks?: MediaPipeLandmark[];
};

type WorldSkeletonContext = {
  landmarks: MediaPipeLandmark[];
  origin: MediaPipeLandmark;
  scale: number;
  yOffset: number;
  ySign: 1 | -1;
};

const BODY25_TO_MEDIAPIPE_WORLD: Record<string, number | null> = {
  Nose: 0,
  Neck: null,
  RShoulder: 12,
  RElbow: 14,
  RWrist: 16,
  LShoulder: 11,
  LElbow: 13,
  LWrist: 15,
  MidHip: null,
  RHip: 24,
  RKnee: 26,
  RAnkle: 28,
  LHip: 23,
  LKnee: 25,
  LAnkle: 27,
  REye: 5,
  LEye: 2,
  REar: 8,
  LEar: 7,
  LBigToe: 31,
  LSmallToe: 31,
  LHeel: 29,
  RBigToe: 32,
  RSmallToe: 32,
  RHeel: 30,
};

const DEFAULT_AVATAR_GROUND_Y = -1.05;
const DEFAULT_AVATAR_HEIGHT = 2.05;
const ESTIMATED_BONE_TORSO_HEIGHT_FALLBACK = 0.95;
const ESTIMATED_BONE_WORLD_X_SIGN = -1;
const FOOT_BODY25_NAMES = ['LAnkle', 'RAnkle', 'LHeel', 'RHeel', 'LBigToe', 'RBigToe'];
const TOP_BODY25_NAMES = ['Nose', 'LEye', 'REye', 'LEar', 'REar'];

function MouseOrbitControls() {
  const { camera, gl } = useThree();

  const controls = React.useMemo(() => {
    const c = new OrbitControls(camera, gl.domElement);
    c.enableDamping = true;
    c.dampingFactor = 0.08;
    c.enablePan = false;
    c.enableZoom = true;
    c.enableRotate = true;
    c.minDistance = 1.2;
    c.maxDistance = 7;
    c.target.set(0, 0.15, 0);
    c.update();
    return c;
  }, [camera, gl]);

  useFrame(() => {
    controls.update();
  });

  React.useEffect(() => {
    return () => {
      controls.dispose();
    };
  }, [controls]);

  return null;
}

function isVisibleLandmark(point: MediaPipeLandmark | null | undefined) {
  if (!point) return false;
  const score = point.score ?? point.visibility ?? 1;
  return Number.isFinite(point.x) && Number.isFinite(point.y) && Number.isFinite(point.z) && score >= 0.2;
}

function averageLandmarks(landmarks: MediaPipeLandmark[], indices: number[]): MediaPipeLandmark | null {
  const points = indices.map((idx) => landmarks[idx]).filter(isVisibleLandmark);
  if (points.length === 0) return null;

  return {
    x: points.reduce((sum, point) => sum + point.x, 0) / points.length,
    y: points.reduce((sum, point) => sum + point.y, 0) / points.length,
    z: points.reduce((sum, point) => sum + point.z, 0) / points.length,
    score: Math.min(...points.map((point) => point.score ?? point.visibility ?? 1)),
  };
}

function getWorldLandmarkForBody25(landmarks: MediaPipeLandmark[], name: string): MediaPipeLandmark | null {
  if (name === 'Neck') return averageLandmarks(landmarks, [11, 12]);
  if (name === 'MidHip') return averageLandmarks(landmarks, [23, 24]);

  const index = BODY25_TO_MEDIAPIPE_WORLD[name];
  if (index == null) return null;

  const point = landmarks[index];
  return isVisibleLandmark(point) ? point : null;
}

function hasWorldLandmarks(person: PosePerson | null): person is PosePersonWithWorldLandmarks {
  const maybePerson = person as PosePersonWithWorldLandmarks | null;
  return Boolean(maybePerson?.mediapipeWorldLandmarks?.length === 33);
}

function toRawVrmVector(point: MediaPipeLandmark, origin: MediaPipeLandmark, ySign: 1 | -1) {
  return new THREE.Vector3(
    (point.x - origin.x) * ESTIMATED_BONE_WORLD_X_SIGN,
    (point.y - origin.y) * ySign,
    -(point.z - origin.z),
  );
}

function rawY(point: MediaPipeLandmark, origin: MediaPipeLandmark, ySign: 1 | -1) {
  return (point.y - origin.y) * ySign;
}

function collectVisibleWorldPoints(
  landmarks: MediaPipeLandmark[],
  names: string[],
) {
  return names
    .map((name) => getWorldLandmarkForBody25(landmarks, name))
    .filter(isVisibleLandmark);
}

function buildWorldSkeletonContext(
  person: PosePerson,
  avatarMetrics: AvatarSceneMetrics | null,
): WorldSkeletonContext | null {
  if (!hasWorldLandmarks(person)) return null;

  const landmarks = person.mediapipeWorldLandmarks;
  const midHip = getWorldLandmarkForBody25(landmarks, 'MidHip');
  const neck = getWorldLandmarkForBody25(landmarks, 'Neck');
  if (!midHip || !neck) return null;

  // MediaPipe world landmarks may use either image-like vertical coordinates
  // or already-upward coordinates depending on the runtime. Infer the sign from
  // the neck-vs-hips relation so the debug bones share Three.js / VRM Y-up space.
  const ySign: 1 | -1 = neck.y < midHip.y ? -1 : 1;
  const visibleFeet = collectVisibleWorldPoints(landmarks, FOOT_BODY25_NAMES);
  const visibleTop = collectVisibleWorldPoints(landmarks, TOP_BODY25_NAMES);
  const footRawY = visibleFeet.length > 0
    ? Math.min(...visibleFeet.map((point) => rawY(point, midHip, ySign)))
    : rawY(getWorldLandmarkForBody25(landmarks, 'LAnkle') ?? midHip, midHip, ySign);
  const topRawY = visibleTop.length > 0
    ? Math.max(...visibleTop.map((point) => rawY(point, midHip, ySign)))
    : rawY(neck, midHip, ySign);
  const rawBodyHeight = topRawY - footRawY;
  const rawTorsoHeight = Math.abs(rawY(neck, midHip, ySign));
  const targetHeight = avatarMetrics?.height ?? DEFAULT_AVATAR_HEIGHT;
  const targetGroundY = avatarMetrics?.groundY ?? DEFAULT_AVATAR_GROUND_Y;
  const scale = rawBodyHeight > 1e-5
    ? targetHeight / rawBodyHeight
    : rawTorsoHeight > 1e-5
      ? ESTIMATED_BONE_TORSO_HEIGHT_FALLBACK / rawTorsoHeight
      : 1;

  // Match the estimated bones to the loaded VRM's measured height, then place
  // the lowest visible foot point on the same ground plane as the avatar.
  const yOffset = targetGroundY - footRawY * scale;

  return { landmarks, origin: midHip, scale, yOffset, ySign };
}

function worldPointToVrmVector(point: MediaPipeLandmark, context: WorldSkeletonContext) {
  const raw = toRawVrmVector(point, context.origin, context.ySign);
  return raw.multiplyScalar(context.scale).add(new THREE.Vector3(0, context.yOffset, 0));
}

function getSkeletonVector(person: PosePerson, name: string, context: WorldSkeletonContext | null) {
  if (context) {
    const worldPoint = getWorldLandmarkForBody25(context.landmarks, name);
    if (worldPoint) return worldPointToVrmVector(worldPoint, context);
  }

  const fallbackPoint = person.keypoints[name];
  if (!fallbackPoint || fallbackPoint.score < 0.2) return null;
  return posePointToVector(fallbackPoint);
}

function BoneLine({ from, to }: { from: THREE.Vector3; to: THREE.Vector3 }) {
  const line = React.useMemo(() => {
    const geometry = new THREE.BufferGeometry().setFromPoints([from, to]);
    const material = new THREE.LineBasicMaterial({ color: 'hotpink' });
    return new THREE.Line(geometry, material);
  }, [from, to]);

  React.useEffect(() => {
    return () => {
      line.geometry.dispose();
      (line.material as THREE.Material).dispose();
    };
  }, [line]);

  return <primitive object={line} />;
}

function Skeleton({
  person,
  bones,
  mirror = false,
  avatarMetrics,
}: {
  person: PosePerson;
  bones: [string, string][];
  mirror?: boolean;
  avatarMetrics: AvatarSceneMetrics | null;
}) {
  const worldContext = React.useMemo(
    () => buildWorldSkeletonContext(person, avatarMetrics),
    [avatarMetrics, person],
  );

  return (
    <group scale={mirror ? [-1, 1, 1] : [1, 1, 1]}>
      {bones.map(([a, b]) => {
        const from = getSkeletonVector(person, a, worldContext);
        const to = getSkeletonVector(person, b, worldContext);
        if (!from || !to) return null;
        return <BoneLine key={`${a}-${b}`} from={from} to={to} />;
      })}

      {Object.entries(person.keypoints).map(([name, p]) => {
        if (!p || p.score < 0.2) return null;
        const v = getSkeletonVector(person, name, worldContext);
        if (!v) return null;
        return (
          <mesh key={name} position={v}>
            <sphereGeometry args={[0.045, 16, 16]} />
            <meshStandardMaterial color="white" />
          </mesh>
        );
      })}
    </group>
  );
}

export default function PoseSceneAvatar({
  person,
  bones,
  mirrorAvatarPose = false,
  showAvatar = true,
  showEstimatedPoseBones = false,
  showVrmBones = false,
}: {
  person: PosePerson | null;
  bones: [string, string][];
  mirrorAvatarPose?: boolean;
  showAvatar?: boolean;
  showEstimatedPoseBones?: boolean;
  showVrmBones?: boolean;
}) {
  const [avatarMetrics, setAvatarMetrics] = React.useState<AvatarSceneMetrics | null>(null);

  if (Platform.OS !== 'web') {
    return <Text>This simple 3D view is currently intended for Expo Web. For native builds, switch to an expo-gl implementation.</Text>;
  }

  return (
    <View style={{ height: 640, backgroundColor: '#151515', borderRadius: 12, overflow: 'hidden' }}>
      <Canvas camera={{ position: [0, 0.25, 3.6], fov: 33 }}>
        <ambientLight intensity={0.9} />
        <directionalLight position={[3, 5, 4]} intensity={1} />
        <gridHelper args={[6, 12]} position={[0, -1.05, 0]} />
        <MouseOrbitControls />
        {showAvatar ? (
          <AvatarRig
            person={person}
            mirrorPose={mirrorAvatarPose}
            showBones={showVrmBones}
            onMetrics={setAvatarMetrics}
          />
        ) : null}
        {showEstimatedPoseBones && person ? (
          <Skeleton
            person={person}
            bones={bones}
            mirror={mirrorAvatarPose}
            avatarMetrics={avatarMetrics}
          />
        ) : null}
      </Canvas>
    </View>
  );
}
