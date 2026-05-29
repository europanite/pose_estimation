---
layout: page
title: "🇯🇵 日本語"
permalink: /ja/
lang: ja
---

# [pose_estimation](https://github.com/europanite/pose_estimation "2D画像から姿勢推定を行うためのコンテナ。")

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
> これは README の翻訳版です。英語版が正本です。

2D画像から姿勢推定を行うためのコンテナです。

---

## Pose-to-VRM ボーン対応表

バックエンドは BODY_25 形式の姿勢キーポイントとボーンペアを返します。MediaPipe モードでは、`Neck` は `LShoulder` と `RShoulder` から合成され、`MidHip` は `LHip` と `RHip` から合成されます。推定された姿勢を VRM ヒューマノイドスケルトンへ転送する際は、以下の表を使用してください。

| 推定姿勢ベクトル | 入力キーポイント | VRM humanoid bone | 優先度 | Notes |
|---|---|---|---|---|
| 体幹ルート | `MidHip`, `LHip`, `RHip` | `hips` | Required | 主にルート回転に使用します。単一画像から得たルート平行移動は信頼しすぎないでください。 |
| Spine | `MidHip -> Neck` | `spine` | Required | 上半身の主方向です。 |
| Chest | `MidHip -> Neck` | `chest` | Recommended | 曲がりが誇張されないよう、`spine` より弱い weight で適用します。 |
| Upper chest | `MidHip -> Neck` | `upperChest` | Optional | 読み込んだ VRM model にこの bone がある場合のみ使用します。 |
| Neck | `Neck -> Nose` | `neck` | Recommended | 単一画像の姿勢推定では head と neck の landmarks がノイズを含みやすいため、控えめに適用します。 |
| Head | `Neck -> Nose`, `Nose -> LEye`, `Nose -> REye`, `LEye -> LEar`, `REye -> REar` | `head` | Recommended | simple fallback では `Neck -> Nose` のみを使用できます。eye と ear points を使うと向きの推定を改善できます。 |
| Left shoulder | `Neck -> LShoulder` | `leftShoulder` | Optional | VRM に shoulder bones がある場合のみ使用します。この bone がなくても arm は駆動できます。 |
| Left upper arm | `LShoulder -> LElbow` | `leftUpperArm` | Required | 左上腕の主回転です。 |
| Left lower arm | `LElbow -> LWrist` | `leftLowerArm` | Required | 左前腕の主回転です。 |
| Left hand | `LElbow -> LWrist` or hand landmarks | `leftHand` | Optional | BODY_25 だけでは wrist orientation が十分に得られません。hand landmarks がない場合は弱い fallback として使用してください。 |
| Right shoulder | `Neck -> RShoulder` | `rightShoulder` | Optional | VRM に shoulder bones がある場合のみ使用します。 |
| Right upper arm | `RShoulder -> RElbow` | `rightUpperArm` | Required | 右上腕の主回転です。 |
| Right lower arm | `RElbow -> RWrist` | `rightLowerArm` | Required | 右前腕の主回転です。 |
| Right hand | `RElbow -> RWrist` or hand landmarks | `rightHand` | Optional | BODY_25 だけでは wrist orientation が十分に得られません。hand landmarks がない場合は弱い fallback として使用してください。 |
| Left upper leg | `LHip -> LKnee` | `leftUpperLeg` | Required | 左大腿の主回転です。 |
| Left lower leg | `LKnee -> LAnkle` | `leftLowerLeg` | Required | 左すねの主回転です。 |
| Left foot | `LAnkle -> LBigToe`, `LAnkle -> LHeel` | `leftFoot` | Recommended | toe と heel points が見えている場合に使用します。 |
| Left toes | `LHeel -> LBigToe` | `leftToes` | Optional | VRM に toe bones があり、toe landmarks が安定している場合のみ使用します。 |
| Right upper leg | `RHip -> RKnee` | `rightUpperLeg` | Required | 右大腿の主回転です。 |
| Right lower leg | `RKnee -> RAnkle` | `rightLowerLeg` | Required | 右すねの主回転です。 |
| Right foot | `RAnkle -> RBigToe`, `RAnkle -> RHeel` | `rightFoot` | Recommended | toe と heel points が見えている場合に使用します。 |
| Right toes | `RHeel -> RBigToe` | `rightToes` | Optional | VRM に toe bones があり、toe landmarks が安定している場合のみ使用します。 |
| Left eye | `Nose -> LEye` | `leftEye` | Optional | 視線または表情機能でのみ必要です。 |
| Right eye | `Nose -> REye` | `rightEye` | Optional | 視線または表情機能でのみ必要です。 |

最小限有用な VRM bones は `spine`, `leftUpperArm`, `leftLowerArm`, `rightUpperArm`, `rightLowerArm`, `leftUpperLeg`, `leftLowerLeg`, `rightUpperLeg`, `rightLowerLeg` です。これらが安定したら、より読み取りやすい avatar pose のために `hips`, `chest`, `neck`, `head`, `leftFoot`, `rightFoot` を追加します。

---

## プロジェクトを開始する

```bash
cp .env.example .env
docker compose up --build
```

ブラウザを開きます:

```text
http://localhost:8081
```

API を確認します:

```bash
curl http://localhost:8000/api/v1/health
```

---

## 使い方

1. "Select image" を押します。
2. 画像を選択します。
3. 画像上に重ねて表示された 2D keypoints を確認します。
4. 下部の "3D skeleton check" view で pose direction を確認します。

## Tests

backend tests を実行します:

```bash
docker compose -f docker-compose.test.yml run --rm backend_test
```

frontend smoke test を実行します:

```bash
docker compose -f docker-compose.yml -f docker-compose.test.yml run --rm frontend_test
```

---

## License
- Apache License 2.0
