#!/bin/bash

# Cloud Build GitHub App接続セットアップスクリプト
# GitHub リポジトリとCloud Buildを接続し、トリガーを作成

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
    echo "  -b, --branch BRANCH            GitHub branch (default: main)"
    echo "  -h, --help                     Show this help message"
    echo ""
    echo "Example:"
    echo "  $0 -p spherical-arc-465106-j8 -r ma-fukuda-sk/Google_Cloud_Game_Day"
}

# デフォルト値
BRANCH="main"

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
        -b|--branch)
            BRANCH="$2"
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

# リポジトリ情報の分割
GITHUB_OWNER=$(echo $GITHUB_REPO | cut -d'/' -f1)
GITHUB_NAME=$(echo $GITHUB_REPO | cut -d'/' -f2)

log_info "Setting up Cloud Build GitHub connection..."
log_info "Project ID: $PROJECT_ID"
log_info "GitHub Repository: $GITHUB_REPO"
log_info "Branch: $BRANCH"

# Cloud Build API の有効化確認
log_info "Checking Cloud Build API..."
gcloud services enable cloudbuild.googleapis.com --project=$PROJECT_ID

# GitHub App接続の手動セットアップガイド
echo ""
log_warning "=========================================="
log_warning "MANUAL SETUP REQUIRED"
log_warning "=========================================="
echo ""
log_info "GitHub App接続は手動でセットアップする必要があります："
echo ""
echo "1. Cloud Buildコンソールを開く:"
echo "   https://console.cloud.google.com/cloud-build/triggers?project=$PROJECT_ID"
echo ""
echo "2. 「トリガーを作成」をクリック"
echo ""
echo "3. 「リポジトリを接続」で以下を設定:"
echo "   - ソース: GitHub"
echo "   - リポジトリ: $GITHUB_REPO"
echo "   - GitHub App をインストール/認証"
echo ""
echo "4. トリガー設定:"
echo "   - 名前: gameday-console-prod-trigger"
echo "   - イベント: ブランチにプッシュ"
echo "   - ソース: ^${BRANCH}$"
echo "   - 設定: Cloud Build 設定ファイル (yaml または json)"
echo "   - ファイルの場所: / cloudbuild.yaml"
echo ""
echo "5. 詳細オプション (代替変数):"
echo "   - _REGION: asia-northeast1"
echo "   - _SERVICE_NAME: gameday-console-prod"
echo "   - _DOCKER_REPO: gameday-console-docker"
echo "   - _ENVIRONMENT: prod"
echo ""

# Terraform設定の更新ガイド
echo ""
log_info "GitHub接続完了後、Terraformトリガー設定を有効化してください:"
echo ""
echo "terraform/main.tf の Cloud Build trigger セクションのコメントアウトを外す"
echo ""
echo "その後:"
echo "  cd terraform"
echo "  terraform plan"
echo "  terraform apply"
echo ""

# 接続確認のためのコマンド
log_info "接続確認コマンド:"
echo "  gcloud builds triggers list --project=$PROJECT_ID"
echo ""

log_success "Setup guide completed!"
log_warning "GitHub App接続を手動で完了させてください。"