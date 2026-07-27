---
layout: page
title: "🇺🇸 English"
permalink: /
lang: en
---

# [pose_estimation](https://github.com/europanite/pose_estimation "A container for pose estimation from 2D images.")

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
![OS](https://img.shields.io/badge/OS-Linux%20%7C%20macOS%20%7C%20Windows-blue)
[![Python](https://img.shields.io/badge/python-3.10%20|%203.11|%203.12|%203.13-blue)](https://www.python.org/)

[![CodeQL Advanced](https://github.com/europanite/pose_estimation/actions/workflows/codeql.yml/badge.svg)](https://github.com/europanite/pose_estimation/actions/workflows/codeql.yml)
[![CI](https://github.com/europanite/pose_estimation/actions/workflows/ci.yml/badge.svg)](https://github.com/europanite/pose_estimation/actions/workflows/ci.yml)
[![Python Lint](https://github.com/europanite/pose_estimation/actions/workflows/lint.yml/badge.svg)](https://github.com/europanite/pose_estimation/actions/workflows/lint.yml)

<p align="right">
  <a href="https://europanite.github.io/pose_estimation/">🇺🇸 English</a> |
  <a href="https://europanite.github.io/pose_estimation/hi/">🇮🇳 हिंदी</a> |
  <a href="https://europanite.github.io/pose_estimation/ja/">🇯🇵 日本語</a> |
  <a href="https://europanite.github.io/pose_estimation/zh-CN/">🇨🇳 简体中文</a> |
  <a href="https://europanite.github.io/pose_estimation/es/">🇪🇸 Español</a> |
  <a href="https://europanite.github.io/pose_estimation/pt-BR/">🇧🇷 Português (Brasil)</a> |
  <a href="https://europanite.github.io/pose_estimation/ko/">🇰🇷 한국어</a> |
  <a href="https://europanite.github.io/pose_estimation/de/">🇩🇪 Deutsch</a> |
  <a href="https://europanite.github.io/pose_estimation/fr/">🇫🇷 Français</a>
</p>

!["web_ui"](./assets/images/web_ui.png)

A container for pose estimation from 2D images.

---

## Pose-to-VRM bone mapping

The backend returns BODY_25-style pose keypoints and bone pairs. In MediaPipe mode, `Neck` is synthesized from `LShoulder` and `RShoulder`, and `MidHip` is synthesized from `LHip` and `RHip`. Use the table below when transferring the estimated pose to a VRM humanoid skeleton.

| Estimated pose vector | Input keypoints | VRM humanoid bone | Priority | Notes |
|---|---|---|---|---|
| Body root | `MidHip`, `LHip`, `RHip` | `hips` | Required | Use mainly for root rotation. Avoid trusting root translation from a single image. |
| Spine | `MidHip -> Neck` | `spine` | Required | Main upper-body direction. |
| Chest | `MidHip -> Neck` | `chest` | Recommended | Apply with a weaker weight than `spine` to avoid exaggerated bending. |
| Upper chest | `MidHip -> Neck` | `upperChest` | Optional | Use only when the loaded VRM model has this bone. |
| Neck | `Neck -> Nose` | `neck` | Recommended | Apply gently because head and neck landmarks are noisy in single-image pose estimation. |
| Head | `Neck -> Nose`, `Nose -> LEye`, `Nose -> REye`, `LEye -> LEar`, `REye -> REar` | `head` | Recommended | A simple fallback can use only `Neck -> Nose`; eye and ear points can improve the facing direction. |
| Left shoulder | `Neck -> LShoulder` | `leftShoulder` | Optional | Use only when the VRM has shoulder bones. The arm can still be driven without this bone. |
| Left upper arm | `LShoulder -> LElbow` | `leftUpperArm` | Required | Primary left upper-arm rotation. |
| Left lower arm | `LElbow -> LWrist` | `leftLowerArm` | Required | Primary left forearm rotation. |
| Left hand | `LElbow -> LWrist` or hand landmarks | `leftHand` | Optional | BODY_25 does not provide enough wrist orientation. Use a weak fallback unless hand landmarks are available. |
| Right shoulder | `Neck -> RShoulder` | `rightShoulder` | Optional | Use only when the VRM has shoulder bones. |
| Right upper arm | `RShoulder -> RElbow` | `rightUpperArm` | Required | Primary right upper-arm rotation. |
| Right lower arm | `RElbow -> RWrist` | `rightLowerArm` | Required | Primary right forearm rotation. |
| Right hand | `RElbow -> RWrist` or hand landmarks | `rightHand` | Optional | BODY_25 does not provide enough wrist orientation. Use a weak fallback unless hand landmarks are available. |
| Left upper leg | `LHip -> LKnee` | `leftUpperLeg` | Required | Primary left thigh rotation. |
| Left lower leg | `LKnee -> LAnkle` | `leftLowerLeg` | Required | Primary left shin rotation. |
| Left foot | `LAnkle -> LBigToe`, `LAnkle -> LHeel` | `leftFoot` | Recommended | Use toe and heel points when they are visible. |
| Left toes | `LHeel -> LBigToe` | `leftToes` | Optional | Use only when the VRM has toe bones and the toe landmarks are stable. |
| Right upper leg | `RHip -> RKnee` | `rightUpperLeg` | Required | Primary right thigh rotation. |
| Right lower leg | `RKnee -> RAnkle` | `rightLowerLeg` | Required | Primary right shin rotation. |
| Right foot | `RAnkle -> RBigToe`, `RAnkle -> RHeel` | `rightFoot` | Recommended | Use toe and heel points when they are visible. |
| Right toes | `RHeel -> RBigToe` | `rightToes` | Optional | Use only when the VRM has toe bones and the toe landmarks are stable. |
| Left eye | `Nose -> LEye` | `leftEye` | Optional | Only needed for gaze or expression features. |
| Right eye | `Nose -> REye` | `rightEye` | Optional | Only needed for gaze or expression features. |

Minimum useful VRM bones are `spine`, `leftUpperArm`, `leftLowerArm`, `rightUpperArm`, `rightLowerArm`, `leftUpperLeg`, `leftLowerLeg`, `rightUpperLeg`, and `rightLowerLeg`. After these are stable, add `hips`, `chest`, `neck`, `head`, `leftFoot`, and `rightFoot` for a more readable avatar pose.

---

## Start the project

```bash
cp .env.example .env
docker compose up --build
```

Open the browser:

```text
http://localhost:8081
```

Check the API:

```bash
curl http://localhost:8000/api/v1/health
```

---

## How to use

1. Press "Select image".
2. Select an image.
3. Check the 2D keypoints overlaid on the image.
4. Check the pose direction in the lower "3D skeleton check" view.

## Tests

Run the backend tests:

```bash
docker compose -f docker-compose.test.yml run --rm backend_test
```

Run the frontend smoke test:

```bash
docker compose -f docker-compose.yml -f docker-compose.test.yml run --rm frontend_test
```

---

## License
- Apache License 2.0
