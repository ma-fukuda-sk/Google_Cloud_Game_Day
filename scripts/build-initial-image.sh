#!/bin/bash

# 初期Dockerイメージのビルドとプッシュ
# Terraform実行前に実行して、Cloud Runサービス作成時にイメージが存在することを保証

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

# 使用方法の表示
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -p, --project-id PROJECT_ID    Google Cloud Project ID"
    echo "  -r, --region REGION            Google Cloud Region (default: asia-northeast1)"
    echo "  -h, --help                     Show this help message"
    echo ""
    echo "Example:"
    echo "  $0 -p spherical-arc-465106-j8"
}

# デフォルト値
REGION="asia-northeast1"

# パラメータ解析
while [[ $# -gt 0 ]]; do
    case $1 in
        -p|--project-id)
            PROJECT_ID="$2"
            shift 2
            ;;
        -r|--region)
            REGION="$2"
            shift 2
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# 必須パラメータのチェック
if [[ -z "$PROJECT_ID" ]]; then
    log_error "Project ID is required. Use -p or --project-id option."
    exit 1
fi

# プロジェクトルートディレクトリに移動
cd "$(dirname "$0")/.."

log_info "Building initial Docker image for GameDay Console..."
log_info "Project ID: $PROJECT_ID"
log_info "Region: $REGION"

# Dockerレポジトリの設定
DOCKER_REPO="${REGION}-docker.pkg.dev/${PROJECT_ID}/gameday-console-docker"
IMAGE_NAME="gameday-console"
IMAGE_TAG="latest"
FULL_IMAGE_NAME="${DOCKER_REPO}/${IMAGE_NAME}:${IMAGE_TAG}"

# Docker認証の設定
log_info "Configuring Docker authentication..."
gcloud auth configure-docker ${REGION}-docker.pkg.dev

# Dockerイメージのビルド
log_info "Building Docker image..."
docker build -t ${FULL_IMAGE_NAME} .

if [[ $? -ne 0 ]]; then
    log_error "Docker build failed!"
    exit 1
fi

log_success "Docker image built successfully: ${FULL_IMAGE_NAME}"

# Dockerイメージのプッシュ
log_info "Pushing Docker image to Artifact Registry..."
docker push ${FULL_IMAGE_NAME}

if [[ $? -ne 0 ]]; then
    log_error "Docker push failed!"
    exit 1
fi

log_success "Docker image pushed successfully!"

# イメージの確認
log_info "Verifying image in Artifact Registry..."
gcloud artifacts docker images list ${DOCKER_REPO} --include-tags

log_success "=========================================="
log_success "Initial image build completed!"
log_success "=========================================="
log_info "Image: ${FULL_IMAGE_NAME}"
log_info "You can now run 'terraform apply' to create the Cloud Run service."