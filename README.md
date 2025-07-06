# Google_Cloud_Game_Day
Google CloudベースのGame Day管理システム：シナリオ・チーム・得点を一元管理できる訓練支援プラットフォーム

以下は、**GameDay Console** プロジェクトのための初期 `README.md` テンプレートです。OSSとして公開し、コントリビューターを呼び込む構成になっています。

---



# 🕹️ GameDay Console
> GCPベースで構築されたGame Dayイベントの管理・実行プラットフォーム

🌐 **Live Demo:** https://google-cloud-game-day.vercel.app/

<!-- ![License](https://img.shields.io/github/license/your-org-name/gameday-console) -->
<!-- ![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg) -->

---

## 🌟 What is GameDay Console?

**GameDay Console** is an open-source web-based platform for running **Game Day** training events on Google Cloud Platform (GCP).  
It enables organizers to:

- Define and manage Game Day events
- Register teams and assign GCP projects
- Create and configure scenario-based challenges
- Track user progress and award points in real time

> 🎯 Designed for SRE practice, application troubleshooting drills, and team-building competitions — all powered by GCP.

---

## 🧩 Features

### ✅ 実装済み機能

#### 🎯 イベント管理
- **イベント CRUD操作**: 作成、表示、編集、削除
- **日程管理**: 開始・終了日時、登録締切の設定
- **参加制限**: 最大チーム数の設定と制御
- **ステータス管理**: 下書き、公開中、進行中、完了、キャンセル

#### 🏗️ シナリオ管理
- **包括的なシナリオ設計**: タイトル、説明、難易度、カテゴリ設定
- **問題定義システム**: 
  - 複数問題の管理（順序、配点、採点方法）
  - **出現条件設定**: 時間経過 or 他問題完了による段階的公開
  - 自動/手動/コマンド採点対応
- **メタデータ管理**: 技術タグ、予想時間、使用統計
- **シナリオ選択**: イベント作成時の公開済みシナリオ選択機能

#### 👥 チーム管理  
- **チーム登録**: 動的メンバー管理、リーダー指定必須
- **バリデーション**: チーム定員、イベント参加上限の制御
- **GCPプロジェクト連携**: オプションでプロジェクトID登録
- **チーム操作**: 編集、削除、ステータス管理
- **チーム一覧管理**: テーブルビュー形式での全チーム表示・操作
- **統計情報**: 総チーム数、参加中、完了、登録済みの状況表示

#### 🔐 認証・アクセス制御
- **Firebase Authentication**: Google OAuth連携
- **管理者権限**: 環境変数ベースのアクセス制御
- **保護されたルート**: 認証必須ページの実装

#### 🎮 ゲームコンソール
- **チームプレイ画面**: `/gameconsole/[eventId]/[teamId]` でのゲーム進行
- **高度なサイドバー**: 
  - 折りたたみ可能なナビゲーション
  - スコア・進捗リアルタイム表示
  - シナリオ一覧と完了状況
- **問題管理システム**:
  - アコーディオン形式の問題リスト
  - 回答済み問題の視覚的フィードバック
  - シナリオ別問題完了管理（`scenarioId-problemId`形式）
- **インタラクティブUI**:
  - 問題詳細の段階的表示
  - 採点コマンド表示
  - ヒント・参考資料の提供
- **レスポンシブ対応**: デスクトップ・モバイル両対応

#### 💾 データ管理
- **Firestore統合**: リアルタイムデータ同期
- **型安全性**: TypeScript完全対応
- **バリデーション**: Zod schemaによる厳密な入力検証
- **問題完了追跡**: シナリオ別問題管理による正確な進捗記録

### 🔄 進行中・計画中
- 📡 リアルタイムスコアボード
- 🧪 カスタムバリデーションロジック
- 🔔 通知システム
- 🏆 高度な採点システム（自動採点の実装）

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- Docker
- Terraform ≥ 1.0
- Google Cloud SDK
- Google Cloud Project with IAM/API access

### Setup

#### 1. Clone the repository
```bash
git clone https://github.com/ma-fukuda-sk/Google_Cloud_Game_Day.git
cd Google_Cloud_Game_Day
```

#### 2. Install dependencies
```bash
npm install
```

#### 3. Set up Google Cloud authentication
```bash
# Google Cloud にログイン
gcloud auth login

# Application Default Credentials を設定
gcloud auth application-default login

# プロジェクトを設定
gcloud config set project YOUR_PROJECT_ID
```

#### 4. Set up infrastructure with Terraform
```bash
# Terraform設定
cd terraform
cp terraform.tfvars.example terraform.tfvars
vim terraform.tfvars  # 実際の値を設定

# インフラストラクチャの構築
terraform init
terraform plan
terraform apply
```

#### 5. Set up Firebase Authentication
```bash
# Firebase CLI のインストール
npm install -g firebase-tools

# Firebase プロジェクトの作成
firebase projects:addfirebase YOUR_PROJECT_ID

# Firebase Web アプリの作成
firebase apps:create web "GameDay Console" --project=YOUR_PROJECT_ID

# Firebase 設定の取得
firebase apps:sdkconfig WEB APP_ID --project=YOUR_PROJECT_ID
```

**🚨 重要: Firebase Authentication の手動設定**

以下の設定をFirebase Consoleで手動で行う必要があります：

1. **Google認証プロバイダーの有効化**
   - [Firebase Console](https://console.firebase.google.com) にアクセス
   - あなたのプロジェクト (`YOUR_PROJECT_ID`) を選択
   - **Authentication** > **Sign-in method** タブを開く
   - **Google** プロバイダーを有効化:
     - 「Google」をクリック
     - 「Enable」をオンにする
     - プロジェクトサポートメールを設定
     - 「Save」をクリック

2. **Firestore Database の作成**
   - **Firestore Database** セクションに移動
   - 「Create database」をクリック
   - セキュリティルールで「Start in test mode」を選択（後でセキュアなルールに変更）
   - ロケーションを `asia-northeast1` に設定
   - 「Done」をクリック

3. **承認済みドメインの設定（本番環境の場合）**
   - **Authentication** > **Settings** > **Authorized domains** タブ
   - 本番ドメインを追加（例: `your-domain.com`）

#### 6. Set up environment variables
```bash
# プロジェクトルートに戻る
cd ..

# 環境変数設定
cp .env.example .env.local
vim .env.local  # 実際の値を設定
```

**`.env.local` 設定例:**
```bash
# Google Cloud Platform設定
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_PROJECT_NAME=Your-Project-Name
GOOGLE_CLOUD_PROJECT_NUMBER=123456789012
GOOGLE_CLOUD_REGION=asia-northeast1

# Firebase設定（firebase apps:sdkconfig で取得した値を使用）
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# 管理者権限設定（カンマ区切りでメールアドレスを指定、空の場合は全てのGoogleアカウントを許可）
NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com,manager@example.com

# 本番環境用
NODE_ENV=development
```

**管理者権限の設定:**
- `NEXT_PUBLIC_ADMIN_EMAILS` が空の場合、すべてのGoogleアカウントでログイン可能（開発用）
- 本番環境では管理者のメールアドレスをカンマ区切りで指定してください

#### 7. Local development
```bash
# 開発サーバーの起動
npm run dev

# ローカルでのDockerテスト
docker build -t gameday-console .
docker run -p 8080:8080 -e PORT=8080 gameday-console
```

### 本番環境デプロイ

#### ローカルからのデプロイ（推奨）
```bash
# ワンコマンドデプロイ
./scripts/deploy.sh -p YOUR_PROJECT_ID

# 環境を指定してデプロイ
./scripts/deploy.sh -p YOUR_PROJECT_ID -e staging

# ビルドのみ実行
./scripts/deploy.sh -p YOUR_PROJECT_ID --build-only
```

#### CI/CD セットアップ（オプション）
```bash
# GitHub Actions CI/CD の設定
./scripts/setup-cicd.sh -p YOUR_PROJECT_ID -r ma-fukuda-sk/Google_Cloud_Game_Day

# GitHub Secrets を設定後、mainブランチにプッシュでデプロイ開始
git push origin main
```

詳細な設定方法は以下を参照：
- インフラ構築: [`terraform/README.md`](./terraform/README.md)
- CI/CD設定: [`.github/workflows/README.md`](./.github/workflows/README.md)

---

## 🛠 Tech Stack

| Layer          | Technology                                    | Version | Details |
| -------------- | --------------------------------------------- | ------- | ------- |
| Frontend       | Next.js (Pages Router, TypeScript, Tailwind) | 14.x    | SSR/SSG対応、完全な型安全性 |
| UI Components  | Headless UI, Heroicons                       | Latest  | アクセシビリティ準拠のコンポーネント |
| Forms          | React Hook Form + Zod                        | Latest  | 型安全なフォームバリデーション |
| Auth           | Firebase Authentication                       | v9      | Google OAuth, 管理者権限制御 |
| Database       | Firestore (NoSQL)                             | Latest  | リアルタイムデータ同期 |
| Backend        | Firebase Cloud Functions (計画中)             | v2      | サーバーレス関数 |
| Cloud Platform | Google Cloud Platform (GCP)                   | Latest  | 統合クラウドサービス |
| Development    | TypeScript, ESLint, Tailwind CSS             | Latest  | 開発効率とコード品質 |

### 🏗️ アーキテクチャの特徴
- **型安全性**: TypeScript + Zod schemaで完全な型安全性を実現
- **リアルタイム**: Firestoreによるリアルタイムデータ同期
- **スケーラブル**: Firebase/GCPのマネージドサービス活用
- **モダンUI**: Tailwind CSS + Headless UIによる高品質なユーザーインターフェース

---

## 📚 機能詳細ガイド

### 🎯 イベント管理
```typescript
// イベント作成の流れ
1. 基本情報入力（名前、説明、日程）
2. 参加設定（最大チーム数、採点方式）
3. シナリオ選択（公開済みシナリオから選択）
4. 詳細設定（遅刻参加、自動採点など）
```

### 🏗️ シナリオ設計
```typescript
// シナリオの構成要素
- 基本情報: タイトル、説明、難易度、カテゴリ
- 詳細設定: 学習目標、使用技術、予想時間
- 問題定義: 複数問題、出現条件、採点方法
- メタデータ: ステータス、バージョン、使用統計
```

### 👥 チーム管理
```typescript
// チーム登録のルール
- メンバー数: 1-10名（カスタマイズ可能）
- リーダー: 必ず1名指定
- 重複チェック: 同一イベント内での名前重複防止
- 定員制御: イベントの最大チーム数まで

// チーム一覧管理
- テーブルビュー: 全チーム情報の一覧表示
- 統計表示: 総チーム数、ステータス別集計
- チームURL: /gameconsole/[eventId]/[teamId] 形式
- CRUD操作: 追加、編集、削除の完全サポート
```

### 🎮 ゲームコンソール
```typescript
// ゲーム進行の流れ
1. チームURLアクセス（/gameconsole/[eventId]/[teamId]）
2. サイドバーでシナリオ選択
3. アコーディオンで問題表示・選択
4. 問題詳細確認・回答提出
5. リアルタイムスコア・進捗更新

// 問題管理システム
- 形式: "scenarioId-problemId" で一意管理
- 状態: 未着手、回答済み、完了の視覚的表示
- 進捗: シナリオ別、全体進捗のリアルタイム表示
- 互換性: 既存データとの後方互換性維持
```

### 🔄 出現条件システム
問題の表示タイミングを制御する画期的な機能：

1. **制限なし**: 即座に表示
2. **時間経過**: 開始から指定時間後に表示
3. **問題完了**: 指定した前提問題の完了後に表示

```typescript
// 使用例
問題1: 制限なし（即座に表示）
問題2: 問題1完了後に表示
問題3: 開始から30分後に表示
問題4: 問題2,3両方完了後に表示
```

---

## 🔧 トラブルシューティング

### Firebase認証エラー

**エラー: "Firebase: Error (auth/configuration-not-found)"**
- Firebase Consoleで Google認証プロバイダーが有効化されているか確認
- `.env.local` のFirebase設定値が正しいか確認

**エラー: "Firebase: Error (auth/unauthorized-domain)"**
- Firebase Console > Authentication > Settings > Authorized domainsに `localhost` が追加されているか確認
- 本番環境では実際のドメインを追加

### Firestore接続エラー

**エラー: "Missing or insufficient permissions"**
- Firestore Databaseが作成されているか確認
- セキュリティルールが認証ユーザーの読み書きを許可しているか確認

**推奨セキュリティルール（開発用）:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### フォームバリデーションエラー

**エラー: "Expected array, received string"**
- チェックボックス配列の問題（修正済み）
- React Hook Form の useController を使用した解決済み

**フォーム送信できない場合:**
1. ブラウザのコンソールでバリデーションエラーを確認
2. 必須フィールドが適切に入力されているか確認
3. 日付・時間フィールドの形式を確認

### 開発環境で認証が失敗する場合

1. ブラウザのデベロッパーツールでコンソールエラーを確認
2. Firebase設定値（API Keyなど）が正しく設定されているか確認
3. `npm run dev` を再起動してみる
4. ブラウザのキャッシュをクリアしてみる

---

## 📝 更新履歴

### v0.3.0 (2024-12-XX) - ゲームコンソール・チーム管理完成
#### 🎮 ゲーム進行システム
- **チームプレイ画面**: 完全なゲーム進行インターフェース実装
- **高度なサイドバー**: 折りたたみ可能、スコア・進捗表示、シナリオ一覧
- **アコーディオン式問題リスト**: クリックで展開する直感的UI
- **回答済み問題管理**: シナリオ別問題完了システム（`scenarioId-problemId`）
- **レスポンシブ対応**: デスクトップ・モバイル完全対応

#### 👥 チーム管理強化
- **チーム一覧ページ**: テーブルビュー形式での包括的管理
- **統計ダッシュボード**: チーム状況の可視化
- **チームURL生成**: 各チーム専用のゲームコンソールリンク

#### 🔧 技術改善
- **シナリオ別問題管理**: 複数シナリオでの問題ID競合解決
- **後方互換性**: 既存データとの互換性を保持
- **UI/UXの大幅向上**: アニメーション、視覚的フィードバック強化
- **型安全性の向上**: 厳密な型定義とバリデーション

#### 🏗️ アーキテクチャ進化
- **GameSidebarコンポーネント**: 再利用可能な高機能サイドバー
- **teamService拡張**: 問題完了管理API追加
- **マイグレーション対応**: 段階的データ移行サポート

### v0.2.0 (2024-01-XX) - シナリオ管理システム完成
#### 🎉 新機能
- **問題出現条件システム**: 時間経過・前提問題完了による段階的公開機能
- **イベント-シナリオ連携**: イベント作成時の公開済みシナリオ選択
- **包括的なシナリオ管理**: 作成・編集・詳細表示の完全実装
- **高度なフォームバリデーション**: Zod schema + React Hook Form

#### 🔧 技術改善
- チェックボックス配列の正しい処理（useController使用）
- TypeScript型安全性の完全実現
- Firestore undefined値エラーの修正
- 動的UI更新（条件に応じたフィールド表示）

#### 🏗️ データ構造拡張
- `ProblemUnlockCondition` インターフェース追加
- 出現条件の3タイプ対応（none/time/problem_completion）
- シナリオ統計情報の追加

### v0.1.0 (2024-01-XX) - 基盤システム構築
#### 🎯 基盤機能実装
- Firebase Authentication (Google OAuth)
- Firestore データベース設計
- Next.js Pages Router + TypeScript基盤
- 管理者権限制御システム

#### 📋 基本CRUD機能
- イベント管理（作成・編集・削除・一覧）
- チーム管理（動的メンバー管理・バリデーション）
- 基本的なシナリオ管理

#### 🎨 UI/UX基盤
- Tailwind CSS + Headless UI設計システム
- レスポンシブ対応
- アクセシビリティ準拠コンポーネント

---

## 🤝 Contributing

We welcome pull requests and discussions!
See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for details.

1. Fork this repository
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Push your changes and open a pull request

---

## 📄 License

This project is licensed under the MIT License.
See [`LICENSE`](./LICENSE) for details.

---

## 📬 Contact

Maintained by [@ma-fukuda](https://github.com/ma-fukuda-sk).
Feel free to open an issue or discussion for questions, ideas, or feedback!



