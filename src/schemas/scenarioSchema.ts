import { z } from 'zod'

export const scenarioSchema = z.object({
  title: z
    .string()
    .min(1, 'タイトルは必須です')
    .max(100, 'タイトルは100文字以内で入力してください'),
  
  description: z
    .string()
    .min(1, '説明は必須です')
    .max(2000, '説明は2000文字以内で入力してください'),
  
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert'], {
    required_error: '難易度を選択してください'
  }),
  
  category: z.enum([
    'compute', 'storage', 'networking', 'security', 'database', 
    'analytics', 'ai-ml', 'devops', 'monitoring', 'other'
  ], {
    required_error: 'カテゴリを選択してください'
  }),
  
  estimatedTimeMinutes: z
    .number()
    .min(5, '予想時間は5分以上で設定してください')
    .max(480, '予想時間は8時間以内で設定してください'),
  
  maxScore: z
    .number()
    .min(1, '最大スコアは1以上で設定してください')
    .max(1000, '最大スコアは1000以下で設定してください'),
  
  objectives: z
    .string()
    .min(1, '学習目標は必須です')
    .max(2000, '学習目標は2000文字以内で入力してください'),
  
  technologies: z
    .string()
    .min(1, '使用技術は必須です')
    .max(1000, '使用技術は1000文字以内で入力してください'),
  
  detailedDescription: z
    .string()
    .min(1, '詳細説明は必須です')
    .max(5000, '詳細説明は5000文字以内で入力してください'),
  
  evaluationPoints: z
    .number()
    .min(1, '評価ポイントは1以上で設定してください')
    .max(1000, '評価ポイントは1000以下で設定してください'),
  
  evaluationCriteria: z
    .string()
    .max(2000, '評価観点は2000文字以内で入力してください')
    .optional(),
  
  problems: z
    .array(
      z.object({
        title: z
          .string()
          .min(1, '問題タイトルは必須です')
          .max(200, '問題タイトルは200文字以内で入力してください'),
        description: z
          .string()
          .min(1, '問題説明は必須です')
          .max(3000, '問題説明は3000文字以内で入力してください'),
        score: z
          .number()
          .min(1, 'スコアは1以上で設定してください')
          .max(1000, 'スコアは1000以下で設定してください'),
        gradingMethod: z.enum(['automatic', 'manual', 'command'], {
          required_error: '採点方法を選択してください'
        }),
        gradingCommand: z
          .string()
          .max(500, 'コマンドは500文字以内で入力してください')
          .optional(),
        order: z
          .number()
          .min(1, '順序は1以上で設定してください'),
        unlockCondition: z
          .object({
            type: z.enum(['none', 'time', 'problem_completion'], {
              required_error: '出現条件タイプを選択してください'
            }),
            timeMinutes: z
              .number()
              .min(0, '時間は0以上で設定してください')
              .max(480, '時間は8時間以内で設定してください')
              .optional(),
            requiredProblemIds: z
              .array(z.string())
              .optional()
          })
          .optional()
      })
    )
    .min(1, '最低1つの問題を設定してください')
    .max(20, '問題は20個までです'),
  
  hints: z
    .array(
      z.object({
        content: z
          .string()
          .min(1, 'ヒントの内容は必須です')
          .max(1000, 'ヒントの内容は1000文字以内で入力してください'),
        penalty: z
          .number()
          .min(0, 'ペナルティは0以上で設定してください')
          .max(50, 'ペナルティは50以下で設定してください'),
        unlockAfterMinutes: z
          .number()
          .min(0, '解放時間は0以上で設定してください')
          .max(240, '解放時間は4時間以内で設定してください')
          .optional()
      })
    )
    .max(10, 'ヒントは10個までです'),
  
  resources: z
    .array(
      z.object({
        type: z.enum(['document', 'link', 'code', 'diagram'], {
          required_error: 'リソースタイプを選択してください'
        }),
        title: z
          .string()
          .min(1, 'リソースタイトルは必須です')
          .max(100, 'リソースタイトルは100文字以内で入力してください'),
        url: z
          .string()
          .url('有効なURLを入力してください')
          .optional()
          .or(z.literal('')),
        content: z
          .string()
          .max(5000, 'コンテンツは5000文字以内で入力してください')
          .optional()
      }).refine(data => {
        // urlまたはcontentのどちらかが必要
        return data.url || data.content
      }, {
        message: 'URLまたはコンテンツのどちらかを入力してください'
      })
    )
    .max(20, 'リソースは20個までです'),
  
  status: z.enum(['draft', 'published', 'archived'], {
    required_error: 'ステータスを選択してください'
  }),
  
  tags: z
    .array(z.string().min(1, 'タグは空にできません'))
    .max(10, 'タグは10個までです')
}).refine(data => {
  // 問題の合計スコアが最大スコア以下であることを確認
  const totalScore = data.problems.reduce((sum, problem) => sum + problem.score, 0)
  return totalScore <= data.maxScore
}, {
  message: '問題の合計スコアが最大スコアを超えています',
  path: ['problems']
})

export type ScenarioSchemaType = z.infer<typeof scenarioSchema>