import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import AdminLayout from '../../../components/layout/AdminLayout'
import ProtectedRoute from '../../../components/auth/ProtectedRoute'
import Card, { CardHeader, CardContent } from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import { ArrowLeftIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useForm, useFieldArray, useController, Control, UseFormWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { scenarioService } from '../../../services/scenarioService'
import { useAuth } from '../../../contexts/AuthContext'
import { Scenario, Problem } from '../../../types/scenario'

// 編集用のスキーマ（新規作成と同じ）
const scenarioEditSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です'),
  description: z.string().min(1, '説明は必須です'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  category: z.enum(['compute', 'storage', 'networking', 'security', 'database', 'analytics', 'ai-ml', 'devops', 'monitoring', 'other']),
  estimatedTimeMinutes: z.number().min(5).max(480),
  maxScore: z.number().min(1).max(10000),
  evaluationPoints: z.number().min(1).max(1000),
  status: z.enum(['draft', 'published', 'archived']),
  objectives: z.string().min(1, '学習目標は必須です'),
  technologies: z.string().min(1, '使用技術は必須です'),
  detailedDescription: z.string().min(1, '詳細説明は必須です'),
  evaluationCriteria: z.string().optional(),
  problems: z.array(
    z.object({
      title: z.string().min(1, '問題タイトルは必須です'),
      description: z.string().min(1, '問題説明は必須です'),
      score: z.number().min(1, '配点は1以上である必要があります'),
      gradingMethod: z.enum(['automatic', 'manual', 'command']),
      gradingCommand: z.string().optional(),
      order: z.number().min(1, '出題順序は1以上である必要があります'),
      unlockCondition: z.object({
        type: z.enum(['none', 'time', 'problem_completion']),
        timeMinutes: z.number().min(0).optional(),
        requiredProblemIds: z.array(z.string()).optional()
      }).optional().refine((data) => {
        if (!data) return true
        if (data.type === 'time' && (data.timeMinutes === undefined || data.timeMinutes === null)) {
          return false
        }
        return true
      }, {
        message: '時間条件を選択した場合は分数を入力してください'
      })
    })
  ).min(1, '最低1つの問題を追加してください')
})

type ScenarioEditType = z.infer<typeof scenarioEditSchema>
type ScenarioFormData = ScenarioEditType

export default function EditScenarioPage() {
  const router = useRouter()
  const { id } = router.query
  const { user } = useAuth()
  const [scenario, setScenario] = useState<Scenario | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [loadError, setLoadError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
    watch
  } = useForm<ScenarioEditType>({
    resolver: zodResolver(scenarioEditSchema)
  })

  const { fields: problemFields, append: appendProblem, remove: removeProblem } = useFieldArray({
    control,
    name: 'problems'
  })

  // シナリオデータ取得
  const loadScenario = async (scenarioId: string) => {
    try {
      setIsLoading(true)
      const scenarioData = await scenarioService.getScenario(scenarioId)
      
      if (!scenarioData) {
        setLoadError('シナリオが見つかりません')
        return
      }

      setScenario(scenarioData)
      
      // フォームにデータを設定
      reset({
        title: scenarioData.title,
        description: scenarioData.description,
        difficulty: scenarioData.difficulty,
        category: scenarioData.category,
        estimatedTimeMinutes: scenarioData.estimatedTimeMinutes,
        maxScore: scenarioData.maxScore,
        evaluationPoints: scenarioData.evaluationPoints,
        status: scenarioData.status,
        objectives: scenarioData.objectives,
        technologies: scenarioData.technologies,
        detailedDescription: scenarioData.detailedDescription,
        evaluationCriteria: scenarioData.evaluationCriteria || '',
        problems: scenarioData.problems?.map(problem => ({
          title: problem.title,
          description: problem.description,
          score: problem.score,
          gradingMethod: problem.gradingMethod,
          gradingCommand: problem.gradingCommand || '',
          order: problem.order,
          unlockCondition: problem.unlockCondition || { type: 'none' as const }
        })) || [{
          title: '',
          description: '',
          score: 100,
          gradingMethod: 'manual' as const,
          gradingCommand: '',
          order: 1,
          unlockCondition: { type: 'none' as const }
        }]
      })
      
    } catch (error) {
      console.error('シナリオ詳細取得エラー:', error)
      setLoadError('シナリオ詳細の取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (id && typeof id === 'string') {
      loadScenario(id)
    }
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (data: ScenarioEditType) => {
    if (!user || !scenario) {
      setSubmitError('ログインが必要です')
      return
    }

    try {
      setIsSubmitting(true)
      setSubmitError('')
      
      // データを変換
      const scenarioData = {
        title: data.title,
        description: data.description,
        difficulty: data.difficulty,
        category: data.category,
        estimatedTimeMinutes: data.estimatedTimeMinutes,
        maxScore: data.maxScore,
        evaluationPoints: data.evaluationPoints,
        objectives: data.objectives,
        technologies: data.technologies,
        detailedDescription: data.detailedDescription,
        evaluationCriteria: data.evaluationCriteria,
        problems: data.problems,
        hints: scenario.hints || [], // 既存のヒントを保持
        resources: scenario.resources || [], // 既存のリソースを保持
        status: data.status,
        tags: scenario.tags || [] // 既存のタグを保持
      }
      
      await scenarioService.updateScenario(scenario.id, scenarioData)
      router.push(`/scenarios/${scenario.id}`)
    } catch (error) {
      console.error('シナリオ更新エラー:', error)
      if (error instanceof Error) {
        setSubmitError(error.message)
      } else {
        setSubmitError('シナリオの更新に失敗しました')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const addProblem = () => {
    const nextOrder = problemFields.length + 1
    appendProblem({
      title: '',
      description: '',
      score: 100,
      gradingMethod: 'manual',
      gradingCommand: '',
      order: nextOrder,
      unlockCondition: {
        type: 'none'
      }
    })
  }

  const ProblemDependencySelector = ({ control, problemIndex, problemFields, watch }: {
    control: Control<ScenarioFormData>
    problemIndex: number
    problemFields: Problem[]
    watch: UseFormWatch<ScenarioFormData>
  }) => {
    const { field } = useController({
      control,
      name: `problems.${problemIndex}.unlockCondition.requiredProblemIds`,
      defaultValue: []
    })

    const handleCheckboxChange = (problemId: string, checked: boolean) => {
      const currentValue = field.value || []
      if (checked) {
        field.onChange([...currentValue, problemId])
      } else {
        field.onChange(currentValue.filter((id: string) => id !== problemId))
      }
    }

    return (
      <div>
        <label className="block text-xs text-gray-600 mb-1">
          完了が必要な問題
        </label>
        <div className="space-y-2">
          {problemFields.slice(0, problemIndex).map((_, prevIndex) => {
            const prevProblemTitle = watch(`problems.${prevIndex}.title`) || `問題 ${prevIndex + 1}`
            const problemId = `problem_${prevIndex + 1}`
            const isChecked = field.value?.includes(problemId) || false
            
            return (
              <label key={prevIndex} className="flex items-center">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => handleCheckboxChange(problemId, e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  {prevProblemTitle}
                </span>
              </label>
            )
          })}
          {problemIndex === 0 && (
            <p className="text-xs text-gray-500">
              最初の問題なので、依存する問題はありません
            </p>
          )}
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    )
  }

  if (loadError || !scenario) {
    return (
      <ProtectedRoute>
        <AdminLayout>
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {loadError || 'シナリオが見つかりません'}
            </h2>
            <Link href="/scenarios">
              <Button variant="outline">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                シナリオ一覧に戻る
              </Button>
            </Link>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>{scenario.title}の編集 - GameDay Console</title>
      </Head>

      <AdminLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* ページヘッダー */}
          <div className="flex items-center space-x-4">
            <Link href={`/scenarios/${scenario.id}`}>
              <Button variant="outline" size="sm">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                戻る
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">シナリオ編集</h1>
              <p className="mt-2 text-gray-600">
                {scenario.title}を編集します
              </p>
            </div>
          </div>

          {/* エラー表示 */}
          {submitError && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{submitError}</div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* 基本情報 */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">基本情報</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    タイトル *
                  </label>
                  <input
                    type="text"
                    {...register('title')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="例: Webアプリケーションの高可用性設計"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    説明 *
                  </label>
                  <textarea
                    {...register('description')}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="シナリオの詳細な説明を記載してください"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      難易度 *
                    </label>
                    <select
                      {...register('difficulty')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="beginner">初級</option>
                      <option value="intermediate">中級</option>
                      <option value="advanced">上級</option>
                      <option value="expert">エキスパート</option>
                    </select>
                    {errors.difficulty && (
                      <p className="mt-1 text-sm text-red-600">{errors.difficulty.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      カテゴリ *
                    </label>
                    <select
                      {...register('category')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="compute">コンピューティング</option>
                      <option value="storage">ストレージ</option>
                      <option value="networking">ネットワーキング</option>
                      <option value="security">セキュリティ</option>
                      <option value="database">データベース</option>
                      <option value="analytics">アナリティクス</option>
                      <option value="ai-ml">AI・機械学習</option>
                      <option value="devops">DevOps</option>
                      <option value="monitoring">モニタリング</option>
                      <option value="other">その他</option>
                    </select>
                    {errors.category && (
                      <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ステータス *
                    </label>
                    <select
                      {...register('status')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="draft">下書き</option>
                      <option value="published">公開</option>
                      <option value="archived">アーカイブ</option>
                    </select>
                    {errors.status && (
                      <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      予想時間（分） *
                    </label>
                    <input
                      type="number"
                      {...register('estimatedTimeMinutes', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="60"
                    />
                    {errors.estimatedTimeMinutes && (
                      <p className="mt-1 text-sm text-red-600">{errors.estimatedTimeMinutes.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      最大スコア *
                    </label>
                    <input
                      type="number"
                      {...register('maxScore', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="100"
                    />
                    {errors.maxScore && (
                      <p className="mt-1 text-sm text-red-600">{errors.maxScore.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      評価ポイント *
                    </label>
                    <input
                      type="number"
                      {...register('evaluationPoints', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="10"
                    />
                    {errors.evaluationPoints && (
                      <p className="mt-1 text-sm text-red-600">{errors.evaluationPoints.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 詳細情報 */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">詳細情報</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    学習目標 *
                  </label>
                  <input
                    type="text"
                    {...register('objectives')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="例: GCPでのロードバランサー設定方法を理解する"
                  />
                  {errors.objectives && (
                    <p className="mt-1 text-sm text-red-600">{errors.objectives.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    使用技術 *
                  </label>
                  <input
                    type="text"
                    {...register('technologies')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="例: Cloud Run, VPC, Pub/Sub"
                  />
                  {errors.technologies && (
                    <p className="mt-1 text-sm text-red-600">{errors.technologies.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    詳細説明 *
                  </label>
                  <textarea
                    {...register('detailedDescription')}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="例: あなたはレストランの注文システムをクラウドに移行します。このシステムは高可用性を保ちながら、予期しないトラフィック増加にも対応できる必要があります。"
                  />
                  {errors.detailedDescription && (
                    <p className="mt-1 text-sm text-red-600">{errors.detailedDescription.message}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    ゲーム中画面で最初に表示される導入文となります
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    評価観点（任意）
                  </label>
                  <textarea
                    {...register('evaluationCriteria')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="例: 設計方針、セキュリティ観点、コスト効率性"
                  />
                  {errors.evaluationCriteria && (
                    <p className="mt-1 text-sm text-red-600">{errors.evaluationCriteria.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 問題定義エリア */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">問題定義</h2>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addProblem}
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    問題を追加
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {problemFields.map((field, index) => (
                  <div key={field.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-gray-700">
                        問題 {index + 1}
                      </h3>
                      {problemFields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeProblem(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          問題タイトル *
                        </label>
                        <input
                          type="text"
                          {...register(`problems.${index}.title`)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="例: Cloud Run へデプロイせよ"
                        />
                        {errors.problems?.[index]?.title && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors.problems[index]?.title?.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          問題説明 *
                        </label>
                        <textarea
                          {...register(`problems.${index}.description`)}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="例: 注文完了時にログをCloud Loggingへ出力してください。ログ内容には orderId と timestamp が含まれていること。"
                        />
                        {errors.problems?.[index]?.description && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors.problems[index]?.description?.message}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            配点 *
                          </label>
                          <input
                            type="number"
                            {...register(`problems.${index}.score`, { valueAsNumber: true })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="2000"
                          />
                          {errors.problems?.[index]?.score && (
                            <p className="mt-1 text-xs text-red-600">
                              {errors.problems[index]?.score?.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            出題順序 *
                          </label>
                          <input
                            type="number"
                            {...register(`problems.${index}.order`, { valueAsNumber: true })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            value={index + 1}
                            readOnly
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            採点方法 *
                          </label>
                          <select
                            {...register(`problems.${index}.gradingMethod`)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="manual">手動採点</option>
                            <option value="automatic">自動採点</option>
                            <option value="command">コマンド採点</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          採点コマンド（任意）
                        </label>
                        <input
                          type="text"
                          {...register(`problems.${index}.gradingCommand`)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="例: curl, gcloud logging read"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          コマンド採点の場合に実行するコマンドを指定
                        </p>
                      </div>

                      {/* 出現条件設定 */}
                      <div className="border-t border-gray-200 pt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          出現条件
                        </label>
                        <div className="space-y-3">
                          <div>
                            <select
                              {...register(`problems.${index}.unlockCondition.type`)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="none">制限なし（即座に表示）</option>
                              <option value="time">時間経過後</option>
                              <option value="problem_completion">他の問題完了後</option>
                            </select>
                          </div>

                          {/* 時間条件 */}
                          {watch(`problems.${index}.unlockCondition.type`) === 'time' && (
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">
                                開始から何分後に表示
                              </label>
                              <input
                                type="number"
                                {...register(`problems.${index}.unlockCondition.timeMinutes`, { valueAsNumber: true })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                placeholder="30"
                                min="0"
                              />
                            </div>
                          )}

                          {/* 問題完了条件 */}
                          {watch(`problems.${index}.unlockCondition.type`) === 'problem_completion' && (
                            <ProblemDependencySelector 
                              control={control}
                              problemIndex={index}
                              problemFields={problemFields}
                              watch={watch}
                            />
                          )}
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          条件を満たすまで問題は非表示になります
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {errors.problems && (
                  <p className="text-sm text-red-600">{errors.problems.message}</p>
                )}
              </CardContent>
            </Card>

            {/* アクションボタン */}
            <div className="flex justify-end space-x-4">
              <Link href={`/scenarios/${scenario.id}`}>
                <Button variant="outline" disabled={isSubmitting}>
                  キャンセル
                </Button>
              </Link>
              <Button type="submit" isLoading={isSubmitting}>
                変更を保存
              </Button>
            </div>
          </form>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  )
}