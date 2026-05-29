---
layout: page
title: "🇪🇸 Español"
permalink: /es/
lang: es
---

# [pose_estimation](https://github.com/europanite/pose_estimation "Un contenedor para estimación de pose a partir de imágenes 2D.")

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
> Esta es una versión traducida del README. La versión en inglés es la fuente de referencia.

Un contenedor para estimación de pose a partir de imágenes 2D.

---

## Mapeo de huesos de Pose a VRM

El backend devuelve keypoints de pose y pares de huesos con estilo BODY_25. En MediaPipe mode, `Neck` se sintetiza a partir de `LShoulder` y `RShoulder`, y `MidHip` se sintetiza a partir de `LHip` y `RHip`. Usa la tabla siguiente al transferir la pose estimada a un VRM humanoid skeleton.

| Vector de pose estimado | Keypoints de entrada | VRM humanoid bone | Prioridad | Notas |
|---|---|---|---|---|
| Raíz del cuerpo | `MidHip`, `LHip`, `RHip` | `hips` | Required | Úsalo principalmente para root rotation. Evita confiar en root translation a partir de una sola imagen. |
| Spine | `MidHip -> Neck` | `spine` | Required | Dirección principal de la parte superior del cuerpo. |
| Chest | `MidHip -> Neck` | `chest` | Recommended | Aplícalo con un weight más débil que `spine` para evitar una flexión exagerada. |
| Upper chest | `MidHip -> Neck` | `upperChest` | Optional | Úsalo solo cuando el VRM model cargado tenga este bone. |
| Neck | `Neck -> Nose` | `neck` | Recommended | Aplícalo suavemente, porque los landmarks de head y neck son ruidosos en la estimación de pose con una sola imagen. |
| Head | `Neck -> Nose`, `Nose -> LEye`, `Nose -> REye`, `LEye -> LEar`, `REye -> REar` | `head` | Recommended | Un simple fallback puede usar solo `Neck -> Nose`; los eye y ear points pueden mejorar la dirección de orientación. |
| Left shoulder | `Neck -> LShoulder` | `leftShoulder` | Optional | Úsalo solo cuando el VRM tenga shoulder bones. El arm puede controlarse incluso sin este bone. |
| Left upper arm | `LShoulder -> LElbow` | `leftUpperArm` | Required | Rotación principal del brazo superior izquierdo. |
| Left lower arm | `LElbow -> LWrist` | `leftLowerArm` | Required | Rotación principal del antebrazo izquierdo. |
| Left hand | `LElbow -> LWrist` or hand landmarks | `leftHand` | Optional | BODY_25 no proporciona suficiente wrist orientation. Usa un fallback débil salvo que estén disponibles los hand landmarks. |
| Right shoulder | `Neck -> RShoulder` | `rightShoulder` | Optional | Úsalo solo cuando el VRM tenga shoulder bones. |
| Right upper arm | `RShoulder -> RElbow` | `rightUpperArm` | Required | Rotación principal del brazo superior derecho. |
| Right lower arm | `RElbow -> RWrist` | `rightLowerArm` | Required | Rotación principal del antebrazo derecho. |
| Right hand | `RElbow -> RWrist` or hand landmarks | `rightHand` | Optional | BODY_25 no proporciona suficiente wrist orientation. Usa un fallback débil salvo que estén disponibles los hand landmarks. |
| Left upper leg | `LHip -> LKnee` | `leftUpperLeg` | Required | Rotación principal del muslo izquierdo. |
| Left lower leg | `LKnee -> LAnkle` | `leftLowerLeg` | Required | Rotación principal de la espinilla izquierda. |
| Left foot | `LAnkle -> LBigToe`, `LAnkle -> LHeel` | `leftFoot` | Recommended | Usa toe y heel points cuando sean visibles. |
| Left toes | `LHeel -> LBigToe` | `leftToes` | Optional | Úsalo solo cuando el VRM tenga toe bones y los toe landmarks sean estables. |
| Right upper leg | `RHip -> RKnee` | `rightUpperLeg` | Required | Rotación principal del muslo derecho. |
| Right lower leg | `RKnee -> RAnkle` | `rightLowerLeg` | Required | Rotación principal de la espinilla derecha. |
| Right foot | `RAnkle -> RBigToe`, `RAnkle -> RHeel` | `rightFoot` | Recommended | Usa toe y heel points cuando sean visibles. |
| Right toes | `RHeel -> RBigToe` | `rightToes` | Optional | Úsalo solo cuando el VRM tenga toe bones y los toe landmarks sean estables. |
| Left eye | `Nose -> LEye` | `leftEye` | Optional | Solo es necesario para funciones de gaze o expression. |
| Right eye | `Nose -> REye` | `rightEye` | Optional | Solo es necesario para funciones de gaze o expression. |

Los VRM bones mínimos útiles son `spine`, `leftUpperArm`, `leftLowerArm`, `rightUpperArm`, `rightLowerArm`, `leftUpperLeg`, `leftLowerLeg`, `rightUpperLeg` y `rightLowerLeg`. Cuando estos sean estables, añade `hips`, `chest`, `neck`, `head`, `leftFoot` y `rightFoot` para obtener una avatar pose más legible.

---

## Iniciar el proyecto

```bash
cp .env.example .env
docker compose up --build
```

Abre el navegador:

```text
http://localhost:8081
```

Comprueba la API:

```bash
curl http://localhost:8000/api/v1/health
```

---

## Cómo usarlo

1. Pulsa "Select image".
2. Selecciona una image.
3. Revisa los 2D keypoints superpuestos sobre la image.
4. Revisa la pose direction en la vista inferior "3D skeleton check".

## Tests

Ejecuta los backend tests:

```bash
docker compose -f docker-compose.test.yml run --rm backend_test
```

Ejecuta el frontend smoke test:

```bash
docker compose -f docker-compose.yml -f docker-compose.test.yml run --rm frontend_test
```

---

## License
- Apache License 2.0
