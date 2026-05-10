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
