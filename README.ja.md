---
layout: page
title: "🇯🇵 日本語"
permalink: /ja/
lang: ja
---

# [pose_estimation](https://github.com/europanite/pose_estimation "pose_estimation")

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
![OS](https://img.shields.io/badge/OS-Linux%20%7C%20macOS%20%7C%20Windows-blue)
[![Python](https://img.shields.io/badge/python-3.9|%203.10%20|%203.11|%203.12|%203.13-blue)](https://www.python.org/)

[![CodeQL Advanced](https://github.com/europanite/pose_estimation/actions/workflows/codeql.yml/badge.svg)](https://github.com/europanite/pose_estimation/actions/workflows/codeql.yml)
[![CI](https://github.com/europanite/pose_estimation/actions/workflows/ci.yml/badge.svg)](https://github.com/europanite/pose_estimation/actions/workflows/ci.yml)
[![Python Lint](https://github.com/europanite/pose_estimation/actions/workflows/lint.yml/badge.svg)](https://github.com/europanite/pose_estimation/actions/workflows/lint.yml)

姿勢推定。

!["web_ui"](./assets/images/web_ui.png)

## プロジェクトを開始する

```bash
cp .env.example .env
docker compose up --build
```

ブラウザーを開く:

```text
http://localhost:8081
```

API を確認する:

```bash
curl http://localhost:8000/api/v1/health
```

## 使い方

1. "Select image" を押す。
2. 画像を選択する。
3. 画像上に重ねて表示された 2D keypoints を確認する。
4. 下部の "3D skeleton check" ビューで pose direction を確認する。

## テスト

backend tests を実行する:

```bash
docker compose -f docker-compose.test.yml run --rm backend_test
```

frontend smoke test を実行する:

```bash
docker compose -f docker-compose.yml -f docker-compose.test.yml run --rm frontend_test
```
