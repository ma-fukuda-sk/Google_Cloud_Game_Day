import { Timestamp } from 'firebase/firestore'

export interface Event {
  id: string
  name: string
  description?: string
  status: 'draft' | 'published' | 'active' | 'completed' | 'cancelled'
  
  // 日程
  startDate: Timestamp
  endDate: Timestamp
  duration: number // 予定時間（分）
  
  // 参加設定
  maxTeams: number
  currentTeamCount: number
  registrationDeadline?: Timestamp
  
  // ゲーム設定
  scenarios: string[]
  scoringType: 'time' | 'points' | 'hybrid'
  
  // メタデータ
  createdAt: Timestamp
  updatedAt: Timestamp
  createdBy: string
  
  // 設定
  settings: {
    allowLateRegistration: boolean
    autoStartScoring: boolean
    showLeaderboard: boolean
    notificationEnabled: boolean
  }
}

export interface Team {
  id: string
  eventId: string
  name: string
  
  // メンバー情報
  members: {
    name: string
    email: string
    role: 'leader' | 'member'
  }[]
  
  // GCP設定
  gcpProjectId?: string
  
  // 進捗・スコア
  currentScenario?: string
  score: number
  completedScenarios: string[]
  completedProblems?: string[] // 回答済み問題のIDリスト（既存データとの互換性のためオプショナル）
  
  // ステータス
  status: 'registered' | 'active' | 'completed' | 'disqualified'
  
  // メタデータ
  registeredAt: Timestamp
  lastActivityAt?: Timestamp
}


export interface EventProgress {
  id: string // `{eventId}_{teamId}_{scenarioId}`
  eventId: string
  teamId: string
  scenarioId: string
  
  // 進捗情報
  status: 'not_started' | 'in_progress' | 'completed' | 'failed'
  score: number
  startedAt?: Timestamp
  completedAt?: Timestamp
  
  // 検証ログ
  validationAttempts: {
    timestamp: Timestamp
    result: boolean
    details?: string
  }[]
}

// フォーム用の型（Timestampの代わりにDateを使用）
export interface EventFormData {
  name: string
  description?: string
  status: Event['status']
  startDate: Date
  endDate: Date
  duration: number
  maxTeams: number
  registrationDeadline?: Date | null
  scenarios: string[]
  scoringType: Event['scoringType']
  settings: Event['settings']
}