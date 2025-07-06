# #!/bin/bash

# # GameDay Console デプロイスクリプト
# # ローカルでDockerイメージをビルドし、Cloud Run にデプロイ

# set -e

# # 色付きの出力
# RED='\033[0;31m'
# GREEN='\033[0;32m'
# YELLOW='\033[1;33m'
# BLUE='\033[0;34m'
# NC='\033[0m' # No Color

# # ログ出力関数
# log_info() {
#     echo -e "${BLUE}[INFO]${NC} $1"
# }

# log_success() {
#     echo -e "${GREEN}[SUCCESS]${NC} $1"
# }

# log_warning() {
#     echo -e "${YELLOW}[WARNING]${NC} $1"
# }

# log_error() {
#     echo -e "${RED}[ERROR]${NC} $1"
# }

# # 使用方法の表示
# show_usage() {
#     echo "Usage: $0 [OPTIONS]"
#     echo ""
#     echo "Options:"
#     echo "  -p, --project-id PROJECT_ID    Google Cloud Project ID"
#     echo "  -r, --region REGION            Google Cloud Region (default: asia-northeast1)"
#     echo "  -e, --environment ENV          Environment (default: prod)"
#     echo "  -t, --tag TAG                  Docker image tag (default: latest)"
#     echo "  --build-only                   Build image only, skip deployment"
#     echo "  --deploy-only                  Deploy existing image only, skip build"
#     echo "  -h, --help                     Show this help message"
#     echo ""
#     echo "Example:"
#     echo "  $0 -p spherical-arc-465106-j8"
#     echo "  $0 -p spherical-arc-465106-j8 -e staging"
#     echo "  $0 -p spherical-arc-465106-j8 --build-only"
# }

# # デフォルト値
# REGION="asia-northeast1"
# ENVIRONMENT="prod"
# TAG="latest"
# BUILD_ONLY=false
# DEPLOY_ONLY=false

# # パラメータ解析
# while [[ $# -gt 0 ]]; do
#     case $1 in
#         -p|--project-id)
#             PROJECT_ID="$2"
#             shift 2
#             ;;
#         -r|--region)
#             REGION="$2"
#             shift 2
#             ;;
#         -e|--environment)
#             ENVIRONMENT="$2"
#             shift 2
#             ;;
#         -t|--tag)
#             TAG="$2"
#             shift 2
#             ;;
#         --build-only)
#             BUILD_ONLY=true
#             shift
#             ;;
#         --deploy-only)
#             DEPLOY_ONLY=true
#             shift
#             ;;
#         -h|--help)
#             show_usage
#             exit 0
#             ;;
#         *)
#             log_error "Unknown option: $1"
#             show_usage
#             exit 1
#             ;;
#     esac
# done

# # 必須パラメータのチェック
# if [[ -z "$PROJECT_ID" ]]; then
#     log_error "Project ID is required. Use -p or --project-id option."
#     exit 1
# fi

# # プロジェクトルートディレクトリに移動
# cd "$(dirname "$0")/.."

# # 設定値の表示
# log_info "=========================================="
# log_info "GameDay Console Deployment"
# log_info "=========================================="
# log_info "Project ID: $PROJECT_ID"
# log_info "Region: $REGION"
# log_info "Environment: $ENVIRONMENT"
# log_info "Tag: $TAG"
# log_info "Build only: $BUILD_ONLY"
# log_info "Deploy only: $DEPLOY_ONLY"
# log_info "=========================================="

# # Docker設定
# DOCKER_REPO="${REGION}-docker.pkg.dev/${PROJECT_ID}/gameday-console-docker"
# IMAGE_NAME="gameday-console"
# SERVICE_NAME="gameday-console-${ENVIRONMENT}"
# FULL_IMAGE_NAME="${DOCKER_REPO}/${IMAGE_NAME}:${TAG}"

# # Docker認証の設定
# if [[ "$DEPLOY_ONLY" != true ]]; then
#     log_info "Configuring Docker authentication..."
#     gcloud auth configure-docker ${REGION}-docker.pkg.dev --quiet

#     # Dockerイメージのビルド
#     log_info "Building Docker image..."
#     docker build -t ${FULL_IMAGE_NAME} .

#     if [[ $? -ne 0 ]]; then
#         log_error "Docker build failed!"
#         exit 1
#     fi

#     log_success "Docker image built: ${FULL_IMAGE_NAME}"

#     # Dockerイメージのプッシュ
#     log_info "Pushing Docker image to Artifact Registry..."
#     docker push ${FULL_IMAGE_NAME}

#     if [[ $? -ne 0 ]]; then
#         log_error "Docker push failed!"
#         exit 1
#     fi

#     log_success "Docker image pushed successfully!"
# fi

# # ビルドのみの場合はここで終了
# if [[ "$BUILD_ONLY" == true ]]; then
#     log_success "Build completed. Use --deploy-only to deploy this image."
#     exit 0
# fi

# # Cloud Run へのデプロイ
# log_info "Deploying to Cloud Run..."
# gcloud run deploy ${SERVICE_NAME} \
#     --image=${FULL_IMAGE_NAME} \
#     --region=${REGION} \
#     --platform=managed \
#     --allow-unauthenticated \
#     --memory=512Mi \
#     --cpu=1000m \
#     --min-instances=0 \
#     --max-instances=10 \
#     --port=8080 \
#     --set-env-vars="GOOGLE_CLOUD_PROJECT_ID=${PROJECT_ID},GOOGLE_CLOUD_REGION=${REGION},NODE_ENV=${ENVIRONMENT},ENVIRONMENT=${ENVIRONMENT}" \
#     --timeout=600 \
#     --quiet

# if [[ $? -ne 0 ]]; then
#     log_error "Cloud Run deployment failed!"
#     exit 1
# fi

# log_success "New revision deployed successfully!"

# # 新しいリビジョンのヘルスチェック
# log_info "Waiting for new revision to be ready..."
# sleep 30

# # 最新リビジョンの取得
# LATEST_REVISION=$(gcloud run revisions list --service=${SERVICE_NAME} --region=${REGION} --limit=1 --format='value(metadata.name)')

# # リビジョンのヘルスチェック
# REVISION_URL=$(gcloud run revisions describe ${LATEST_REVISION} --region=${REGION} --format='value(status.url)')

# log_info "Testing new revision: ${LATEST_REVISION}"

# # リビジョンのヘルスチェックを試行
# # HEALTH_CHECK_ATTEMPTS=0
# # MAX_ATTEMPTS=6

# # while [[ $HEALTH_CHECK_ATTEMPTS -lt $MAX_ATTEMPTS ]]; do
# #     if curl -f "${REVISION_URL}/api/health" >/dev/null 2>&1; then
# #         log_success "New revision health check passed!"
# #         break
# #     else
# #         log_info "Health check attempt $(($HEALTH_CHECK_ATTEMPTS + 1))/$MAX_ATTEMPTS failed, retrying in 10 seconds..."
# #         sleep 10
# #         HEALTH_CHECK_ATTEMPTS=$(($HEALTH_CHECK_ATTEMPTS + 1))
# #     fi
# # done

# # if [[ $HEALTH_CHECK_ATTEMPTS -eq $MAX_ATTEMPTS ]]; then
# #     log_error "Health check failed after $MAX_ATTEMPTS attempts!"
# #     log_error "Revision URL: ${REVISION_URL}"
# #     log_error "Please check the logs: gcloud logs read --service=${SERVICE_NAME} --limit=50"
# #     exit 1
# # fi

# # トラフィックを新しいリビジョンに切り替え
# # log_info "Switching traffic to new revision..."
# # gcloud run services update-traffic ${SERVICE_NAME} \
# #     --to-latest \
# #     --region=${REGION} \
# #     --quiet

# # デプロイ結果の取得
# # SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region=${REGION} --format='value(status.url)')

# log_success "=========================================="
# log_success "Deployment completed successfully!"
# log_success "=========================================="
# log_info "Service Name: ${SERVICE_NAME}"
# log_info "Image: ${FULL_IMAGE_NAME}"
# log_info "Revision: ${LATEST_REVISION}"
# log_info "Service URL: ${SERVICE_URL}"
# log_info "Region: ${REGION}"
# log_success "=========================================="

# # 最終ヘルスチェック
# # log_info "Performing final health check..."
# # sleep 5

# # if curl -f "${SERVICE_URL}/api/health" >/dev/null 2>&1; then
# #     log_success "Final health check passed!"
# #     log_success "Service is ready to serve traffic!"
# # else
# #     log_warning "Final health check failed. Service may still be starting up."
# #     log_info "Please check the service URL manually: ${SERVICE_URL}"
# # fi

# log_success "Deployment process completed!"

#!/bin/bash

# GameDay Console デプロイスクリプト
# ローカルでDockerイメージをビルドし、Cloud Run にデプロイ

set -e

# 色付きの出力
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ログ出力関数
log_info()    { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error()   { echo -e "${RED}[ERROR]${NC} $1"; }

# 使用方法の表示
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -p, --project-id PROJECT_ID    Google Cloud Project ID"
    echo "  -r, --region REGION            Google Cloud Region (default: asia-northeast1)"
    echo "  -e, --environment ENV          Environment (default: prod)"
    echo "  -t, --tag TAG                  Docker image tag (default: latest)"
    echo "  --build-only                   Build image only, skip deployment"
    echo "  --deploy-only                  Deploy existing image only, skip build"
    echo "  -h, --help                     Show this help message"
}

# デフォルト値
REGION="asia-northeast1"
ENVIRONMENT="prod"
TAG="latest"
BUILD_ONLY=false
DEPLOY_ONLY=false

# パラメータ解析
while [[ $# -gt 0 ]]; do
    case $1 in
        -p|--project-id) PROJECT_ID="$2"; shift 2 ;;
        -r|--region) REGION="$2"; shift 2 ;;
        -e|--environment) ENVIRONMENT="$2"; shift 2 ;;
        -t|--tag) TAG="$2"; shift 2 ;;
        --build-only) BUILD_ONLY=true; shift ;;
        --deploy-only) DEPLOY_ONLY=true; shift ;;
        -h|--help) show_usage; exit 0 ;;
        *) log_error "Unknown option: $1"; show_usage; exit 1 ;;
    esac
done

# 必須パラメータのチェック
if [[ -z "$PROJECT_ID" ]]; then
    log_error "Project ID is required. Use -p or --project-id option."
    exit 1
fi

# プロジェクトルートディレクトリに移動
cd "$(dirname "$0")/.."

# 設定値の表示
log_info "=========================================="
log_info "GameDay Console Deployment"
log_info "=========================================="
log_info "Project ID: $PROJECT_ID"
log_info "Region: $REGION"
log_info "Environment: $ENVIRONMENT"
log_info "Tag: $TAG"
log_info "Build only: $BUILD_ONLY"
log_info "Deploy only: $DEPLOY_ONLY"
log_info "=========================================="

# Docker設定
DOCKER_REPO="${REGION}-docker.pkg.dev/${PROJECT_ID}/gameday-console-docker"
IMAGE_NAME="gameday-console"
SERVICE_NAME="gameday-console-${ENVIRONMENT}"
FULL_IMAGE_NAME="${DOCKER_REPO}/${IMAGE_NAME}:${TAG}"

# Docker認証の設定
if [[ "$DEPLOY_ONLY" != true ]]; then
    log_info "Configuring Docker authentication..."
    gcloud auth configure-docker ${REGION}-docker.pkg.dev --quiet

    # .envファイルから NEXT_PUBLIC_* の変数を抽出して export
    log_info "Loading NEXT_PUBLIC_ environment variables from .env..."
    if [[ -f .env ]]; then
        export $(grep '^NEXT_PUBLIC_' .env | xargs)
    else
        log_warning ".env file not found! No build args will be passed."
    fi

    # NEXT_PUBLIC_系の環境変数をすべて --build-arg に変換
    BUILD_ARGS=""
    for var in $(compgen -v | grep '^NEXT_PUBLIC_'); do
        BUILD_ARGS+="--build-arg ${var}=${!var} "
    done

    # Dockerイメージのビルド
    log_info "Building Docker image..."
    docker build ${BUILD_ARGS} -t ${FULL_IMAGE_NAME} .

    if [[ $? -ne 0 ]]; then
        log_error "Docker build failed!"
        exit 1
    fi

    log_success "Docker image built: ${FULL_IMAGE_NAME}"

    # Dockerイメージのプッシュ
    log_info "Pushing Docker image to Artifact Registry..."
    docker push ${FULL_IMAGE_NAME}

    if [[ $? -ne 0 ]]; then
        log_error "Docker push failed!"
        exit 1
    fi

    log_success "Docker image pushed successfully!"
fi

# ビルドのみの場合は終了
if [[ "$BUILD_ONLY" == true ]]; then
    log_success "Build completed. Use --deploy-only to deploy this image."
    exit 0
fi

# Cloud Run へのデプロイ
log_info "Deploying to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
    --image=${FULL_IMAGE_NAME} \
    --region=${REGION} \
    --platform=managed \
    --allow-unauthenticated \
    --memory=512Mi \
    --cpu=1000m \
    --min-instances=0 \
    --max-instances=10 \
    --port=8080 \
    --set-env-vars="GOOGLE_CLOUD_PROJECT_ID=${PROJECT_ID},GOOGLE_CLOUD_REGION=${REGION},NODE_ENV=${ENVIRONMENT},ENVIRONMENT=${ENVIRONMENT}" \
    --timeout=600 \
    --quiet

if [[ $? -ne 0 ]]; then
    log_error "Cloud Run deployment failed!"
    exit 1
fi

log_success "=========================================="
log_success "Deployment completed successfully!"
log_success "=========================================="

# リビジョンやサービス情報の表示（任意）
LATEST_REVISION=$(gcloud run revisions list --service=${SERVICE_NAME} --region=${REGION} --limit=1 --format='value(metadata.name)')
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region=${REGION} --format='value(status.url)')

log_info "Service Name: ${SERVICE_NAME}"
log_info "Image: ${FULL_IMAGE_NAME}"
log_info "Revision: ${LATEST_REVISION}"
log_info "Service URL: ${SERVICE_URL}"
log_info "Region: ${REGION}"
log_success "=========================================="
log_success "Deployment process completed!"
