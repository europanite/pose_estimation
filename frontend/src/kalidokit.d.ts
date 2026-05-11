declare module 'kalidokit' {
  export type Rotation = { x: number; y: number; z: number };

  export type SolvedPose = {
    Hips?: { rotation?: Rotation; position?: Rotation };
    Spine?: Rotation;
    Chest?: Rotation;
    Neck?: Rotation;
    Head?: Rotation;
    LeftUpperArm?: Rotation;
    LeftLowerArm?: Rotation;
    LeftHand?: Rotation;
    RightUpperArm?: Rotation;
    RightLowerArm?: Rotation;
    RightHand?: Rotation;
    LeftUpperLeg?: Rotation;
    LeftLowerLeg?: Rotation;
    LeftFoot?: Rotation;
    RightUpperLeg?: Rotation;
    RightLowerLeg?: Rotation;
    RightFoot?: Rotation;
  };

  export namespace Pose {
    function solve(
      poseWorld3D: unknown,
      poseLandmarks: unknown,
      options?: Record<string, unknown>,
    ): SolvedPose | null;
  }
}
