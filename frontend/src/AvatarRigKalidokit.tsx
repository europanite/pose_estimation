import React from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRM, VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import * as Kalidokit from 'kalidokit';
import LegacyAvatarRig from './AvatarRig';
import type { PosePerson } from './types';

type AvatarMode = 'none' | 'vrm' | 'mmd';

export type AvatarSceneMetrics = {
  height: number;
  groundY: number;
};

type MediaPipeLandmark = {
  x: number;
  y: number;
  z: number;
  visibility?: number;
  score?: number;
};

type PosePersonWithMediaPipe = PosePerson & {
  mediapipeLandmarks?: MediaPipeLandmark[];
  mediapipeWorldLandmarks?: MediaPipeLandmark[];
};

type EulerRotation = {
  x?: number;
  y?: number;
  z?: number;
};

type SolvedPose = {
  Hips?: { rotation?: EulerRotation; position?: EulerRotation };
  Spine?: EulerRotation;
  Chest?: EulerRotation;
  Neck?: EulerRotation;
  Head?: EulerRotation;
  LeftUpperArm?: EulerRotation;
  LeftLowerArm?: EulerRotation;
  LeftHand?: EulerRotation;
  RightUpperArm?: EulerRotation;
  RightLowerArm?: EulerRotation;
  RightHand?: EulerRotation;
  LeftUpperLeg?: EulerRotation;
  LeftLowerLeg?: EulerRotation;
  LeftFoot?: EulerRotation;
  RightUpperLeg?: EulerRotation;
  RightLowerLeg?: EulerRotation;
  RightFoot?: EulerRotation;
};

const avatarMode = (process.env.EXPO_PUBLIC_AVATAR_MODE ?? 'none') as AvatarMode;
const vrmUrl = process.env.EXPO_PUBLIC_VRM_URL ?? '/models/avatar.vrm';

const VRM_BONE_NAMES = {
  hips: 'hips',
  spine: 'spine',
  chest: 'chest',
  upperChest: 'upperChest',
  neck: 'neck',
  head: 'head',
  leftUpperArm: 'leftUpperArm',
  leftLowerArm: 'leftLowerArm',
  leftHand: 'leftHand',
  rightUpperArm: 'rightUpperArm',
  rightLowerArm: 'rightLowerArm',
  rightHand: 'rightHand',
  leftUpperLeg: 'leftUpperLeg',
  leftLowerLeg: 'leftLowerLeg',
  leftFoot: 'leftFoot',
  rightUpperLeg: 'rightUpperLeg',
  rightLowerLeg: 'rightLowerLeg',
  rightFoot: 'rightFoot',
} as const;


function measureAvatarScene(scene: THREE.Object3D): AvatarSceneMetrics | null {
  scene.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(scene);
  if (
    !Number.isFinite(box.min.y) ||
    !Number.isFinite(box.max.y) ||
    box.isEmpty()
  ) {
    return null;
  }

  const height = box.max.y - box.min.y;
  if (height <= 1e-5) return null;

  return { height, groundY: box.min.y };
}

function disposeObject(object: THREE.Object3D) {
  object.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();

    const material = mesh.material;
    if (Array.isArray(material)) {
      material.forEach((m) => m.dispose());
    } else if (material) {
      material.dispose();
    }
  });
}

function hasMediaPipeLandmarks(person: PosePerson | null): person is PosePersonWithMediaPipe {
  const p = person as PosePersonWithMediaPipe | null;
  return Boolean(
    p?.mediapipeLandmarks?.length === 33 &&
    p?.mediapipeWorldLandmarks?.length === 33,
  );
}

function applyRotation(vrm: VRM, boneName: string, rotation?: EulerRotation, dampener = 1.0) {
  if (!rotation) return;
  const bone = vrm.humanoid.getNormalizedBoneNode(boneName as never);
  if (!bone) return;

  bone.rotation.set(
    (rotation.x ?? 0) * dampener,
    (rotation.y ?? 0) * dampener,
    (rotation.z ?? 0) * dampener,
    'XYZ',
  );
}


function disposeSkeletonHelper(helper: THREE.SkeletonHelper) {
  helper.geometry.dispose();
  const material = helper.material;
  if (Array.isArray(material)) {
    material.forEach((m) => m.dispose());
  } else {
    material.dispose();
  }
}

function applyHips(vrm: VRM, solvedPose: SolvedPose) {
  if (!solvedPose.Hips) return;

  // Kalidokit exposes a hips position, but from a single still image it is not a
  // stable avatar root transform. Keep the loaded VRM root fixed and only apply
  // the local hips rotation.
  applyRotation(vrm, VRM_BONE_NAMES.hips, solvedPose.Hips.rotation, 0.35);
}

function applySolvedPose(vrm: VRM, solvedPose: SolvedPose) {
  applyHips(vrm, solvedPose);

  applyRotation(vrm, VRM_BONE_NAMES.spine, solvedPose.Spine, 0.35);
  applyRotation(vrm, VRM_BONE_NAMES.chest, solvedPose.Chest ?? solvedPose.Spine, 0.25);
  applyRotation(vrm, VRM_BONE_NAMES.upperChest, solvedPose.Chest ?? solvedPose.Spine, 0.2);
  applyRotation(vrm, VRM_BONE_NAMES.neck, solvedPose.Neck, 0.35);
  applyRotation(vrm, VRM_BONE_NAMES.head, solvedPose.Head, 0.5);

  applyRotation(vrm, VRM_BONE_NAMES.leftUpperArm, solvedPose.LeftUpperArm, 1.0);
  applyRotation(vrm, VRM_BONE_NAMES.leftLowerArm, solvedPose.LeftLowerArm, 1.0);
  applyRotation(vrm, VRM_BONE_NAMES.leftHand, solvedPose.LeftHand, 0.7);
  applyRotation(vrm, VRM_BONE_NAMES.rightUpperArm, solvedPose.RightUpperArm, 1.0);
  applyRotation(vrm, VRM_BONE_NAMES.rightLowerArm, solvedPose.RightLowerArm, 1.0);
  applyRotation(vrm, VRM_BONE_NAMES.rightHand, solvedPose.RightHand, 0.7);

  applyRotation(vrm, VRM_BONE_NAMES.leftUpperLeg, solvedPose.LeftUpperLeg, 0.8);
  applyRotation(vrm, VRM_BONE_NAMES.leftLowerLeg, solvedPose.LeftLowerLeg, 0.8);
  applyRotation(vrm, VRM_BONE_NAMES.leftFoot, solvedPose.LeftFoot, 0.6);
  applyRotation(vrm, VRM_BONE_NAMES.rightUpperLeg, solvedPose.RightUpperLeg, 0.8);
  applyRotation(vrm, VRM_BONE_NAMES.rightLowerLeg, solvedPose.RightLowerLeg, 0.8);
  applyRotation(vrm, VRM_BONE_NAMES.rightFoot, solvedPose.RightFoot, 0.6);

  vrm.humanoid.update();
}

function VrmAvatar({
  person,
  url,
  mirrorPose,
  showBones,
  onMetrics,
}: {
  person: PosePerson | null;
  url: string;
  mirrorPose: boolean;
  showBones: boolean;
  onMetrics?: (metrics: AvatarSceneMetrics) => void;
}) {
  const [vrm, setVrm] = React.useState<VRM | null>(null);
  const [skeletonHelper, setSkeletonHelper] = React.useState<THREE.SkeletonHelper | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    let loadedVrm: VRM | null = null;
    let loadedSkeletonHelper: THREE.SkeletonHelper | null = null;

    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));
    loader.load(
      url,
      (gltf) => {
        if (cancelled) return;
        loadedVrm = gltf.userData.vrm as VRM;
        VRMUtils.removeUnnecessaryVertices(gltf.scene);
        VRMUtils.removeUnnecessaryJoints(gltf.scene);
        loadedVrm.scene.position.set(0, -1.05, 0);
        loadedVrm.scene.rotation.set(0, Math.PI, 0);
        loadedVrm.scene.scale.setScalar(1.0);
        loadedVrm.humanoid.resetNormalizedPose();
        loadedVrm.humanoid.update();
        loadedSkeletonHelper = new THREE.SkeletonHelper(loadedVrm.scene);
        loadedSkeletonHelper.visible = showBones;
        loadedSkeletonHelper.frustumCulled = false;
        const metrics = measureAvatarScene(loadedVrm.scene);
        if (metrics) onMetrics?.(metrics);
        setVrm(loadedVrm);
        setSkeletonHelper(loadedSkeletonHelper);
      },
      undefined,
      (error) => {
        console.error('Failed to load VRM avatar:', error);
      },
    );

    return () => {
      cancelled = true;
      if (loadedSkeletonHelper) disposeSkeletonHelper(loadedSkeletonHelper);
      if (loadedVrm) disposeObject(loadedVrm.scene);
    };
  }, [url, onMetrics]);

  React.useEffect(() => {
    if (skeletonHelper) skeletonHelper.visible = showBones;
  }, [showBones, skeletonHelper]);

  React.useEffect(() => {
    if (!vrm || !hasMediaPipeLandmarks(person)) return;

    const solvedPose = Kalidokit.Pose.solve(
      person.mediapipeWorldLandmarks,
      person.mediapipeLandmarks,
      {
        runtime: 'mediapipe',
        enableLegs: true,
      },
    ) as SolvedPose | null;

    if (!solvedPose) return;

    vrm.humanoid.resetNormalizedPose();
    applySolvedPose(vrm, solvedPose);
  }, [person, vrm]);

  useFrame((_, delta) => {
    vrm?.update(delta);
    skeletonHelper?.updateMatrixWorld(true);
  });

  if (!vrm) return null;
  return (
    <>
      <group scale={mirrorPose ? [-1, 1, 1] : [1, 1, 1]}>
        <primitive object={vrm.scene} />
      </group>
      {skeletonHelper && showBones ? <primitive object={skeletonHelper} /> : null}
    </>
  );
}

export default function AvatarRigKalidokit({
  person,
  mirrorPose = false,
  showBones = false,
  onMetrics,
}: {
  person: PosePerson | null;
  mirrorPose?: boolean;
  showBones?: boolean;
  onMetrics?: (metrics: AvatarSceneMetrics) => void;
}) {
  if (avatarMode === 'vrm') {
    return <VrmAvatar person={person} url={vrmUrl} mirrorPose={mirrorPose} showBones={showBones} onMetrics={onMetrics} />;
  }

  if (avatarMode === 'mmd') {
    return <LegacyAvatarRig person={person} />;
  }

  return null;
}
