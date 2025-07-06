# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要
このプロジェクトは「GameDay Console」と呼ばれるGoogle Cloud Platform（GCP）ベースのGame Day管理システムです。チーム・シナリオ・得点を一元管理できる訓練支援プラットフォームとして設計されています。

## 技術スタック
- **フロントエンド**: Next.js (Pages Router), TypeScript, Tailwind CSS
- **バックエンド**: Firebase Cloud Functions（予定）
- **認証**: Firebase Authentication（予定）
- **データベース**: Firestore（予定）
- **クラウドプラットフォーム**: Google Cloud Platform

## 開発コマンド
```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# プロダクションビルド
npm run build

# プロダクションサーバーの起動
npm start

# リントの実行
npm run lint

# Dockerビルド・テスト
docker build -t gameday-console .
docker run -p 3000:3000 gameday-console
```

## デプロイコマンド
```bash
# インフラストラクチャの構築
cd terraform
terraform init
terraform apply

# アプリケーションのデプロイ
cd ..
./scripts/deploy.sh -p PROJECT_ID

# 環境別デプロイ
./scripts/deploy.sh -p PROJECT_ID -e staging
./scripts/deploy.sh -p PROJECT_ID -e dev
```

## プロジェクト構成
- `src/pages/` - Next.js Pages Router構成のページコンポーネント
- `src/styles/` - グローバルCSS設定（Tailwind）
- `public/` - 静的アセット（画像、アイコン）
- パスエイリアス: `@/*` は `./src/*` にマッピング

## 環境変数設定
プロジェクトでは以下の環境変数を使用します：

### 必須設定項目
`.env.local`ファイルを作成し、以下の項目を設定してください：

```bash
# Google Cloud Platform設定
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_REGION=asia-northeast1

# Firebase設定
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
FIREBASE_APP_ID=your-app-id

# 本番環境用
NODE_ENV=development
```

注意：`.env.local`ファイルは`.gitignore`に含まれているため、Gitで管理されません。

## 現在の状態
プロジェクトは初期化段階で、標準的なNext.js starter templateの状態です。READMEで説明されているFirebase統合、認証、データベース機能はまだ実装されていません。

## 開発指針
- Pages Routerパターンを使用（App Routerではない）
- TypeScriptを使用してタイプセーフティを確保
- Tailwind CSSを使用したスタイリング
- 将来的なFirebase/GCP統合を考慮した設計

## GitHub Issue作成ガイドライン

### Issue作成の基本原則

#### 1. わかりやすいタイトル
- **絵文字を使用**: 機能の種類を視覚的に識別しやすくする
- **具体的な内容**: 何を実装・修正するかを明確に記載
- **簡潔性**: 50文字以内で要点を伝える

```bash
# 良い例
🎮 ゲームコンソール・プレイヤー向けUI実装
📊 リアルタイムスコアボード・ランキングシステム実装
🔧 問題完了追跡システムの改善・最適化

# 悪い例
ゲーム機能の実装
バグ修正
UI改善
```

#### 2. 包括的な説明
必須セクションを含む構造化された内容：

```markdown
## 概要
何を実装・修正するかの簡潔な説明

## 🎯 実装する機能 / 修正内容
- [ ] 具体的な機能1
- [ ] 具体的な機能2
- [ ] 具体的な機能3

## 🛠️ 技術実装詳細
実装方法、使用技術、コード例など

## ✅ 完了条件
- [ ] 完了の判断基準1
- [ ] 完了の判断基準2
- [ ] 完了の判断基準3

## 🔗 関連Issue・依存関係
関連するIssueへのリンク
```

#### 3. 適切なサブIssueへの分割
大きな機能は小さな単位に分割：

```bash
# メインIssue
🎮 ゲームコンソール機能実装

# サブIssue
🎮 ゲームコンソール - サイドバー実装
🎮 ゲームコンソール - 問題表示機能
🎮 ゲームコンソール - 回答システム
🎮 ゲームコンソール - 進捗管理機能
```

**分割の目安:**
- 1つのIssueの作業時間が1-2週間以内
- 独立してテスト・デプロイ可能な単位
- 明確な完了条件を設定できる範囲

### 利用可能なラベル

#### 🎯 機能カテゴリ
- `🎮 gameday` - Game Day機能・ロジック
- `👥 team` - チーム管理機能
- `🏆 scoring` - 得点・スコアリング機能
- `📊 admin` - 管理者機能・ダッシュボード
- `🔒 auth` - 認証・認可機能

#### 🛠️ 技術カテゴリ
- `☁️ gcp` - Google Cloud Platform関連
- `🔥 firebase` - Firebase関連機能
- `🎨 ui/ux` - UI/UX・フロントエンド
- `⚡ performance` - パフォーマンス・最適化

#### 🔧 作業種別
- `enhancement` - 新機能・機能追加
- `bug` - バグ修正
- `🔧 setup` - プロジェクトの初期設定・環境構築
- `📝 documentation` - ドキュメント・説明書
- `🧪 testing` - テスト・品質保証
- `🔧 maintenance` - 保守・メンテナンス

#### 🚀 デプロイ・運用
- `🚀 deployment` - デプロイ・本番環境
- `good first issue` - 初心者向け
- `help wanted` - サポートが必要

### Issue作成のワークフロー

#### 1. 事前調査
```bash
# 既存Issueの確認
gh issue list --state all | grep "キーワード"

# 関連Issueの特定
gh issue view [issue番号]
```

#### 2. Issue作成
```bash
# 基本的なIssue作成
gh issue create --title "🎮 新機能実装" --body "詳細説明"

# ラベル付きIssue作成
gh issue create --title "🔧 バグ修正" --body "詳細説明" --label "bug,🎮 gameday"

# テンプレートを使用（推奨）
gh issue create --title "📊 新機能" --body-file issue_template.md
```

#### 3. Issue管理
```bash
# 進捗更新
gh issue edit [issue番号] --body "更新された内容"

# ラベル追加
gh issue edit [issue番号] --add-label "enhancement"

# Issue完了
gh issue close [issue番号] --comment "実装完了"
```

### Issue品質チェックリスト

#### ✅ 作成前チェック
- [ ] 重複するIssueが存在しないか確認
- [ ] 適切なサイズに分割されているか
- [ ] 明確な完了条件が設定されているか
- [ ] 関連Issueとの依存関係が明記されているか

#### ✅ 内容チェック
- [ ] タイトルに適切な絵文字が使用されているか
- [ ] 概要が1-2文で簡潔に説明されているか
- [ ] 実装する機能がチェックリスト形式で記載されているか
- [ ] 技術的詳細が含まれているか
- [ ] 完了条件が測定可能な形で記載されているか

#### ✅ ラベルチェック
- [ ] 機能カテゴリラベルが付与されているか
- [ ] 技術カテゴリラベルが適切か
- [ ] 作業種別が明確になっているか
- [ ] 優先度が適切に設定されているか

### Issue例とベストプラクティス

#### 📋 良いIssueの例
```markdown
# 🎮 チーム向けリアルタイム通知システム実装

## 概要
ゲーム進行中にチームが重要な情報をリアルタイムで受け取れる通知システムを実装します。

## 🎯 実装する機能
- [ ] 問題追加時の通知
- [ ] 順位変動時の通知  
- [ ] イベント状況変更の通知
- [ ] チーム内メンバーへの一斉通知

## 🛠️ 技術実装詳細
- Firebase Cloud Messaging (FCM) による通知配信
- WebSocket接続によるリアルタイム更新
- 通知設定のカスタマイズ機能

## ✅ 完了条件
- [ ] 全ての通知タイプが正常に配信される
- [ ] モバイル・デスクトップ両対応
- [ ] 通知設定の保存・読み込みが動作する
- [ ] 50チーム同時でのパフォーマンステスト通過

## 🔗 関連Issue
依存: #13 (ゲームコンソール), #15 (スコアボード)
```

#### 🚫 避けるべきIssueの例
```markdown
# ゲーム機能のバグ修正

動作しないので修正してください。

□ 修正する
```

### コマンドクイックリファレンス

```bash
# Issue一覧確認
gh issue list
gh issue list --state closed
gh issue list --label "🎮 gameday"

# Issue詳細確認
gh issue view [issue番号]

# Issue作成（推奨テンプレート）
gh issue create \
  --title "🎮 [機能名] - [具体的な内容]" \
  --body "$(cat issue_template.md)" \
  --label "enhancement,🎮 gameday"

# Issue更新
gh issue edit [issue番号] --title "新しいタイトル"
gh issue edit [issue番号] --add-label "⚡ performance"
gh issue edit [issue番号] --remove-label "help wanted"

# Issue完了
gh issue close [issue番号] --comment "v0.3.0で実装完了"
```