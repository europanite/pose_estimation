---
layout: page
title: "🇰🇷 한국어"
permalink: /ko/
lang: ko
---

# [pose_estimation](https://github.com/europanite/pose_estimation "pose_estimation")

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
![OS](https://img.shields.io/badge/OS-Linux%20%7C%20macOS%20%7C%20Windows-blue)
[![Python](https://img.shields.io/badge/python-3.9|%203.10%20|%203.11|%203.12|%203.13-blue)](https://www.python.org/)

[![CodeQL Advanced](https://github.com/europanite/pose_estimation/actions/workflows/codeql.yml/badge.svg)](https://github.com/europanite/pose_estimation/actions/workflows/codeql.yml)
[![CI](https://github.com/europanite/pose_estimation/actions/workflows/ci.yml/badge.svg)](https://github.com/europanite/pose_estimation/actions/workflows/ci.yml)
[![Python Lint](https://github.com/europanite/pose_estimation/actions/workflows/lint.yml/badge.svg)](https://github.com/europanite/pose_estimation/actions/workflows/lint.yml)

포즈 추정.

!["web_ui"](./assets/images/web_ui.png)

## 프로젝트 시작하기

```bash
cp .env.example .env
docker compose up --build
```

브라우저 열기:

```text
http://localhost:8081
```

API 확인:

```bash
curl http://localhost:8000/api/v1/health
```

## 사용 방법

1. "Select image"를 누릅니다.
2. 이미지를 선택합니다.
3. 이미지 위에 오버레이된 2D keypoints를 확인합니다.
4. 아래쪽 "3D skeleton check" view에서 pose direction을 확인합니다.

## 테스트

backend tests 실행:

```bash
docker compose -f docker-compose.test.yml run --rm backend_test
```

frontend smoke test 실행:

```bash
docker compose -f docker-compose.yml -f docker-compose.test.yml run --rm frontend_test
```
