# [pose_estimation](https://github.com/europanite/pose_estimation "pose_estimation")

This is a Docker Compose project for loading an image, estimating the human pose, and checking the result with a 2D overlay and a simple 3D skeleton view.

!["web_ui"](./assets/images/web_ui.png)

## Summary

- Running OpenPose itself only inside a TypeScript + Expo frontend is not realistic.
- This project uses `POSE_BACKEND=mediapipe` by default so the basic flow can run reliably first.
- Setting `POSE_BACKEND=openpose` switches the API to read OpenPose JSON output. OpenPose itself and its model files are required.

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

1. Press "Select image and estimate pose".
2. Select an image.
3. Check the 2D keypoints overlaid on the image.
4. Check the pose direction in the lower "3D skeleton check" view.

## OpenPose mode

To use OpenPose itself:

```bash
POSE_BACKEND=openpose docker compose -f docker-compose.yml -f docker-compose.openpose.yml up --build
```

Notes:

- Building OpenPose is heavy.
- NVIDIA Container Toolkit is required when using an NVIDIA GPU.
- OpenPose model files are not included in this ZIP. Place them under `./models/openpose`.
- `docker/openpose-api.Dockerfile` is a starting point for building OpenPose from source. CUDA, CMake, and Caffe-related behavior may differ by environment.

## Frontend-only option

If OpenPose is not required, switching to MediaPipe Pose Landmarker, TensorFlow.js MoveNet, or BlazePose is the more realistic frontend-based approach.

- Expo Web: supported.
- Expo Go / iOS / Android: Web/WASM libraries may not run as-is, so a native implementation or server API is recommended.
- 3D display: `three` + `@react-three/fiber` is convenient for Expo Web.
- Full 3D model retargeting: a GLB/VRM bone mapping table and IK correction are required.

## Directory layout

```text
backend/                      FastAPI pose API
frontend/                 Expo + TypeScript UI
docker/openpose-api.Dockerfile  Heavy optional OpenPose build image
models/openpose/          OpenPose model directory on the host
```

## Next extension points

- GLB/VRM model loading.
- Conversion tables between BODY_25, COCO, and MediaPipe 33-point formats.
- Per-bone quaternion calculation.
- IK correction.
- Multi-person support.
- Video and camera input support.

## Change notes

- `@expo/webpack-config@19.0.1` was removed because it causes a peer dependency conflict with Expo SDK 51. Expo Web runs with the Metro bundler as configured in `app.json`.
- The frontend runs with `expo start --web --offline --port 8081` so startup does not stop even if Expo SDK metadata cannot be fetched inside a restricted Docker network.
- If failed dependency state from a previous build remains, run the following commands and rebuild cleanly.

```bash
docker compose down -v
docker compose build --no-cache frontend
docker compose up
```

## Troubleshooting: Expo is not installed in the frontend container

If the frontend log says `Cannot determine the project's Expo SDK version because the module expo is not installed`, the usual cause is that `/app` was bind-mounted over the image contents or an old empty `frontend_node_modules` volume was reused.

This version avoids that by not bind-mounting `./frontend` into the container. Rebuild cleanly:

```bash
docker compose down -v
docker compose build --no-cache frontend
docker compose up
```

The frontend command uses the local `expo` binary installed by `npm ci` and runs Expo in offline mode to avoid startup-time SDK metadata fetch failures inside restricted Docker networks.
