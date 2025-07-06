#!/bin/bash

# GameDay Console CI/CD セットアップスクリプト
# Google Cloud Workload Identity Federation と GitHub Actions の設定

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
    echo "  -r, --repo REPO                GitHub repository (owner/repo format)"
    echo "  -h, --help                     Show this help message"
    echo ""
    echo "Example:"
    echo "  $0 -p my-project-id -r ma-fukuda-sk/Google_Cloud_Game_Day"
}

# パラメータ解析
while [[ $# -gt 0 ]]; do
    case $1 in
        -p|--project-id)
            PROJECT_ID="$2"
            shift 2
            ;;
        -r|--repo)
            GITHUB_REPO="$2"
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

if [[ -z "$GITHUB_REPO" ]]; then
    log_error "GitHub repository is required. Use -r or --repo option."
    exit 1
fi

# プロジェクト番号の取得
log_info "Getting project number for project: $PROJECT_ID"
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")

if [[ -z "$PROJECT_NUMBER" ]]; then
    log_error "Could not get project number. Please check if project ID is correct and you have access."
    exit 1
fi

log_success "Project number: $PROJECT_NUMBER"

# 現在の認証確認
log_info "Checking current authentication..."
CURRENT_ACCOUNT=$(gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -1)
log_info "Current authenticated account: $CURRENT_ACCOUNT"

# 必要なAPIの有効化
log_info "Enabling required APIs..."
gcloud services enable iamcredentials.googleapis.com \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    --project=$PROJECT_ID

# Workload Identity Pool の作成
log_info "Creating Workload Identity Pool..."
if gcloud iam workload-identity-pools describe github-pool \
    --project=$PROJECT_ID \
    --location=global >/dev/null 2>&1; then
    log_warning "Workload Identity Pool 'github-pool' already exists"
else
    gcloud iam workload-identity-pools create github-pool \
        --project=$PROJECT_ID \
        --location=global \
        --display-name="GitHub Actions Pool"
    log_success "Workload Identity Pool created"
fi

# Workload Identity Provider の作成
log_info "Creating Workload Identity Provider..."
if gcloud iam workload-identity-pools providers describe github-provider \
    --project=$PROJECT_ID \
    --location=global \
    --workload-identity-pool=github-pool >/dev/null 2>&1; then
    log_warning "Workload Identity Provider 'github-provider' already exists"
else
    gcloud iam workload-identity-pools providers create-oidc github-provider \
        --project=$PROJECT_ID \
        --location=global \
        --workload-identity-pool=github-pool \
        --display-name="GitHub Actions Provider" \
        --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
        --issuer-uri="https://token.actions.githubusercontent.com"
    log_success "Workload Identity Provider created"
fi

# サービスアカウントの作成
log_info "Creating service account for GitHub Actions..."
SA_EMAIL="github-actions@${PROJECT_ID}.iam.gserviceaccount.com"

if gcloud iam service-accounts describe $SA_EMAIL \
    --project=$PROJECT_ID >/dev/null 2>&1; then
    log_warning "Service account 'github-actions' already exists"
else
    gcloud iam service-accounts create github-actions \
        --project=$PROJECT_ID \
        --display-name="GitHub Actions Service Account"
    log_success "Service account created"
fi

# サービスアカウントに権限を付与
log_info "Granting permissions to service account..."
ROLES=(
    "roles/cloudbuild.builds.editor"
    "roles/run.developer"
    "roles/artifactregistry.writer"
    "roles/iam.serviceAccountUser"
)

for ROLE in "${ROLES[@]}"; do
    gcloud projects add-iam-policy-binding $PROJECT_ID \
        --member="serviceAccount:$SA_EMAIL" \
        --role="$ROLE" \
        --quiet
done

log_success "Permissions granted to service account"

# Workload Identity User ロールの付与
log_info "Granting Workload Identity User role..."
gcloud iam service-accounts add-iam-policy-binding $SA_EMAIL \
    --project=$PROJECT_ID \
    --role="roles/iam.workloadIdentityUser" \
    --member="principalSet://iam.googleapis.com/projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/github-pool/attribute.repository/$GITHUB_REPO"

log_success "Workload Identity User role granted"

# 結果の表示
echo ""
log_success "=========================================="
log_success "CI/CD Setup Completed Successfully!"
log_success "=========================================="
echo ""
log_info "Please add the following secrets to your GitHub repository:"
echo ""
echo "  Repository: https://github.com/$GITHUB_REPO"
echo "  Go to: Settings > Secrets and variables > Actions"
echo ""
echo "  GCP_PROJECT_ID:"
echo "    $PROJECT_ID"
echo ""
echo "  WIF_PROVIDER:"
echo "    projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/github-pool/providers/github-provider"
echo ""
echo "  WIF_SERVICE_ACCOUNT:"
echo "    $SA_EMAIL"
echo ""
log_info "After adding these secrets, push your code to trigger the deployment!"

# セットアップ検証
log_info "Verifying setup..."
echo ""
echo "Workload Identity Pool:"
gcloud iam workload-identity-pools describe github-pool \
    --project=$PROJECT_ID \
    --location=global \
    --format="table(name,state)"

echo ""
echo "Service Account:"
gcloud iam service-accounts describe $SA_EMAIL \
    --project=$PROJECT_ID \
    --format="table(email,displayName)"

log_success "Setup verification completed!"