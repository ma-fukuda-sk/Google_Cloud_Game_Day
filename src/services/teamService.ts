import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { Team } from '../types/event'
import { eventService } from './eventService'

// Teams Collection
const TEAMS_COLLECTION = 'teams'

export interface TeamFormData {
  name: string
  eventId: string
  members: {
    name: string
    email: string
    role: 'leader' | 'member'
  }[]
  gcpProjectId?: string
}

export const teamService = {
  // チーム作成
  async createTeam(teamData: TeamFormData): Promise<string> {
    // イベントの最大チーム数チェック
    const event = await eventService.getEvent(teamData.eventId)
    if (!event) {
      throw new Error('イベントが見つかりません')
    }

    if (event.currentTeamCount >= event.maxTeams) {
      throw new Error('このイベントは既に最大チーム数に達しています')
    }

    const teamBase = {
      eventId: teamData.eventId,
      name: teamData.name,
      members: teamData.members,
      score: 0,
      completedScenarios: [],
      completedProblems: [], // 回答済み問題の初期化
      status: 'registered' as const,
      registeredAt: serverTimestamp(),
    }

    // Optional fields - only add if they have values
    const team = teamData.gcpProjectId 
      ? { ...teamBase, gcpProjectId: teamData.gcpProjectId }
      : teamBase
    
    const docRef = await addDoc(collection(db, TEAMS_COLLECTION), team)
    
    // イベントのチーム数を更新
    await eventService.updateTeamCount(teamData.eventId, 1)
    
    return docRef.id
  },

  // チーム一覧取得（イベント別）
  async getTeamsByEvent(eventId: string): Promise<Team[]> {
    const q = query(
      collection(db, TEAMS_COLLECTION),
      where('eventId', '==', eventId)
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Team))
  },

  // チーム詳細取得
  async getTeam(teamId: string): Promise<Team | null> {
    const docRef = doc(db, TEAMS_COLLECTION, teamId)
    const snapshot = await getDoc(docRef)
    
    if (snapshot.exists()) {
      return {
        id: snapshot.id,
        ...snapshot.data()
      } as Team
    }
    return null
  },

  // チーム更新
  async updateTeam(teamId: string, teamData: Partial<TeamFormData>): Promise<void> {
    const updateData: Partial<Team> & { lastActivityAt: Timestamp } = {
      lastActivityAt: serverTimestamp() as Timestamp as Timestamp,
    }
    
    if (teamData.name !== undefined) updateData.name = teamData.name
    if (teamData.members !== undefined) updateData.members = teamData.members
    if (teamData.gcpProjectId !== undefined) updateData.gcpProjectId = teamData.gcpProjectId
    
    const docRef = doc(db, TEAMS_COLLECTION, teamId)
    await updateDoc(docRef, updateData)
  },

  // チーム削除
  async deleteTeam(teamId: string): Promise<void> {
    const team = await this.getTeam(teamId)
    if (!team) {
      throw new Error('チームが見つかりません')
    }

    const docRef = doc(db, TEAMS_COLLECTION, teamId)
    await deleteDoc(docRef)
    
    // イベントのチーム数を更新
    await eventService.updateTeamCount(team.eventId, -1)
  },

  // チームスコア更新
  async updateTeamScore(teamId: string, score: number): Promise<void> {
    const docRef = doc(db, TEAMS_COLLECTION, teamId)
    await updateDoc(docRef, {
      score,
      lastActivityAt: serverTimestamp() as Timestamp
    })
  },

  // チームステータス更新
  async updateTeamStatus(teamId: string, status: Team['status']): Promise<void> {
    const docRef = doc(db, TEAMS_COLLECTION, teamId)
    await updateDoc(docRef, {
      status,
      lastActivityAt: serverTimestamp() as Timestamp
    })
  },

  // 問題完了の記録
  async markProblemCompleted(teamId: string, scenarioId: string, problemId: string, score: number): Promise<void> {
    const team = await this.getTeam(teamId)
    if (!team) {
      throw new Error('チームが見つかりません')
    }

    // completedProblemsが存在しない場合は空配列で初期化
    const completedProblems = team.completedProblems || []

    // シナリオID-問題ID形式のキーを作成
    const problemKey = `${scenarioId}-${problemId}`

    // 既に完了している場合はスキップ
    if (completedProblems.includes(problemKey)) {
      return
    }

    const docRef = doc(db, TEAMS_COLLECTION, teamId)
    await updateDoc(docRef, {
      completedProblems: [...completedProblems, problemKey],
      score: team.score + score,
      lastActivityAt: serverTimestamp() as Timestamp
    })
  },

  // シナリオ完了の記録
  async markScenarioCompleted(teamId: string, scenarioId: string): Promise<void> {
    const team = await this.getTeam(teamId)
    if (!team) {
      throw new Error('チームが見つかりません')
    }

    // completedScenariosが存在しない場合は空配列で初期化
    const completedScenarios = team.completedScenarios || []

    // 既に完了している場合はスキップ
    if (completedScenarios.includes(scenarioId)) {
      return
    }

    const docRef = doc(db, TEAMS_COLLECTION, teamId)
    await updateDoc(docRef, {
      completedScenarios: [...completedScenarios, scenarioId],
      lastActivityAt: serverTimestamp() as Timestamp
    })
  },

  // 既存データのマイグレーション用ヘルパー関数
  // 古い形式（problemIdのみ）から新しい形式（scenarioId-problemId）に変換
  isProblemCompletedForScenario(team: Team, scenarioId: string, problemId: string): boolean {
    const completedProblems = team.completedProblems || []
    
    // 新しい形式（scenarioId-problemId）でチェック
    const newFormatKey = `${scenarioId}-${problemId}`
    if (completedProblems.includes(newFormatKey)) {
      return true
    }
    
    // 既存データとの互換性のため、古い形式（problemIdのみ）もチェック
    // ただし、これは段階的に削除予定
    if (completedProblems.includes(problemId)) {
      return true
    }
    
    return false
  }
}