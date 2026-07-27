---
layout: page
title: "🇧🇷 Português (Brasil)"
permalink: /pt-BR/
lang: pt-BR
---

# [pose_estimation](https://github.com/europanite/pose_estimation "Um contêiner para estimativa de pose a partir de imagens 2D.")

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
> Esta é uma versão traduzida do README. A versão em inglês é a fonte de referência.

Um contêiner para estimativa de pose a partir de imagens 2D.

---

## Mapeamento de ossos de Pose para VRM

O backend retorna keypoints de pose e pares de ossos no estilo BODY_25. No MediaPipe mode, `Neck` é sintetizado a partir de `LShoulder` e `RShoulder`, e `MidHip` é sintetizado a partir de `LHip` e `RHip`. Use a tabela abaixo ao transferir a pose estimada para um VRM humanoid skeleton.

| Vetor de pose estimado | Keypoints de entrada | VRM humanoid bone | Prioridade | Observações |
|---|---|---|---|---|
| Raiz do corpo | `MidHip`, `LHip`, `RHip` | `hips` | Required | Use principalmente para root rotation. Evite confiar em root translation a partir de uma única imagem. |
| Spine | `MidHip -> Neck` | `spine` | Required | Direção principal da parte superior do corpo. |
| Chest | `MidHip -> Neck` | `chest` | Recommended | Aplique com um weight mais fraco que `spine` para evitar curvatura exagerada. |
| Upper chest | `MidHip -> Neck` | `upperChest` | Optional | Use somente quando o VRM model carregado tiver este bone. |
| Neck | `Neck -> Nose` | `neck` | Recommended | Aplique com suavidade, porque os landmarks de head e neck são ruidosos na estimativa de pose com uma única imagem. |
| Head | `Neck -> Nose`, `Nose -> LEye`, `Nose -> REye`, `LEye -> LEar`, `REye -> REar` | `head` | Recommended | Um simple fallback pode usar apenas `Neck -> Nose`; eye e ear points podem melhorar a direção de orientação. |
| Left shoulder | `Neck -> LShoulder` | `leftShoulder` | Optional | Use somente quando o VRM tiver shoulder bones. O arm ainda pode ser controlado sem este bone. |
| Left upper arm | `LShoulder -> LElbow` | `leftUpperArm` | Required | Rotação principal do braço superior esquerdo. |
| Left lower arm | `LElbow -> LWrist` | `leftLowerArm` | Required | Rotação principal do antebraço esquerdo. |
| Left hand | `LElbow -> LWrist` or hand landmarks | `leftHand` | Optional | BODY_25 não fornece wrist orientation suficiente. Use um fallback fraco, a menos que hand landmarks estejam disponíveis. |
| Right shoulder | `Neck -> RShoulder` | `rightShoulder` | Optional | Use somente quando o VRM tiver shoulder bones. |
| Right upper arm | `RShoulder -> RElbow` | `rightUpperArm` | Required | Rotação principal do braço superior direito. |
| Right lower arm | `RElbow -> RWrist` | `rightLowerArm` | Required | Rotação principal do antebraço direito. |
| Right hand | `RElbow -> RWrist` or hand landmarks | `rightHand` | Optional | BODY_25 não fornece wrist orientation suficiente. Use um fallback fraco, a menos que hand landmarks estejam disponíveis. |
| Left upper leg | `LHip -> LKnee` | `leftUpperLeg` | Required | Rotação principal da coxa esquerda. |
| Left lower leg | `LKnee -> LAnkle` | `leftLowerLeg` | Required | Rotação principal da canela esquerda. |
| Left foot | `LAnkle -> LBigToe`, `LAnkle -> LHeel` | `leftFoot` | Recommended | Use toe e heel points quando estiverem visíveis. |
| Left toes | `LHeel -> LBigToe` | `leftToes` | Optional | Use somente quando o VRM tiver toe bones e os toe landmarks forem estáveis. |
| Right upper leg | `RHip -> RKnee` | `rightUpperLeg` | Required | Rotação principal da coxa direita. |
| Right lower leg | `RKnee -> RAnkle` | `rightLowerLeg` | Required | Rotação principal da canela direita. |
| Right foot | `RAnkle -> RBigToe`, `RAnkle -> RHeel` | `rightFoot` | Recommended | Use toe e heel points quando estiverem visíveis. |
| Right toes | `RHeel -> RBigToe` | `rightToes` | Optional | Use somente quando o VRM tiver toe bones e os toe landmarks forem estáveis. |
| Left eye | `Nose -> LEye` | `leftEye` | Optional | Necessário apenas para recursos de gaze ou expression. |
| Right eye | `Nose -> REye` | `rightEye` | Optional | Necessário apenas para recursos de gaze ou expression. |

Os VRM bones mínimos úteis são `spine`, `leftUpperArm`, `leftLowerArm`, `rightUpperArm`, `rightLowerArm`, `leftUpperLeg`, `leftLowerLeg`, `rightUpperLeg` e `rightLowerLeg`. Depois que eles estiverem estáveis, adicione `hips`, `chest`, `neck`, `head`, `leftFoot` e `rightFoot` para uma avatar pose mais legível.

---

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

---

## Como usar

1. Pressione "Select image".
2. Selecione uma image.
3. Confira os 2D keypoints sobrepostos na image.
4. Confira a pose direction na visualização inferior "3D skeleton check".

## Tests

Execute os backend tests:

```bash
docker compose -f docker-compose.test.yml run --rm backend_test
```

Execute o frontend smoke test:

```bash
docker compose -f docker-compose.yml -f docker-compose.test.yml run --rm frontend_test
```

---

## License
- Apache License 2.0
