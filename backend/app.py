from __future__ import annotations

import json
import os
import subprocess
import tempfile
from pathlib import Path
from typing import Any

import cv2
import mediapipe as mp
import numpy as np
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

app = FastAPI(title="Pose to 3D check API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

BODY25_TO_MEDIAPIPE = {
    "Nose": 0,
    "Neck": None,
    "RShoulder": 12,
    "RElbow": 14,
    "RWrist": 16,
    "LShoulder": 11,
    "LElbow": 13,
    "LWrist": 15,
    "MidHip": None,
    "RHip": 24,
    "RKnee": 26,
    "RAnkle": 28,
    "LHip": 23,
    "LKnee": 25,
    "LAnkle": 27,
    "REye": 5,
    "LEye": 2,
    "REar": 8,
    "LEar": 7,
    "LBigToe": 31,
    "LSmallToe": None,
    "LHeel": 29,
    "RBigToe": 32,
    "RSmallToe": None,
    "RHeel": 30,
}

BONES = [
    ["Neck", "RShoulder"], ["RShoulder", "RElbow"], ["RElbow", "RWrist"],
    ["Neck", "LShoulder"], ["LShoulder", "LElbow"], ["LElbow", "LWrist"],
    ["Neck", "MidHip"], ["MidHip", "RHip"], ["RHip", "RKnee"], ["RKnee", "RAnkle"],
    ["MidHip", "LHip"], ["LHip", "LKnee"], ["LKnee", "LAnkle"],
    ["Neck", "Nose"], ["Nose", "REye"], ["REye", "REar"], ["Nose", "LEye"], ["LEye", "LEar"],
]


def _read_image(upload: UploadFile) -> tuple[np.ndarray, int, int]:
    data = upload.file.read()
    if not data:
        raise HTTPException(status_code=400, detail="empty image")
    arr = np.frombuffer(data, np.uint8)
    bgr = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if bgr is None:
        raise HTTPException(status_code=400, detail="unsupported image format")
    height, width = bgr.shape[:2]
    return bgr, width, height


def _mediapipe_pose(upload: UploadFile) -> dict[str, Any]:
    bgr, width, height = _read_image(upload)
    rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)

    with mp.solutions.pose.Pose(static_image_mode=True, model_complexity=2, enable_segmentation=False) as pose:
        result = pose.process(rgb)

    if not result.pose_landmarks:
        return {"backend": "mediapipe", "width": width, "height": height, "people": [], "bones": BONES}

    lm = result.pose_landmarks.landmark

    def point(name: str) -> dict[str, float] | None:
        idx = BODY25_TO_MEDIAPIPE[name]
        if idx is None:
            return None
        p = lm[idx]
        return {
            "x": float(p.x),
            "y": float(p.y),
            "z": float(p.z),
            "score": float(p.visibility),
        }

    keypoints: dict[str, dict[str, float] | None] = {name: point(name) for name in BODY25_TO_MEDIAPIPE}

    # Synthetic BODY_25 helper joints from MediaPipe landmarks.
    ls, rs = keypoints["LShoulder"], keypoints["RShoulder"]
    lh, rh = keypoints["LHip"], keypoints["RHip"]
    if ls and rs:
        keypoints["Neck"] = {
            "x": (ls["x"] + rs["x"]) / 2,
            "y": (ls["y"] + rs["y"]) / 2,
            "z": (ls["z"] + rs["z"]) / 2,
            "score": min(ls["score"], rs["score"]),
        }
    if lh and rh:
        keypoints["MidHip"] = {
            "x": (lh["x"] + rh["x"]) / 2,
            "y": (lh["y"] + rh["y"]) / 2,
            "z": (lh["z"] + rh["z"]) / 2,
            "score": min(lh["score"], rh["score"]),
        }

    return {"backend": "mediapipe", "width": width, "height": height, "people": [{"keypoints": keypoints}], "bones": BONES}


def _parse_openpose_json(json_path: Path, width: int, height: int) -> dict[str, Any]:
    names = list(BODY25_TO_MEDIAPIPE.keys())
    data = json.loads(json_path.read_text())
    people = []
    for person in data.get("people", []):
        raw = person.get("pose_keypoints_2d", [])
        keypoints = {}
        for i, name in enumerate(names):
            base = i * 3
            if base + 2 >= len(raw) or raw[base + 2] <= 0:
                keypoints[name] = None
            else:
                keypoints[name] = {
                    "x": float(raw[base]) / width,
                    "y": float(raw[base + 1]) / height,
                    "z": 0.0,
                    "score": float(raw[base + 2]),
                }
        people.append({"keypoints": keypoints})
    return {"backend": "openpose", "width": width, "height": height, "people": people, "bones": BONES}


def _openpose_pose(upload: UploadFile) -> dict[str, Any]:
    openpose_bin = os.getenv("OPENPOSE_BIN", "/opt/openpose/build/examples/openpose/openpose.bin")
    model_folder = os.getenv("OPENPOSE_MODEL_FOLDER", "/opt/openpose/models")
    model_pose = os.getenv("OPENPOSE_MODEL_POSE", "BODY_25")
    if not Path(openpose_bin).exists():
        raise HTTPException(status_code=500, detail=f"OpenPose binary not found: {openpose_bin}")

    bgr, width, height = _read_image(upload)
    with tempfile.TemporaryDirectory() as tmp:
        tmp_path = Path(tmp)
        img_dir = tmp_path / "images"
        out_dir = tmp_path / "json"
        img_dir.mkdir()
        out_dir.mkdir()
        img_path = img_dir / "input.png"
        Image.fromarray(cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)).save(img_path)

        cmd = [
            openpose_bin,
            "--image_dir", str(img_dir),
            "--write_json", str(out_dir),
            "--display", "0",
            "--render_pose", "0",
            "--model_pose", model_pose,
            "--model_folder", model_folder,
        ]
        proc = subprocess.run(cmd, text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, check=False)
        if proc.returncode != 0:
            raise HTTPException(status_code=500, detail=proc.stdout[-4000:])
        json_files = sorted(out_dir.glob("*_keypoints.json"))
        if not json_files:
            return {"backend": "openpose", "width": width, "height": height, "people": [], "bones": BONES}
        return _parse_openpose_json(json_files[0], width, height)


@app.get("/api/v1/health")
def health() -> dict[str, str]:
    return {"ok": "true", "backend": os.getenv("POSE_BACKEND", "mediapipe")}


@app.get("/health", include_in_schema=False)
def legacy_health() -> dict[str, str]:
    return health()


def _estimate_pose(file: UploadFile) -> dict[str, Any]:
    backend = os.getenv("POSE_BACKEND", "mediapipe").lower()
    if backend == "openpose":
        return _openpose_pose(file)
    if backend == "mediapipe":
        return _mediapipe_pose(file)
    raise HTTPException(status_code=400, detail=f"unknown POSE_BACKEND: {backend}")


@app.post("/api/v1/pose")
def pose(file: UploadFile = File(...)) -> dict[str, Any]:
    return _estimate_pose(file)


@app.post("/backend/pose", include_in_schema=False)
def legacy_pose(file: UploadFile = File(...)) -> dict[str, Any]:
    return _estimate_pose(file)