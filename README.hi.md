---
layout: page
title: "🇮🇳 हिन्दी"
permalink: /hi/
lang: hi
---

# [pose_estimation](https://github.com/europanite/pose_estimation "pose_estimation")

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
![OS](https://img.shields.io/badge/OS-Linux%20%7C%20macOS%20%7C%20Windows-blue)
[![Python](https://img.shields.io/badge/python-3.9|%203.10%20|%203.11|%203.12|%203.13-blue)](https://www.python.org/)

[![CodeQL Advanced](https://github.com/europanite/pose_estimation/actions/workflows/codeql.yml/badge.svg)](https://github.com/europanite/pose_estimation/actions/workflows/codeql.yml)
[![CI](https://github.com/europanite/pose_estimation/actions/workflows/ci.yml/badge.svg)](https://github.com/europanite/pose_estimation/actions/workflows/ci.yml)
[![Python Lint](https://github.com/europanite/pose_estimation/actions/workflows/lint.yml/badge.svg)](https://github.com/europanite/pose_estimation/actions/workflows/lint.yml)

pose estimation.

!["web_ui"](./assets/images/web_ui.png)

## प्रोजेक्ट शुरू करें

```bash
cp .env.example .env
docker compose up --build
```

ब्राउज़र खोलें:

```text
http://localhost:8081
```

API जाँचें:

```bash
curl http://localhost:8000/api/v1/health
```

## उपयोग कैसे करें

1. "Select image" दबाएँ।
2. एक image चुनें।
3. image पर overlay किए गए 2D keypoints जाँचें।
4. नीचे दिए गए "3D skeleton check" view में pose direction जाँचें।

## Tests

backend tests चलाएँ:

```bash
docker compose -f docker-compose.test.yml run --rm backend_test
```

frontend smoke test चलाएँ:

```bash
docker compose -f docker-compose.yml -f docker-compose.test.yml run --rm frontend_test
```
