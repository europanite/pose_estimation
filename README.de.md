---
layout: page
title: "🇩🇪 Deutsch"
permalink: /de/
lang: de
---

# [pose_estimation](https://github.com/europanite/pose_estimation "pose_estimation")

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

Pose-Schätzung.

!["web_ui"](./assets/images/web_ui.png)

## Projekt starten

```bash
cp .env.example .env
docker compose up --build
```

Browser öffnen:

```text
http://localhost:8081
```

API prüfen:

```bash
curl http://localhost:8000/api/v1/health
```

## Verwendung

1. Drücke "Select image".
2. Wähle ein Bild aus.
3. Prüfe die 2D keypoints, die über das Bild gelegt sind.
4. Prüfe die pose direction in der unteren Ansicht "3D skeleton check".

## Tests

Backend-Tests ausführen:

```bash
docker compose -f docker-compose.test.yml run --rm backend_test
```

Frontend-Smoke-Test ausführen:

```bash
docker compose -f docker-compose.yml -f docker-compose.test.yml run --rm frontend_test
```
