---
layout: page
title: "🇨🇳 简体中文"
permalink: /zh-CN/
lang: zh-CN
---

# [pose_estimation](https://github.com/europanite/pose_estimation "用于从 2D 图像进行姿态估计的容器。")

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
> 这是 README 的翻译版本。英文版本是权威版本。

用于从 2D 图像进行姿态估计的容器。

---

## Pose-to-VRM 骨骼映射

后端会返回 BODY_25 风格的姿态关键点和骨骼对。在 MediaPipe mode 中，`Neck` 由 `LShoulder` 和 `RShoulder` 合成，`MidHip` 由 `LHip` 和 `RHip` 合成。将估计出的姿态迁移到 VRM humanoid skeleton 时，请使用下表。

| 估计姿态向量 | 输入关键点 | VRM humanoid bone | 优先级 | 说明 |
|---|---|---|---|---|
| 身体根部 | `MidHip`, `LHip`, `RHip` | `hips` | Required | 主要用于 root rotation。不要过度信任来自单张图像的 root translation。 |
| Spine | `MidHip -> Neck` | `spine` | Required | 上半身的主要方向。 |
| Chest | `MidHip -> Neck` | `chest` | Recommended | 使用比 `spine` 更弱的 weight，避免弯曲过度夸张。 |
| Upper chest | `MidHip -> Neck` | `upperChest` | Optional | 仅当加载的 VRM model 具有此 bone 时使用。 |
| Neck | `Neck -> Nose` | `neck` | Recommended | 单图姿态估计中的 head 和 neck landmarks 噪声较大，因此应轻柔应用。 |
| Head | `Neck -> Nose`, `Nose -> LEye`, `Nose -> REye`, `LEye -> LEar`, `REye -> REar` | `head` | Recommended | simple fallback 可以只使用 `Neck -> Nose`；eye 和 ear points 可以改善朝向估计。 |
| Left shoulder | `Neck -> LShoulder` | `leftShoulder` | Optional | 仅当 VRM 具有 shoulder bones 时使用。即使没有此 bone，也可以驱动 arm。 |
| Left upper arm | `LShoulder -> LElbow` | `leftUpperArm` | Required | 左上臂的主要旋转。 |
| Left lower arm | `LElbow -> LWrist` | `leftLowerArm` | Required | 左前臂的主要旋转。 |
| Left hand | `LElbow -> LWrist` or hand landmarks | `leftHand` | Optional | BODY_25 无法提供足够的 wrist orientation。除非有 hand landmarks，否则请使用较弱的 fallback。 |
| Right shoulder | `Neck -> RShoulder` | `rightShoulder` | Optional | 仅当 VRM 具有 shoulder bones 时使用。 |
| Right upper arm | `RShoulder -> RElbow` | `rightUpperArm` | Required | 右上臂的主要旋转。 |
| Right lower arm | `RElbow -> RWrist` | `rightLowerArm` | Required | 右前臂的主要旋转。 |
| Right hand | `RElbow -> RWrist` or hand landmarks | `rightHand` | Optional | BODY_25 无法提供足够的 wrist orientation。除非有 hand landmarks，否则请使用较弱的 fallback。 |
| Left upper leg | `LHip -> LKnee` | `leftUpperLeg` | Required | 左大腿的主要旋转。 |
| Left lower leg | `LKnee -> LAnkle` | `leftLowerLeg` | Required | 左小腿的主要旋转。 |
| Left foot | `LAnkle -> LBigToe`, `LAnkle -> LHeel` | `leftFoot` | Recommended | toe 和 heel points 可见时使用。 |
| Left toes | `LHeel -> LBigToe` | `leftToes` | Optional | 仅当 VRM 具有 toe bones 且 toe landmarks 稳定时使用。 |
| Right upper leg | `RHip -> RKnee` | `rightUpperLeg` | Required | 右大腿的主要旋转。 |
| Right lower leg | `RKnee -> RAnkle` | `rightLowerLeg` | Required | 右小腿的主要旋转。 |
| Right foot | `RAnkle -> RBigToe`, `RAnkle -> RHeel` | `rightFoot` | Recommended | toe 和 heel points 可见时使用。 |
| Right toes | `RHeel -> RBigToe` | `rightToes` | Optional | 仅当 VRM 具有 toe bones 且 toe landmarks 稳定时使用。 |
| Left eye | `Nose -> LEye` | `leftEye` | Optional | 仅 gaze 或 expression features 需要。 |
| Right eye | `Nose -> REye` | `rightEye` | Optional | 仅 gaze 或 expression features 需要。 |

最小可用的 VRM bones 是 `spine`, `leftUpperArm`, `leftLowerArm`, `rightUpperArm`, `rightLowerArm`, `leftUpperLeg`, `leftLowerLeg`, `rightUpperLeg` 和 `rightLowerLeg`。这些稳定后，再添加 `hips`, `chest`, `neck`, `head`, `leftFoot` 和 `rightFoot`，以获得更易读的 avatar pose。

---

## 启动项目

```bash
cp .env.example .env
docker compose up --build
```

打开浏览器：

```text
http://localhost:8081
```

检查 API：

```bash
curl http://localhost:8000/api/v1/health
```

---

## 使用方法

1. 按下 "Select image"。
2. 选择一张 image。
3. 查看叠加在 image 上的 2D keypoints。
4. 在下方的 "3D skeleton check" view 中查看 pose direction。

## Tests

运行 backend tests：

```bash
docker compose -f docker-compose.test.yml run --rm backend_test
```

运行 frontend smoke test：

```bash
docker compose -f docker-compose.yml -f docker-compose.test.yml run --rm frontend_test
```

---

## License
- Apache License 2.0
