#!/bin/bash

# Docker デバッグスクリプト
# ローカルでのDockerコンテナの動作確認とデバッグ用

set -e

# 色付きの出力
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ログ出力関数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

IMAGE_NAME="gameday-console"
CONTAINER_NAME="gameday-console-debug"
PORT=8080

log_info "=========================================="
log_info "GameDay Console Docker Debug"
log_info "=========================================="

# 既存のコンテナを停止・削除
if docker ps -a | grep -q $CONTAINER_NAME; then
    log_info "Stopping and removing existing container..."
    docker stop $CONTAINER_NAME >/dev/null 2>&1 || true
    docker rm $CONTAINER_NAME >/dev/null 2>&1 || true
fi

# Dockerイメージのビルド
log_info "Building Docker image..."
docker build -t $IMAGE_NAME .

if [[ $? -ne 0 ]]; then
    log_error "Docker build failed!"
    exit 1
fi

log_success "Docker image built successfully!"

# コンテナの起動
log_info "Starting container on port $PORT..."
docker run -d \
    --name $CONTAINER_NAME \
    -p $PORT:$PORT \
    -e PORT=$PORT \
    -e NODE_ENV=production \
    -e ENVIRONMENT=debug \
    $IMAGE_NAME

if [[ $? -ne 0 ]]; then
    log_error "Container failed to start!"
    exit 1
fi

log_success "Container started successfully!"
log_info "Container URL: http://localhost:$PORT"

# コンテナの起動待機
log_info "Waiting for container to be ready..."
sleep 5

# ログの表示
log_info "Container logs:"
docker logs $CONTAINER_NAME

# ヘルスチェック
log_info "Performing health check..."
HEALTH_CHECK_ATTEMPTS=0
MAX_ATTEMPTS=6

while [[ $HEALTH_CHECK_ATTEMPTS -lt $MAX_ATTEMPTS ]]; do
    if curl -f "http://localhost:$PORT/api/health" >/dev/null 2>&1; then
        log_success "Health check passed!"
        break
    else
        log_info "Health check attempt $(($HEALTH_CHECK_ATTEMPTS + 1))/$MAX_ATTEMPTS failed, retrying in 5 seconds..."
        sleep 5
        HEALTH_CHECK_ATTEMPTS=$(($HEALTH_CHECK_ATTEMPTS + 1))
    fi
done

if [[ $HEALTH_CHECK_ATTEMPTS -eq $MAX_ATTEMPTS ]]; then
    log_error "Health check failed after $MAX_ATTEMPTS attempts!"
    log_error "Container logs:"
    docker logs $CONTAINER_NAME
    echo ""
    log_info "Container is still running for debugging. Use the following commands:"
    echo "  docker logs $CONTAINER_NAME     # View logs"
    echo "  docker exec -it $CONTAINER_NAME sh  # Enter container"
    echo "  docker stop $CONTAINER_NAME     # Stop container"
    echo "  docker rm $CONTAINER_NAME       # Remove container"
    exit 1
fi

# ファイル構成の確認
log_info "Checking container file structure..."
echo ""
log_info "Files in container root:"
docker exec $CONTAINER_NAME ls -la /app/

echo ""
log_info "Checking server.js:"
if docker exec $CONTAINER_NAME test -f /app/server.js; then
    log_success "server.js exists!"
else
    log_error "server.js not found!"
fi

echo ""
log_info "Container process:"
docker exec $CONTAINER_NAME ps aux

echo ""
log_success "=========================================="
log_success "Debug completed successfully!"
log_success "=========================================="
log_info "Container URL: http://localhost:$PORT"
log_info "Health endpoint: http://localhost:$PORT/api/health"
echo ""
log_info "Useful commands:"
echo "  docker logs $CONTAINER_NAME -f     # Follow logs"
echo "  docker exec -it $CONTAINER_NAME sh  # Enter container"
echo "  docker stop $CONTAINER_NAME         # Stop container"
echo "  docker rm $CONTAINER_NAME           # Remove container"