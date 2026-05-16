---
layout: page
title: "🇧🇷 PT-BR"
permalink: /pt-BR/
lang: pt-BR
---

# [pose_estimation](https://github.com/europanite/pose_estimation "pose_estimation")

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
![OS](https://img.shields.io/badge/OS-Linux%20%7C%20macOS%20%7C%20Windows-blue)
[![Python](https://img.shields.io/badge/python-3.9|%203.10%20|%203.11|%203.12|%203.13-blue)](https://www.python.org/)

[![CodeQL Advanced](https://github.com/europanite/pose_estimation/actions/workflows/codeql.yml/badge.svg)](https://github.com/europanite/pose_estimation/actions/workflows/codeql.yml)
[![CI](https://github.com/europanite/pose_estimation/actions/workflows/ci.yml/badge.svg)](https://github.com/europanite/pose_estimation/actions/workflows/ci.yml)
[![Python Lint](https://github.com/europanite/pose_estimation/actions/workflows/lint.yml/badge.svg)](https://github.com/europanite/pose_estimation/actions/workflows/lint.yml)

Estimativa de pose.

!["web_ui"](./assets/images/web_ui.png)

## Iniciar o projeto

```bash
cp .env.example .env
docker compose up --build
```

Abra o navegador:

```text
http://localhost:8081
```

Verifique a API:

```bash
curl http://localhost:8000/api/v1/health
```

## Como usar

1. Pressione "Select image".
2. Selecione uma imagem.
3. Verifique os 2D keypoints sobrepostos na imagem.
4. Verifique a pose direction na visualização inferior "3D skeleton check".

## Testes

Execute os backend tests:

```bash
docker compose -f docker-compose.test.yml run --rm backend_test
```

Execute o frontend smoke test:

```bash
docker compose -f docker-compose.yml -f docker-compose.test.yml run --rm frontend_test
```
