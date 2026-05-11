import React from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MMDLoader } from 'three/examples/jsm/loaders/MMDLoader.js';
import { VRM, VRMLoaderPlugin, VRMPose, VRMUtils } from '@pixiv/three-vrm';
import type { PosePerson } from './types';
import {
  MMD_BONE_NAME_CANDIDATES,
  buildRigRotations,
  buildVrmNormalizedPose,
  findBoneByCandidateNames,
} from './poseRig';

type AvatarMode = 'none' | 'vrm' | 'mmd';

type MmdSkinnedMesh = THREE.SkinnedMesh & {
  skeleton: THREE.Skeleton;
};

const avatarMode = (process.env.EXPO_PUBLIC_AVATAR_MODE ?? 'none') as AvatarMode;
const vrmUrl = process.env.EXPO_PUBLIC_VRM_URL ?? '/models/avatar.vrm';
const mmdUrl = process.env.EXPO_PUBLIC_MMD_URL ?? '/models/model.pmx';

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

function VrmAvatar({ person, url }: { person: PosePerson | null; url: string }) {
  const [vrm, setVrm] = React.useState<VRM | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    let loadedVrm: VRM | null = null;

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
        setVrm(loadedVrm);
      },
      undefined,
      (error) => {
        console.error('Failed to load VRM avatar:', error);
      },
    );

    return () => {
      cancelled = true;
      if (loadedVrm) disposeObject(loadedVrm.scene);
    };
  }, [url]);

  React.useEffect(() => {
    if (!vrm || !person) return;

    const pose = buildVrmNormalizedPose(person) as VRMPose;
    vrm.humanoid.resetNormalizedPose();
    vrm.humanoid.setNormalizedPose(pose);
    vrm.humanoid.update();
  }, [person, vrm]);

  useFrame((_, delta) => {
    vrm?.update(delta);
  });

  if (!vrm) return null;
  return <primitive object={vrm.scene} />;
}

function MmdAvatar({ person, url }: { person: PosePerson | null; url: string }) {
  const [mesh, setMesh] = React.useState<MmdSkinnedMesh | null>(null);
  const restQuaternionsRef = React.useRef<Map<string, THREE.Quaternion>>(new Map());

  React.useEffect(() => {
    let cancelled = false;
    let loadedMesh: MmdSkinnedMesh | null = null;

    const loader = new MMDLoader();
    loader.load(
      url,
      (object) => {
        if (cancelled) return;
        loadedMesh = object as MmdSkinnedMesh;
        loadedMesh.position.set(0, -1.05, 0);
        loadedMesh.rotation.set(0, Math.PI, 0);
        loadedMesh.scale.setScalar(0.1);

        const restQuaternions = new Map<string, THREE.Quaternion>();
        for (const bone of loadedMesh.skeleton.bones) {
          restQuaternions.set(bone.uuid, bone.quaternion.clone());
        }
        restQuaternionsRef.current = restQuaternions;
        setMesh(loadedMesh);
      },
      undefined,
      (error) => {
        console.error('Failed to load MMD avatar:', error);
      },
    );

    return () => {
      cancelled = true;
      if (loadedMesh) disposeObject(loadedMesh);
    };
  }, [url]);

  React.useEffect(() => {
    if (!mesh || !person) return;

    const rotations = buildRigRotations(person);
    for (const [rigName, quaternion] of Object.entries(rotations)) {
      const candidateNames = MMD_BONE_NAME_CANDIDATES[rigName];
      if (!candidateNames) continue;

      const bone = findBoneByCandidateNames(mesh.skeleton.bones, candidateNames);
      if (!bone) continue;

      const rest = restQuaternionsRef.current.get(bone.uuid) ?? IDENTITY_QUATERNION;
      bone.quaternion.copy(rest).multiply(quaternion);
    }

    mesh.updateMatrixWorld(true);
  }, [person, mesh]);

  if (!mesh) return null;
  return <primitive object={mesh} />;
}

const IDENTITY_QUATERNION = new THREE.Quaternion();

export default function AvatarRig({ person }: { person: PosePerson | null }) {
  if (avatarMode === 'vrm') {
    return <VrmAvatar person={person} url={vrmUrl} />;
  }

  if (avatarMode === 'mmd') {
    return <MmdAvatar person={person} url={mmdUrl} />;
  }

  return null;
}
