# [pose_estimation](https://github.com/europanite/pose_estimation "pose_estimation")

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
![OS](https://img.shields.io/badge/OS-Linux%20%7C%20macOS%20%7C%20Windows-blue)
[![Python](https://img.shields.io/badge/python-3.9|%203.10%20|%203.11|%203.12|%203.13-blue)](https://www.python.org/)

[![CodeQL Advanced](https://github.com/europanite/pose_estimation/actions/workflows/codeql.yml/badge.svg)](https://github.com/europanite/pose_estimation/actions/workflows/codeql.yml)
[![CI](https://github.com/europanite/pose_estimation/actions/workflows/ci.yml/badge.svg)](https://github.com/europanite/pose_estimation/actions/workflows/ci.yml)
[![Python Lint](https://github.com/europanite/pose_estimation/actions/workflows/lint.yml/badge.svg)](https://github.com/europanite/pose_estimation/actions/workflows/lint.yml)

This is a Docker Compose project for loading an image, estimating the human pose, and checking the result with a 2D overlay and a simple 3D skeleton view.

!["web_ui"](./assets/images/web_ui.png)

## Summary

- Running OpenPose itself only inside a TypeScript + Expo frontend is not realistic.
- This project uses `POSE_BACKEND=mediapipe` so the basic flow can run reliably first.

## Start the project

```bash
cp .env.example .env
docker compose up --build
```

Open the browser:

```text
http://localhost:8081
```

Check the API:

```bash
curl http://localhost:8000/api/v1/health
```

## How to use

1. Press "Select image".
2. Select an image.
3. Check the 2D keypoints overlaid on the image.
4. Check the pose direction in the lower "3D skeleton check" view.

## Tests

Run the backend tests:

```bash
docker compose -f docker-compose.test.yml run --rm backend_test
```

Run the frontend smoke test:

```bash
docker compose -f docker-compose.yml -f docker-compose.test.yml run --rm frontend_test
```
