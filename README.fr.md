---
layout: page
title: "🇫🇷 Français"
permalink: /fr/
lang: fr
---

# [pose_estimation](https://github.com/europanite/pose_estimation "Un conteneur pour l’estimation de pose à partir d’images 2D.")

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
![OS](https://img.shields.io/badge/OS-Linux%20%7C%20macOS%20%7C%20Windows-blue)
[![Python](https://img.shields.io/badge/python-3.10%20|%203.11|%203.12|%203.13-blue)](https://www.python.org/)

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
> Ceci est une version traduite du README. La version anglaise fait foi.

Un conteneur pour l’estimation de pose à partir d’images 2D.

---

## Correspondance des bones Pose-to-VRM

Le backend renvoie des pose keypoints et des bone pairs de type BODY_25. En MediaPipe mode, `Neck` est synthétisé à partir de `LShoulder` et `RShoulder`, et `MidHip` est synthétisé à partir de `LHip` et `RHip`. Utilisez le tableau ci-dessous lors du transfert de la pose estimée vers un VRM humanoid skeleton.

| Vecteur de pose estimé | Keypoints d’entrée | VRM humanoid bone | Priorité | Notes |
|---|---|---|---|---|
| Racine du corps | `MidHip`, `LHip`, `RHip` | `hips` | Required | Utilisez-le principalement pour la root rotation. Évitez de vous fier à la root translation à partir d’une seule image. |
| Spine | `MidHip -> Neck` | `spine` | Required | Direction principale du haut du corps. |
| Chest | `MidHip -> Neck` | `chest` | Recommended | Appliquez-le avec un weight plus faible que `spine` afin d’éviter une flexion exagérée. |
| Upper chest | `MidHip -> Neck` | `upperChest` | Optional | À utiliser uniquement lorsque le VRM model chargé possède ce bone. |
| Neck | `Neck -> Nose` | `neck` | Recommended | Appliquez-le avec modération, car les landmarks de head et neck sont bruités dans l’estimation de pose à partir d’une seule image. |
| Head | `Neck -> Nose`, `Nose -> LEye`, `Nose -> REye`, `LEye -> LEar`, `REye -> REar` | `head` | Recommended | Un simple fallback peut n’utiliser que `Neck -> Nose`; les eye et ear points peuvent améliorer la direction du regard. |
| Left shoulder | `Neck -> LShoulder` | `leftShoulder` | Optional | À utiliser uniquement lorsque le VRM possède des shoulder bones. L’arm peut tout de même être piloté sans ce bone. |
| Left upper arm | `LShoulder -> LElbow` | `leftUpperArm` | Required | Rotation principale du haut du bras gauche. |
| Left lower arm | `LElbow -> LWrist` | `leftLowerArm` | Required | Rotation principale de l’avant-bras gauche. |
| Left hand | `LElbow -> LWrist` or hand landmarks | `leftHand` | Optional | BODY_25 ne fournit pas assez d’informations de wrist orientation. Utilisez un fallback faible sauf si les hand landmarks sont disponibles. |
| Right shoulder | `Neck -> RShoulder` | `rightShoulder` | Optional | À utiliser uniquement lorsque le VRM possède des shoulder bones. |
| Right upper arm | `RShoulder -> RElbow` | `rightUpperArm` | Required | Rotation principale du haut du bras droit. |
| Right lower arm | `RElbow -> RWrist` | `rightLowerArm` | Required | Rotation principale de l’avant-bras droit. |
| Right hand | `RElbow -> RWrist` or hand landmarks | `rightHand` | Optional | BODY_25 ne fournit pas assez d’informations de wrist orientation. Utilisez un fallback faible sauf si les hand landmarks sont disponibles. |
| Left upper leg | `LHip -> LKnee` | `leftUpperLeg` | Required | Rotation principale de la cuisse gauche. |
| Left lower leg | `LKnee -> LAnkle` | `leftLowerLeg` | Required | Rotation principale du tibia gauche. |
| Left foot | `LAnkle -> LBigToe`, `LAnkle -> LHeel` | `leftFoot` | Recommended | Utilisez les toe et heel points lorsqu’ils sont visibles. |
| Left toes | `LHeel -> LBigToe` | `leftToes` | Optional | À utiliser uniquement lorsque le VRM possède des toe bones et que les toe landmarks sont stables. |
| Right upper leg | `RHip -> RKnee` | `rightUpperLeg` | Required | Rotation principale de la cuisse droite. |
| Right lower leg | `RKnee -> RAnkle` | `rightLowerLeg` | Required | Rotation principale du tibia droit. |
| Right foot | `RAnkle -> RBigToe`, `RAnkle -> RHeel` | `rightFoot` | Recommended | Utilisez les toe et heel points lorsqu’ils sont visibles. |
| Right toes | `RHeel -> RBigToe` | `rightToes` | Optional | À utiliser uniquement lorsque le VRM possède des toe bones et que les toe landmarks sont stables. |
| Left eye | `Nose -> LEye` | `leftEye` | Optional | Nécessaire uniquement pour les fonctionnalités de gaze ou d’expression. |
| Right eye | `Nose -> REye` | `rightEye` | Optional | Nécessaire uniquement pour les fonctionnalités de gaze ou d’expression. |

Les VRM bones utiles au minimum sont `spine`, `leftUpperArm`, `leftLowerArm`, `rightUpperArm`, `rightLowerArm`, `leftUpperLeg`, `leftLowerLeg`, `rightUpperLeg` et `rightLowerLeg`. Une fois ces éléments stables, ajoutez `hips`, `chest`, `neck`, `head`, `leftFoot` et `rightFoot` pour obtenir une avatar pose plus lisible.

---

## Démarrer le projet

```bash
cp .env.example .env
docker compose up --build
```

Ouvrez le navigateur :

```text
http://localhost:8081
```

Vérifiez l’API :

```bash
curl http://localhost:8000/api/v1/health
```

---

## Utilisation

1. Appuyez sur "Select image".
2. Sélectionnez une image.
3. Vérifiez les 2D keypoints superposés sur l’image.
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

---

## License
- Apache License 2.0
