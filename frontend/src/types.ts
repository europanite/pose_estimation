export type PosePoint = {
  x: number;
  y: number;
  z: number;
  score: number;
};

export type PosePerson = {
  keypoints: Record<string, PosePoint | null>;
};

export type PoseResponse = {
  backend: 'openpose' | 'mediapipe' | string;
  width: number;
  height: number;
  people: PosePerson[];
  bones: [string, string][];
};
