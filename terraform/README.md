# Terraform インフラストラクチャ構成

このディレクトリには、GameDay Console のGCPインフラストラクチャを定義するTerraformファイルが含まれています。

## 構成内容

### 作成されるリソース
- **Firestore データベース**: Game Day データの保存
- **Cloud Run サービス**: アプリケーションのホスティング
- **Artifact Registry**: Dockerイメージの保存
- **IAM サービスアカウント**: 適切なアクセス権限
- **Cloud Build トリガー**: CI/CDパイプライン
- **Secret Manager**: 環境変数の管理

### ディレクトリ構成
```
terraform/
├── main.tf                 # メインの構成
├── variables.tf           # 変数定義
├── outputs.tf             # 出力値
├── versions.tf            # プロバイダーバージョン
├── terraform.tfvars.example # 設定例
├── README.md              # このファイル
└── modules/
    ├── firestore/         # Firestore設定
    ├── cloud_run/         # Cloud Run設定
    └── iam/               # IAM設定
```

## 使用方法

### 1. 前提条件
- Terraform >= 1.0 がインストールされている
- Google Cloud SDK がインストールされ、認証済み
- 適切なGCPプロジェクトが作成済み

### 2. 認証設定
```bash
# Google Cloud にログイン
gcloud auth login

# Application Default Credentials を設定
gcloud auth application-default login

# プロジェクトを設定
gcloud config set project YOUR_PROJECT_ID
```

### 3. 設定ファイルの作成
```bash
# terraform.tfvars ファイルをコピー
cp terraform.tfvars.example terraform.tfvars

# 実際の値を設定
vim terraform.tfvars
```

### 4. Terraform実行
```bash
# 初期化
terraform init

# 実行計画の確認
terraform plan

# インフラストラクチャの構築
terraform apply
```

### 5. 確認
```bash
# 構築されたリソースの確認
terraform show

# 出力値の確認
terraform output
```

### 6. アプリケーションデプロイ
```bash
# プロジェクトルートに戻る
cd ..

# ローカルからデプロイ
./scripts/deploy.sh -p YOUR_PROJECT_ID
```

## オプション設定

### GitHub Actions CI/CD の設定
```bash
# GitHub App接続の手動セットアップガイド
../scripts/setup-github-connection.sh -p YOUR_PROJECT_ID -r ma-fukuda-sk/Google_Cloud_Game_Day

# 接続完了後、Cloud Build トリガーを有効化
terraform apply -var="enable_github_trigger=true"
```

## 設定項目

### 必須設定
- `project_id`: GCPプロジェクトID
- `region`: デプロイリージョン

### オプション設定
- `app_name`: アプリケーション名（デフォルト: gameday-console）
- `environment`: 環境名（デフォルト: prod）
- `github_repo`: GitHubリポジトリ
- `github_branch`: デプロイ対象ブランチ
- `cloud_run_*`: Cloud Run設定

## 削除方法

```bash
# リソースの削除
terraform destroy
```

⚠️ **注意**: この操作は元に戻せません。本番環境では十分注意してください。

## トラブルシューティング

### よくある問題

1. **API が有効化されていない**
   ```bash
   # 必要なAPIを手動で有効化
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable run.googleapis.com
   gcloud services enable firestore.googleapis.com
   ```

2. **権限不足**
   ```bash
   # 必要な権限を確認
   gcloud projects get-iam-policy YOUR_PROJECT_ID
   ```

3. **Terraform状態の問題**
   ```bash
   # 状態をリフレッシュ
   terraform refresh
   ```

## 追加情報

- [Terraform Google Provider Documentation](https://registry.terraform.io/providers/hashicorp/google/latest/docs)
- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Firestore Documentation](https://cloud.google.com/firestore/docs)