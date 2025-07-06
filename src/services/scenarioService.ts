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
import { Scenario, ScenarioFormData } from '../types/scenario'

// Scenarios Collection
const SCENARIOS_COLLECTION = 'scenarios'

export const scenarioService = {
  // シナリオ作成
  async createScenario(scenarioData: ScenarioFormData, userId: string): Promise<string> {
    const scenarioBase = {
      title: scenarioData.title,
      description: scenarioData.description,
      difficulty: scenarioData.difficulty,
      category: scenarioData.category,
      estimatedTimeMinutes: scenarioData.estimatedTimeMinutes,
      maxScore: scenarioData.maxScore,
      evaluationPoints: scenarioData.evaluationPoints,
      objectives: scenarioData.objectives,
      technologies: scenarioData.technologies,
      detailedDescription: scenarioData.detailedDescription,
      evaluationCriteria: scenarioData.evaluationCriteria,
      problems: scenarioData.problems.map((problem, index) => ({
        id: `problem_${index + 1}`,
        title: problem.title,
        description: problem.description,
        score: problem.score,
        gradingMethod: problem.gradingMethod,
        gradingCommand: problem.gradingCommand,
        order: problem.order,
        unlockCondition: problem.unlockCondition
      })),
      hints: scenarioData.hints?.map((hint, index) => ({
        id: `hint_${index + 1}`,
        content: hint.content,
        penalty: hint.penalty,
        unlockAfterMinutes: hint.unlockAfterMinutes
      })) || [],
      resources: scenarioData.resources || [],
      status: scenarioData.status,
      tags: scenarioData.tags || [],
      createdBy: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      version: 1,
      usageCount: 0,
      averageScore: 0,
      averageCompletionTime: 0
    }

    const docRef = await addDoc(collection(db, SCENARIOS_COLLECTION), scenarioBase)
    return docRef.id
  },

  // シナリオ一覧取得
  async getScenarios(filters?: {
    status?: Scenario['status']
    category?: Scenario['category']
    difficulty?: Scenario['difficulty']
  }): Promise<Scenario[]> {
    let q = query(collection(db, SCENARIOS_COLLECTION))

    if (filters?.status) {
      q = query(q, where('status', '==', filters.status))
    }
    if (filters?.category) {
      q = query(q, where('category', '==', filters.category))
    }
    if (filters?.difficulty) {
      q = query(q, where('difficulty', '==', filters.difficulty))
    }

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Scenario))
  },

  // 公開済みシナリオ一覧取得（イベント作成時用）
  async getPublishedScenarios(): Promise<Scenario[]> {
    const q = query(
      collection(db, SCENARIOS_COLLECTION),
      where('status', '==', 'published')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Scenario))
  },

  // シナリオ詳細取得
  async getScenario(scenarioId: string): Promise<Scenario | null> {
    const docRef = doc(db, SCENARIOS_COLLECTION, scenarioId)
    const snapshot = await getDoc(docRef)
    
    if (snapshot.exists()) {
      return {
        id: snapshot.id,
        ...snapshot.data()
      } as Scenario
    }
    return null
  },

  // シナリオ更新
  async updateScenario(scenarioId: string, scenarioData: Partial<ScenarioFormData>): Promise<void> {
    const updateData: Partial<Scenario> & { updatedAt: Timestamp, version: number } = {
      updatedAt: serverTimestamp() as Timestamp,
      version: 0 // この値は実際には現在のバージョン + 1 を設定する必要がある
    }
    
    // ScenarioFormDataからScenarioへの変換
    if (scenarioData.title !== undefined) updateData.title = scenarioData.title
    if (scenarioData.description !== undefined) updateData.description = scenarioData.description
    if (scenarioData.difficulty !== undefined) updateData.difficulty = scenarioData.difficulty
    if (scenarioData.category !== undefined) updateData.category = scenarioData.category
    if (scenarioData.estimatedTimeMinutes !== undefined) updateData.estimatedTimeMinutes = scenarioData.estimatedTimeMinutes
    if (scenarioData.maxScore !== undefined) updateData.maxScore = scenarioData.maxScore
    if (scenarioData.evaluationPoints !== undefined) updateData.evaluationPoints = scenarioData.evaluationPoints
    if (scenarioData.objectives !== undefined) updateData.objectives = scenarioData.objectives
    if (scenarioData.technologies !== undefined) updateData.technologies = scenarioData.technologies
    if (scenarioData.detailedDescription !== undefined) updateData.detailedDescription = scenarioData.detailedDescription
    if (scenarioData.evaluationCriteria !== undefined) updateData.evaluationCriteria = scenarioData.evaluationCriteria
    if (scenarioData.status !== undefined) updateData.status = scenarioData.status
    if (scenarioData.tags !== undefined) updateData.tags = scenarioData.tags

    if (scenarioData.problems !== undefined) {
      updateData.problems = scenarioData.problems.map((problem, index) => ({
        id: `problem_${index + 1}`,
        title: problem.title,
        description: problem.description,
        score: problem.score,
        gradingMethod: problem.gradingMethod,
        gradingCommand: problem.gradingCommand,
        order: problem.order,
        unlockCondition: problem.unlockCondition
      }))
    }

    if (scenarioData.hints !== undefined) {
      updateData.hints = scenarioData.hints?.map((hint, index) => ({
        id: `hint_${index + 1}`,
        content: hint.content,
        penalty: hint.penalty,
        unlockAfterMinutes: hint.unlockAfterMinutes
      })) || []
    }

    if (scenarioData.resources !== undefined) {
      updateData.resources = scenarioData.resources
    }

    // 現在のバージョンを取得してインクリメント
    const currentScenario = await this.getScenario(scenarioId)
    if (currentScenario) {
      updateData.version = currentScenario.version + 1
    }

    const docRef = doc(db, SCENARIOS_COLLECTION, scenarioId)
    await updateDoc(docRef, updateData)
  },

  // シナリオ削除
  async deleteScenario(scenarioId: string): Promise<void> {
    const docRef = doc(db, SCENARIOS_COLLECTION, scenarioId)
    await deleteDoc(docRef)
  },

  // シナリオ使用統計更新
  async updateScenarioStats(scenarioId: string, completionTime: number, score: number): Promise<void> {
    const scenario = await this.getScenario(scenarioId)
    if (!scenario) return

    const newUsageCount = scenario.usageCount + 1
    const newAverageScore = ((scenario.averageScore * scenario.usageCount) + score) / newUsageCount
    const newAverageCompletionTime = ((scenario.averageCompletionTime * scenario.usageCount) + completionTime) / newUsageCount

    const docRef = doc(db, SCENARIOS_COLLECTION, scenarioId)
    await updateDoc(docRef, {
      usageCount: newUsageCount,
      averageScore: newAverageScore,
      averageCompletionTime: newAverageCompletionTime,
      updatedAt: serverTimestamp()
    })
  },

  // カテゴリ別シナリオ数取得
  async getScenarioCountByCategory(): Promise<Record<string, number>> {
    const scenarios = await this.getScenarios({ status: 'published' })
    const counts: Record<string, number> = {}
    
    scenarios.forEach(scenario => {
      counts[scenario.category] = (counts[scenario.category] || 0) + 1
    })
    
    return counts
  }
}