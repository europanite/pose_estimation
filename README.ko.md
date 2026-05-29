---
layout: page
title: "🇰🇷 한국어"
permalink: /ko/
lang: ko
---

# [pose_estimation](https://github.com/europanite/pose_estimation "2D 이미지에서 포즈 추정을 수행하기 위한 컨테이너입니다.")

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
![OS](https://img.shields.io/badge/OS-Linux%20%7C%20macOS%20%7C%20Windows-blue)
[![Python](https://img.shields.io/badge/python-3.9|%203.10%20|%203.11|%203.12|%203.13-blue)](https://www.python.org/)

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

> [!NOTE]
> 이 문서는 README의 번역본입니다. 영어 버전이 기준 문서입니다.

2D 이미지에서 포즈 추정을 수행하기 위한 컨테이너입니다.

---

## Pose-to-VRM 본 매핑

backend는 BODY_25 스타일의 pose keypoints와 bone pairs를 반환합니다. MediaPipe mode에서는 `Neck`이 `LShoulder`와 `RShoulder`에서 합성되고, `MidHip`은 `LHip`과 `RHip`에서 합성됩니다. 추정된 pose를 VRM humanoid skeleton으로 전송할 때 아래 표를 사용하세요.

| 추정 pose vector | 입력 keypoints | VRM humanoid bone | 우선순위 | Notes |
|---|---|---|---|---|
| Body root | `MidHip`, `LHip`, `RHip` | `hips` | Required | 주로 root rotation에 사용합니다. 단일 이미지에서 얻은 root translation을 과신하지 마세요. |
| Spine | `MidHip -> Neck` | `spine` | Required | 상체의 기본 방향입니다. |
| Chest | `MidHip -> Neck` | `chest` | Recommended | 과도한 굽힘을 피하기 위해 `spine`보다 약한 weight로 적용합니다. |
| Upper chest | `MidHip -> Neck` | `upperChest` | Optional | 로드된 VRM model에 이 bone이 있을 때만 사용합니다. |
| Neck | `Neck -> Nose` | `neck` | Recommended | 단일 이미지 pose estimation에서는 head와 neck landmarks에 노이즈가 많으므로 부드럽게 적용합니다. |
| Head | `Neck -> Nose`, `Nose -> LEye`, `Nose -> REye`, `LEye -> LEar`, `REye -> REar` | `head` | Recommended | simple fallback은 `Neck -> Nose`만 사용할 수 있습니다. eye와 ear points는 바라보는 방향을 개선할 수 있습니다. |
| Left shoulder | `Neck -> LShoulder` | `leftShoulder` | Optional | VRM에 shoulder bones가 있을 때만 사용합니다. 이 bone 없이도 arm을 구동할 수 있습니다. |
| Left upper arm | `LShoulder -> LElbow` | `leftUpperArm` | Required | 왼쪽 상완의 기본 회전입니다. |
| Left lower arm | `LElbow -> LWrist` | `leftLowerArm` | Required | 왼쪽 전완의 기본 회전입니다. |
| Left hand | `LElbow -> LWrist` or hand landmarks | `leftHand` | Optional | BODY_25는 wrist orientation을 충분히 제공하지 않습니다. hand landmarks가 없으면 약한 fallback으로 사용하세요. |
| Right shoulder | `Neck -> RShoulder` | `rightShoulder` | Optional | VRM에 shoulder bones가 있을 때만 사용합니다. |
| Right upper arm | `RShoulder -> RElbow` | `rightUpperArm` | Required | 오른쪽 상완의 기본 회전입니다. |
| Right lower arm | `RElbow -> RWrist` | `rightLowerArm` | Required | 오른쪽 전완의 기본 회전입니다. |
| Right hand | `RElbow -> RWrist` or hand landmarks | `rightHand` | Optional | BODY_25는 wrist orientation을 충분히 제공하지 않습니다. hand landmarks가 없으면 약한 fallback으로 사용하세요. |
| Left upper leg | `LHip -> LKnee` | `leftUpperLeg` | Required | 왼쪽 허벅지의 기본 회전입니다. |
| Left lower leg | `LKnee -> LAnkle` | `leftLowerLeg` | Required | 왼쪽 정강이의 기본 회전입니다. |
| Left foot | `LAnkle -> LBigToe`, `LAnkle -> LHeel` | `leftFoot` | Recommended | toe와 heel points가 보일 때 사용합니다. |
| Left toes | `LHeel -> LBigToe` | `leftToes` | Optional | VRM에 toe bones가 있고 toe landmarks가 안정적일 때만 사용합니다. |
| Right upper leg | `RHip -> RKnee` | `rightUpperLeg` | Required | 오른쪽 허벅지의 기본 회전입니다. |
| Right lower leg | `RKnee -> RAnkle` | `rightLowerLeg` | Required | 오른쪽 정강이의 기본 회전입니다. |
| Right foot | `RAnkle -> RBigToe`, `RAnkle -> RHeel` | `rightFoot` | Recommended | toe와 heel points가 보일 때 사용합니다. |
| Right toes | `RHeel -> RBigToe` | `rightToes` | Optional | VRM에 toe bones가 있고 toe landmarks가 안정적일 때만 사용합니다. |
| Left eye | `Nose -> LEye` | `leftEye` | Optional | gaze 또는 expression features에만 필요합니다. |
| Right eye | `Nose -> REye` | `rightEye` | Optional | gaze 또는 expression features에만 필요합니다. |

최소한으로 유용한 VRM bones는 `spine`, `leftUpperArm`, `leftLowerArm`, `rightUpperArm`, `rightLowerArm`, `leftUpperLeg`, `leftLowerLeg`, `rightUpperLeg`, `rightLowerLeg`입니다. 이들이 안정된 후에는 더 읽기 쉬운 avatar pose를 위해 `hips`, `chest`, `neck`, `head`, `leftFoot`, `rightFoot`를 추가하세요.

---

## 프로젝트 시작하기

```bash
cp .env.example .env
docker compose up --build
```

브라우저를 엽니다:

```text
http://localhost:8081
```

API를 확인합니다:

```bash
curl http://localhost:8000/api/v1/health
```

---

## 사용 방법

1. "Select image"를 누릅니다.
2. image를 선택합니다.
3. image 위에 오버레이된 2D keypoints를 확인합니다.
4. 아래쪽 "3D skeleton check" view에서 pose direction을 확인합니다.

## Tests

backend tests 실행:

```bash
docker compose -f docker-compose.test.yml run --rm backend_test
```

frontend smoke test 실행:

```bash
docker compose -f docker-compose.yml -f docker-compose.test.yml run --rm frontend_test
```

---

## License
- Apache License 2.0
