# GitHub Actions CI/CD パイプライン

このディレクトリには、GameDay Console の CI/CD パイプラインを定義するGitHub Actions ワークフローが含まれています。

## ワークフロー概要

### `deploy.yml` - メインデプロイワークフロー

#### トリガー条件
- `main` ブランチへのプッシュ → 本番環境デプロイ
- `develop` ブランチへのプッシュ → ステージング環境デプロイ
- `main` ブランチへのプルリクエスト → テストのみ実行

#### ジョブ構成

##### 1. `test` ジョブ
- コードの静的解析
- リント実行
- TypeScript型チェック
- ※ ユニットテストは今後追加予定

##### 2. `deploy` ジョブ（本番環境）
- Google Cloud 認証
- Cloud Build トリガー実行
- デプロイ結果確認

##### 3. `deploy-staging` ジョブ（ステージング環境）
- ステージング環境への自動デプロイ
- 開発版の動作確認用

## セットアップ手順

### 1. Google Cloud Workload Identity Federation 設定

GitHub Actions から Google Cloud にアクセスするため、Workload Identity Federation を設定します。

```bash
# 1. Workload Identity Pool の作成
gcloud iam workload-identity-pools create "github-pool" \
  --project="${PROJECT_ID}" \
  --location="global" \
  --display-name="GitHub Actions Pool"

# 2. Workload Identity Provider の作成
gcloud iam workload-identity-pools providers create-oidc "github-provider" \
  --project="${PROJECT_ID}" \
  --location="global" \
  --workload-identity-pool="github-pool" \
  --display-name="GitHub Actions Provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
  --issuer-uri="https://token.actions.githubusercontent.com"

# 3. サービスアカウントの作成
gcloud iam service-accounts create "github-actions" \
  --project="${PROJECT_ID}" \
  --display-name="GitHub Actions Service Account"

# 4. サービスアカウントに権限を付与
gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:github-actions@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/cloudbuild.builds.editor"

gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:github-actions@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/run.developer"

# 5. Workload Identity User ロールの付与
gcloud iam service-accounts add-iam-policy-binding \
  "github-actions@${PROJECT_ID}.iam.gserviceaccount.com" \
  --project="${PROJECT_ID}" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/github-pool/attribute.repository/ma-fukuda-sk/Google_Cloud_Game_Day"
```

### 2. GitHub Secrets 設定

リポジトリの Settings > Secrets and variables > Actions で以下のシークレットを設定：

```
GCP_PROJECT_ID: your-project-id
WIF_PROVIDER: projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-pool/providers/github-provider
WIF_SERVICE_ACCOUNT: github-actions@your-project-id.iam.gserviceaccount.com
```

### 3. 動作確認

1. `main` ブランチにコードをプッシュ
2. GitHub Actions タブでワークフローの実行を確認
3. Cloud Run コンソールでデプロイ状況を確認

## トラブルシューティング

### 認証エラー
```
Error: Failed to generate access token
```
→ Workload Identity Federation の設定を確認

### Cloud Build エラー
```
Error: Build failed
```
→ Cloud Build の詳細ログを確認
→ Docker ビルドプロセスの問題の可能性

### デプロイエラー
```
Error: Service deployment failed
```
→ Cloud Run サービスの設定を確認
→ コンテナのヘルスチェックが正常に動作するか確認

## ベストプラクティス

1. **ブランチ戦略**
   - `main`: 本番環境への自動デプロイ
   - `develop`: ステージング環境への自動デプロイ
   - `feature/*`: プルリクエスト時のテスト実行

2. **セキュリティ**
   - Workload Identity Federation 使用（サービスアカウントキー不要）
   - 必要最小限の権限付与
   - シークレット情報の適切な管理

3. **監視**
   - デプロイ後のヘルスチェック確認
   - Cloud Run のメトリクス監視
   - エラーログの定期確認