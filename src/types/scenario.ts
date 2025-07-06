import { Timestamp } from 'firebase/firestore'

// 出現条件の定義
export interface ProblemUnlockCondition {
  type: 'none' | 'time' | 'problem_completion'
  timeMinutes?: number // 開始から何分後
  requiredProblemIds?: string[] // 完了が必要な問題のID
}

// 問題定義
export interface Problem {
  id: string
  title: string
  description: string
  score: number
  gradingMethod: 'automatic' | 'manual' | 'command'
  gradingCommand?: string // コマンド採点の場合のコマンド
  order: number
  unlockCondition?: ProblemUnlockCondition // 出現条件
  dependencies?: string[] // 依存する問題のID（後で実装）
}

export interface Scenario {
  id: string
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  category: 'compute' | 'storage' | 'networking' | 'security' | 'database' | 'analytics' | 'ai-ml' | 'devops' | 'monitoring' | 'other'
  estimatedTimeMinutes: number
  maxScore: number
  evaluationPoints: number // 内部ロジック用
  
  // 詳細情報
  objectives: string // 学習目標（単一文字列に変更）
  technologies: string // 使用技術（カンマ区切り文字列）
  detailedDescription: string // ゲーム中画面で表示される導入文
  evaluationCriteria?: string // 評価観点（任意）
  
  // 問題定義（複数問題対応）
  problems: Problem[]
  
  // ヒント（段階的）
  hints: {
    id: string
    content: string
    penalty: number // ヒント使用時の減点
    unlockAfterMinutes?: number // 指定時間後に利用可能
  }[]
  
  // リソース情報
  resources: {
    type: 'document' | 'link' | 'code' | 'diagram'
    title: string
    url?: string
    content?: string
  }[]
  
  // メタデータ
  status: 'draft' | 'published' | 'archived'
  tags: string[]
  createdBy: string
  createdAt: Timestamp
  updatedAt: Timestamp
  version: number
  
  // 使用統計
  usageCount: number
  averageScore: number
  averageCompletionTime: number
}

export interface ProblemFormData {
  title: string
  description: string
  score: number
  gradingMethod: 'automatic' | 'manual' | 'command'
  gradingCommand?: string
  order: number
  unlockCondition?: ProblemUnlockCondition
}

export interface ScenarioFormData {
  title: string
  description: string
  difficulty: Scenario['difficulty']
  category: Scenario['category']
  estimatedTimeMinutes: number
  maxScore: number
  evaluationPoints: number
  objectives: string
  technologies: string
  detailedDescription: string
  evaluationCriteria?: string
  problems: ProblemFormData[]
  hints: {
    content: string
    penalty: number
    unlockAfterMinutes?: number
  }[]
  resources: {
    type: 'document' | 'link' | 'code' | 'diagram'
    title: string
    url?: string
    content?: string
  }[]
  status: Scenario['status']
  tags: string[]
}

export interface ScenarioProgress {
  scenarioId: string
  teamId: string
  startedAt: Timestamp
  completedAt?: Timestamp
  currentScore: number
  hintsUsed: string[]
  evaluationResults: {
    criteriaId: string
    achieved: boolean
    score: number
    evaluatedAt: Timestamp
    evaluatedBy?: string
    notes?: string
  }[]
  status: 'not_started' | 'in_progress' | 'completed' | 'abandoned'
}