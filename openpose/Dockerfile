FROM nvidia/cuda:12.1.1-cudnn8-devel-ubuntu22.04

ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /opt

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential cmake git wget unzip ca-certificates \
    python3 python3-pip python3-dev \
    libopencv-dev libgoogle-glog-dev libgflags-dev libprotobuf-dev protobuf-compiler \
    libboost-all-dev libhdf5-dev libatlas-base-dev \
    libgl1 libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

RUN git clone --depth=1 https://github.com/CMU-Perceptual-Computing-Lab/openpose.git /opt/openpose \
    && cd /opt/openpose \
    && git submodule update --init --recursive --remote

RUN cd /opt/openpose \
    && mkdir -p build \
    && cd build \
    && cmake -DGPU_MODE=CUDA -DUSE_CUDNN=ON -DBUILD_PYTHON=OFF -DBUILD_EXAMPLES=ON .. \
    && make -j"$(nproc)"

# Models are not baked into the image. Put them under ./models/openpose on the host
# or run OpenPose's official model download scripts inside /opt/openpose/models.
WORKDIR /app
COPY backend/requirements.txt ./requirements.txt
RUN python3 -m pip install --no-cache-dir -r requirements.txt
COPY backend/app.py ./app.py

EXPOSE 8000
CMD ["python3", "-m", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
