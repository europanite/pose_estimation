---
layout: page
title: "🇫🇷 Français"
permalink: /fr/
lang: fr
---

# [pose_estimation](https://github.com/europanite/pose_estimation "pose_estimation")

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
![OS](https://img.shields.io/badge/OS-Linux%20%7C%20macOS%20%7C%20Windows-blue)
[![Python](https://img.shields.io/badge/python-3.9|%203.10%20|%203.11|%203.12|%203.13-blue)](https://www.python.org/)

[![CodeQL Advanced](https://github.com/europanite/pose_estimation/actions/workflows/codeql.yml/badge.svg)](https://github.com/europanite/pose_estimation/actions/workflows/codeql.yml)
[![CI](https://github.com/europanite/pose_estimation/actions/workflows/ci.yml/badge.svg)](https://github.com/europanite/pose_estimation/actions/workflows/ci.yml)
[![Python Lint](https://github.com/europanite/pose_estimation/actions/workflows/lint.yml/badge.svg)](https://github.com/europanite/pose_estimation/actions/workflows/lint.yml)

Estimation de pose.

!["web_ui"](./assets/images/web_ui.png)

## Démarrer le projet

```bash
cp .env.example .env
docker compose up --build
```

Ouvrir le navigateur :

```text
http://localhost:8081
```

Vérifier l’API :

```bash
curl http://localhost:8000/api/v1/health
```

## Utilisation

1. Appuyez sur "Select image".
2. Sélectionnez une image.
3. Vérifiez les 2D keypoints superposés à l’image.
4. Vérifiez la pose direction dans la vue inférieure "3D skeleton check".

## Tests

Exécuter les backend tests :

```bash
docker compose -f docker-compose.test.yml run --rm backend_test
```

Exécuter le frontend smoke test :

```bash
docker compose -f docker-compose.yml -f docker-compose.test.yml run --rm frontend_test
```
