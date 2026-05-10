from __future__ import annotations

import io
import json

import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient
from starlette.datastructures import UploadFile

from app import (
    BODY25_TO_MEDIAPIPE,
    _estimate_pose,
    _parse_openpose_json,
    _read_image,
    app as fastapi_app,
)


client = TestClient(fastapi_app)


def test_api_v1_health_uses_mediapipe_by_default(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("POSE_BACKEND", raising=False)

    response = client.get("/api/v1/health")

    assert response.status_code == 200
    assert response.json() == {"ok": "true", "backend": "mediapipe"}


def test_legacy_health_keeps_same_payload(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("POSE_BACKEND", "mediapipe")

    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"ok": "true", "backend": "mediapipe"}


def test_pose_endpoint_rejects_empty_image(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("POSE_BACKEND", "mediapipe")

    response = client.post(
        "/api/v1/pose",
        files={"file": ("empty.png", b"", "image/png")},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "empty image"


def test_unknown_backend_returns_400(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("POSE_BACKEND", "invalid-backend")
    upload = UploadFile(file=io.BytesIO(b"not-read"), filename="input.png")

    with pytest.raises(HTTPException) as exc_info:
        _estimate_pose(upload)

    assert exc_info.value.status_code == 400
    assert exc_info.value.detail == "unknown POSE_BACKEND: invalid-backend"


def test_read_image_rejects_empty_upload() -> None:
    upload = UploadFile(file=io.BytesIO(b""), filename="empty.png")

    with pytest.raises(HTTPException) as exc_info:
        _read_image(upload)

    assert exc_info.value.status_code == 400
    assert exc_info.value.detail == "empty image"


def test_parse_openpose_json_normalizes_body25_keypoints(tmp_path) -> None:
    raw = [0.0] * (len(BODY25_TO_MEDIAPIPE) * 3)
    raw[0:3] = [100.0, 50.0, 0.9]
    json_path = tmp_path / "input_keypoints.json"
    json_path.write_text(json.dumps({"people": [{"pose_keypoints_2d": raw}]}))

    result = _parse_openpose_json(json_path, width=200, height=100)

    person = result["people"][0]
    assert result["backend"] == "openpose"
    assert result["width"] == 200
    assert result["height"] == 100
    assert person["keypoints"]["Nose"] == {"x": 0.5, "y": 0.5, "z": 0.0, "score": 0.9}
    assert person["keypoints"]["Neck"] is None
