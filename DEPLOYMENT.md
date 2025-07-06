# 📋 デプロイメントガイド

このドキュメントでは、GameDay Console のデプロイメント方法について詳しく説明します。

## 🏗️ デプロイメント概要

GameDay Console は以下の2つの方法でデプロイできます：

1. **ローカルデプロイ**（推奨）- 開発環境から直接デプロイ
2. **CI/CDデプロイ**（オプション）- GitHub Actions経由での自動デプロイ

## 🚀 ローカルデプロイ

### 前提条件
- Terraform でインフラが構築済み
- Docker がインストール済み
- Google Cloud SDK 認証済み

### 基本的なデプロイ
```bash
# 本番環境へのデプロイ
./scripts/deploy.sh -p YOUR_PROJECT_ID

# ステージング環境へのデプロイ
./scripts/deploy.sh -p YOUR_PROJECT_ID -e staging

# 開発環境へのデプロイ
./scripts/deploy.sh -p YOUR_PROJECT_ID -e dev
```

### 詳細オプション
```bash
# ビルドのみ（デプロイしない）
./scripts/deploy.sh -p YOUR_PROJECT_ID --build-only

# デプロイのみ（ビルドしない）
./scripts/deploy.sh -p YOUR_PROJECT_ID --deploy-only

# カスタムタグでデプロイ
./scripts/deploy.sh -p YOUR_PROJECT_ID -t v1.0.0

# 別リージョンへのデプロイ
./scripts/deploy.sh -p YOUR_PROJECT_ID -r us-central1
```

### デプロイフロー

1. **イメージビルド**
   - Dockerfile からコンテナイメージを作成
   - Next.js アプリケーションを最適化

2. **イメージプッシュ**
   - Artifact Registry へプッシュ
   - タグ付けによるバージョン管理

3. **Cloud Run デプロイ**
   - 新しいリビジョンを作成
   - トラフィックを100%新バージョンに切り替え

4. **ヘルスチェック**
   - `/api/health` エンドポイントで動作確認

## 🔄 CI/CD デプロイ（オプション）

### セットアップ手順

#### 1. GitHub App 接続
```bash
./scripts/setup-github-connection.sh -p YOUR_PROJECT_ID -r ma-fukuda-sk/Google_Cloud_Game_Day
```

手動でCloud Buildコンソールにアクセスし、GitHub App を接続してください。

#### 2. Workload Identity Federation 設定
```bash
./scripts/setup-cicd.sh -p YOUR_PROJECT_ID -r ma-fukuda-sk/Google_Cloud_Game_Day
```

#### 3. GitHub Secrets 設定
リポジトリの Settings > Secrets and variables > Actions で設定：

- `GCP_PROJECT_ID`: プロジェクトID
- `WIF_PROVIDER`: Workload Identity Provider
- `WIF_SERVICE_ACCOUNT`: サービスアカウント

#### 4. Terraform でトリガー有効化
```bash
cd terraform
terraform apply -var="enable_github_trigger=true"
```

### ブランチ戦略
- `main` ブランチ → 本番環境 (prod)
- `develop` ブランチ → ステージング環境 (staging)
- Pull Request → テストのみ実行

## 🎯 環境管理

### 環境別設定

| 環境 | サービス名 | デプロイ方法 |
|------|------------|--------------|
| prod | gameday-console-prod | `main` ブランチ / ローカル |
| staging | gameday-console-staging | `develop` ブランチ / ローカル |
| dev | gameday-console-dev | ローカルのみ |

### 環境変数管理

各環境で以下の環境変数が自動設定されます：

```bash
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_REGION=asia-northeast1
NODE_ENV=production  # 環境に応じて変更
ENVIRONMENT=prod     # 環境名
```

## 🔍 トラブルシューティング

### よくある問題

#### Docker ビルドエラー
```bash
# 依存関係の問題
npm ci
npm run build

# Dockerキャッシュのクリア
docker system prune -a
```

#### 認証エラー
```bash
# Docker認証の再設定
gcloud auth configure-docker asia-northeast1-docker.pkg.dev

# Application Default Credentials の再設定
gcloud auth application-default login
```

#### Cloud Run デプロイエラー
```bash
# サービスの状態確認
gcloud run services describe gameday-console-prod --region=asia-northeast1

# ログの確認
gcloud logs read --service=gameday-console-prod --limit=50
```

### デバッグコマンド

```bash
# イメージの確認
gcloud artifacts docker images list asia-northeast1-docker.pkg.dev/YOUR_PROJECT_ID/gameday-console-docker

# サービスの詳細確認
gcloud run services describe gameday-console-prod --region=asia-northeast1

# ログストリーミング
gcloud logs tail --service=gameday-console-prod
```

## 🔒 セキュリティ考慮事項

1. **最小権限の原則**
   - サービスアカウントは必要最小限の権限のみ付与

2. **シークレット管理**
   - 機密情報は Secret Manager で管理
   - 環境変数での平文保存を避ける

3. **アクセス制御**
   - Cloud Run サービスはパブリックアクセス許可
   - 認証機能実装後は適切な認証を設定

## 📊 監視とログ

### ヘルスチェック
```bash
# サービス状態確認
curl https://YOUR_SERVICE_URL/api/health
```

### ログ確認
```bash
# 最新ログの確認
gcloud logs read --service=gameday-console-prod --limit=10

# エラーログのフィルタリング
gcloud logs read --service=gameday-console-prod --filter="severity>=ERROR"
```

### メトリクス監視
- Cloud Run コンソールでCPU・メモリ使用量を監視
- リクエスト数・レスポンス時間の確認
- エラー率の監視

## 🎛️ 設定のカスタマイズ

### Cloud Run 設定の調整

`scripts/deploy.sh` を編集して以下を調整可能：

- CPU・メモリ割り当て
- 最小・最大インスタンス数
- タイムアウト設定
- 環境変数

### Terraform 設定の調整

`terraform/modules/cloud_run/variables.tf` で以下を調整：

- デフォルトリソース設定
- ヘルスチェック設定
- ネットワーク設定