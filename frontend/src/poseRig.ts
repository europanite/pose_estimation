import * as THREE from 'three';
import type { PosePerson, PosePoint } from './types';

export type RigRotationMap = Record<string, THREE.Quaternion>;

export type RigSpec = {
  name: string;
  from: string;
  to: string;
  restAxis: THREE.Vector3;
  strength?: number;
};

const MIN_SCORE = 0.2;
const IDENTITY = new THREE.Quaternion();

const X_POS = new THREE.Vector3(1, 0, 0);
const X_NEG = new THREE.Vector3(-1, 0, 0);
const Y_POS = new THREE.Vector3(0, 1, 0);
const Y_NEG = new THREE.Vector3(0, -1, 0);

export const VRM_RIG_SPECS: RigSpec[] = [
  { name: 'leftUpperArm', from: 'LShoulder', to: 'LElbow', restAxis: X_POS },
  { name: 'leftLowerArm', from: 'LElbow', to: 'LWrist', restAxis: X_POS },
  { name: 'rightUpperArm', from: 'RShoulder', to: 'RElbow', restAxis: X_NEG },
  { name: 'rightLowerArm', from: 'RElbow', to: 'RWrist', restAxis: X_NEG },
  { name: 'leftUpperLeg', from: 'LHip', to: 'LKnee', restAxis: Y_NEG },
  { name: 'leftLowerLeg', from: 'LKnee', to: 'LAnkle', restAxis: Y_NEG },
  { name: 'rightUpperLeg', from: 'RHip', to: 'RKnee', restAxis: Y_NEG },
  { name: 'rightLowerLeg', from: 'RKnee', to: 'RAnkle', restAxis: Y_NEG },
  { name: 'spine', from: 'MidHip', to: 'Neck', restAxis: Y_POS, strength: 0.35 },
  { name: 'chest', from: 'MidHip', to: 'Neck', restAxis: Y_POS, strength: 0.25 },
  { name: 'neck', from: 'Neck', to: 'Nose', restAxis: Y_POS, strength: 0.25 },
];

export const MMD_BONE_NAME_CANDIDATES: Record<string, string[]> = {
  leftUpperArm: ['左腕', '左うで', '左肩P', 'left arm', 'LeftArm'],
  leftLowerArm: ['左ひじ', '左肘', 'left elbow', 'LeftElbow'],
  rightUpperArm: ['右腕', '右うで', '右肩P', 'right arm', 'RightArm'],
  rightLowerArm: ['右ひじ', '右肘', 'right elbow', 'RightElbow'],
  leftUpperLeg: ['左足', '左脚', 'left leg', 'LeftLeg'],
  leftLowerLeg: ['左ひざ', '左膝', 'left knee', 'LeftKnee'],
  rightUpperLeg: ['右足', '右脚', 'right leg', 'RightLeg'],
  rightLowerLeg: ['右ひざ', '右膝', 'right knee', 'RightKnee'],
  spine: ['上半身', 'upper body', 'UpperBody'],
  chest: ['上半身2', 'upper body2', 'UpperBody2'],
  neck: ['首', 'neck', 'Neck'],
};

export function posePointToVector(point: PosePoint): THREE.Vector3 {
  return new THREE.Vector3(
    (point.x - 0.5) * 4,
    -(point.y - 0.5) * 4,
    -point.z * 2,
  );
}

function validPoint(point: PosePoint | null | undefined): point is PosePoint {
  return Boolean(point && point.score >= MIN_SCORE);
}

function directionFromPose(person: PosePerson, fromName: string, toName: string): THREE.Vector3 | null {
  const from = person.keypoints[fromName];
  const to = person.keypoints[toName];
  if (!validPoint(from) || !validPoint(to)) return null;

  const direction = posePointToVector(to).sub(posePointToVector(from));
  if (direction.lengthSq() < 1e-6) return null;

  return direction.normalize();
}

function softenedQuaternion(quaternion: THREE.Quaternion, strength = 1): THREE.Quaternion {
  if (strength >= 0.999) return quaternion;
  return IDENTITY.clone().slerp(quaternion, Math.max(0, Math.min(1, strength)));
}

export function buildRigRotations(person: PosePerson, specs: RigSpec[] = VRM_RIG_SPECS): RigRotationMap {
  const rotations: RigRotationMap = {};

  for (const spec of specs) {
    const direction = directionFromPose(person, spec.from, spec.to);
    if (!direction) continue;

    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      spec.restAxis.clone().normalize(),
      direction,
    );
    rotations[spec.name] = softenedQuaternion(quaternion.normalize(), spec.strength);
  }

  return rotations;
}

export function buildVrmNormalizedPose(person: PosePerson): Record<string, { rotation: [number, number, number, number] }> {
  const rotations = buildRigRotations(person);
  const pose: Record<string, { rotation: [number, number, number, number] }> = {};

  for (const [boneName, quaternion] of Object.entries(rotations)) {
    pose[boneName] = {
      rotation: [quaternion.x, quaternion.y, quaternion.z, quaternion.w],
    };
  }

  return pose;
}

export function findBoneByCandidateNames(
  bones: THREE.Bone[],
  candidateNames: string[],
): THREE.Bone | null {
  for (const candidate of candidateNames) {
    const exact = bones.find((bone) => bone.name === candidate);
    if (exact) return exact;
  }

  const normalizedCandidates = candidateNames.map((name) => name.toLowerCase());
  return bones.find((bone) => normalizedCandidates.some((name) => bone.name.toLowerCase().includes(name))) ?? null;
}
