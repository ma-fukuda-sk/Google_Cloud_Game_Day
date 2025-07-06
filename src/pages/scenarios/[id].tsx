import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import ProtectedRoute from '../../components/auth/ProtectedRoute'
import Card, { CardHeader, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { 
  ArrowLeftIcon,
  ClockIcon,
  StarIcon,
  TagIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  LightBulbIcon,
  DocumentTextIcon,
  LinkIcon
} from '@heroicons/react/24/outline'
import { Scenario } from '../../types/scenario'
import { scenarioService } from '../../services/scenarioService'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

export default function ScenarioDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const [scenario, setScenario] = useState<Scenario | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadScenario = async (scenarioId: string) => {
    try {
      setLoading(true)
      const scenarioData = await scenarioService.getScenario(scenarioId)
      
      if (!scenarioData) {
        setError('シナリオが見つかりません')
        return
      }

      setScenario(scenarioData)
      
    } catch (error) {
      console.error('シナリオ詳細取得エラー:', error)
      setError('シナリオ詳細の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id && typeof id === 'string') {
      loadScenario(id)
    }
  }, [id])

  const getStatusColor = (status: Scenario['status']) => {
    switch (status) {
      case 'draft': return 'gray'
      case 'published': return 'green'
      case 'archived': return 'red'
      default: return 'gray'
    }
  }

  const getStatusText = (status: Scenario['status']) => {
    switch (status) {
      case 'draft': return '下書き'
      case 'published': return '公開中'
      case 'archived': return 'アーカイブ'
      default: return status
    }
  }

  const getDifficultyColor = (difficulty: Scenario['difficulty']) => {
    switch (difficulty) {
      case 'beginner': return 'green'
      case 'intermediate': return 'yellow'
      case 'advanced': return 'orange'
      case 'expert': return 'red'
      default: return 'gray'
    }
  }

  const getDifficultyText = (difficulty: Scenario['difficulty']) => {
    switch (difficulty) {
      case 'beginner': return '初級'
      case 'intermediate': return '中級'
      case 'advanced': return '上級'
      case 'expert': return 'エキスパート'
      default: return difficulty
    }
  }

  const getCategoryText = (category: Scenario['category']) => {
    const categoryMap = {
      'compute': 'コンピューティング',
      'storage': 'ストレージ',
      'networking': 'ネットワーキング',
      'security': 'セキュリティ',
      'database': 'データベース',
      'analytics': 'アナリティクス',
      'ai-ml': 'AI・機械学習',
      'devops': 'DevOps',
      'monitoring': 'モニタリング',
      'other': 'その他'
    }
    return categoryMap[category] || category
  }

  const handleDeleteScenario = async () => {
    if (!scenario || !window.confirm('このシナリオを削除しますか？')) {
      return
    }

    try {
      await scenarioService.deleteScenario(scenario.id)
      router.push('/scenarios')
    } catch (error) {
      console.error('シナリオ削除エラー:', error)
      setError('シナリオの削除に失敗しました')
    }
  }

  if (loading) {
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

  if (error || !scenario) {
    return (
      <ProtectedRoute>
        <AdminLayout>
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {error || 'シナリオが見つかりません'}
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
        <title>{scenario.title} - GameDay Console</title>
      </Head>

      <AdminLayout>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* ページヘッダー */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/scenarios">
                <Button variant="outline" size="sm">
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  戻る
                </Button>
              </Link>
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-2xl font-bold text-gray-900">{scenario.title}</h1>
                  <Badge color={getStatusColor(scenario.status)}>
                    {getStatusText(scenario.status)}
                  </Badge>
                  <Badge color={getDifficultyColor(scenario.difficulty)}>
                    {getDifficultyText(scenario.difficulty)}
                  </Badge>
                </div>
                <p className="mt-2 text-gray-600">{scenario.description}</p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Link href={`/scenarios/${scenario.id}/edit`}>
                <Button variant="outline">
                  <PencilIcon className="h-4 w-4 mr-2" />
                  編集
                </Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={handleDeleteScenario}
                className="text-red-600 hover:text-red-700"
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                削除
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* メイン情報 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 基本情報 */}
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold text-gray-900">基本情報</h2>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <div className="text-sm text-gray-500 w-20">カテゴリ</div>
                      <div className="font-medium">{getCategoryText(scenario.category)}</div>
                    </div>
                    
                    <div className="flex items-center">
                      <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <div className="text-sm text-gray-500 w-16">予想時間</div>
                      <div className="font-medium">{scenario.estimatedTimeMinutes}分</div>
                    </div>
                    
                    <div className="flex items-center">
                      <StarIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <div className="text-sm text-gray-500 w-16">最大スコア</div>
                      <div className="font-medium">{scenario.maxScore}点</div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="text-sm text-gray-500 w-20">使用回数</div>
                      <div className="font-medium">{scenario.usageCount}回</div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="text-sm text-gray-500 w-20">評価ポイント</div>
                      <div className="font-medium">{scenario.evaluationPoints}</div>
                    </div>
                  </div>

                  {scenario.averageScore > 0 && (
                    <div className="pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-500">平均スコア</div>
                          <div className="font-medium">{Math.round(scenario.averageScore)}点</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">平均完了時間</div>
                          <div className="font-medium">{Math.round(scenario.averageCompletionTime)}分</div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 詳細説明 */}
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold text-gray-900">詳細説明</h2>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                      {scenario.detailedDescription}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 学習目標 */}
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold text-gray-900">学習目標</h2>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{scenario.objectives}</span>
                  </div>
                </CardContent>
              </Card>

              {/* 使用技術 */}
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold text-gray-900">使用技術</h2>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {scenario.technologies.split(',').map((tech, index) => (
                      <span
                        key={index}
                        className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                      >
                        {tech.trim()}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 問題一覧 */}
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold text-gray-900">問題一覧</h2>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {scenario.problems
                      .sort((a, b) => a.order - b.order)
                      .map((problem) => (
                        <div key={problem.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-900">
                              問題 {problem.order}: {problem.title}
                            </h3>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                {problem.gradingMethod === 'manual' ? '手動採点' : 
                                 problem.gradingMethod === 'automatic' ? '自動採点' : 'コマンド採点'}
                              </span>
                              <span className="text-lg font-semibold text-blue-600">
                                {problem.score}点
                              </span>
                            </div>
                          </div>
                          <div className="text-gray-700 whitespace-pre-wrap">
                            {problem.description}
                          </div>
                          {problem.gradingCommand && (
                            <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                              <span className="text-gray-500">採点コマンド: </span>
                              <code className="text-gray-800">{problem.gradingCommand}</code>
                            </div>
                          )}
                          {problem.unlockCondition && problem.unlockCondition.type !== 'none' && (
                            <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                              <span className="text-blue-700 font-medium">出現条件: </span>
                              {problem.unlockCondition.type === 'time' && (
                                <span className="text-blue-600">
                                  開始から{problem.unlockCondition.timeMinutes}分後
                                </span>
                              )}
                              {problem.unlockCondition.type === 'problem_completion' && (
                                <span className="text-blue-600">
                                  前提問題完了後
                                  {problem.unlockCondition.requiredProblemIds && (
                                    <span className="text-xs ml-1">
                                      ({problem.unlockCondition.requiredProblemIds.join(', ')})
                                    </span>
                                  )}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* 評価観点 */}
              {scenario.evaluationCriteria && (
                <Card>
                  <CardHeader>
                    <h2 className="text-lg font-semibold text-gray-900">評価観点</h2>
                  </CardHeader>
                  <CardContent>
                    <div className="text-gray-700 whitespace-pre-wrap">
                      {scenario.evaluationCriteria}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* サイドバー */}
            <div className="space-y-6">
              {/* メタデータ */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">メタデータ</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-500">作成日</div>
                    <div className="text-sm font-medium">
                      {format(scenario.createdAt.toDate(), 'yyyy年MM月dd日', { locale: ja })}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">更新日</div>
                    <div className="text-sm font-medium">
                      {format(scenario.updatedAt.toDate(), 'yyyy年MM月dd日', { locale: ja })}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">バージョン</div>
                    <div className="text-sm font-medium">v{scenario.version}</div>
                  </div>
                </CardContent>
              </Card>

              {/* タグ */}
              {scenario.tags.length > 0 && (
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-900">タグ</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {scenario.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded"
                        >
                          <TagIcon className="h-3 w-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* ヒント */}
              {scenario.hints.length > 0 && (
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-900">ヒント</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {scenario.hints.map((hint) => (
                        <div key={hint.id} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-start">
                            <LightBulbIcon className="h-4 w-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="text-sm text-gray-700">{hint.content}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                ペナルティ: {hint.penalty}点
                                {hint.unlockAfterMinutes && (
                                  <span> • {hint.unlockAfterMinutes}分後に利用可能</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* リソース */}
              {scenario.resources.length > 0 && (
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-900">リソース</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {scenario.resources.map((resource, index) => (
                        <div key={index} className="flex items-start p-3 bg-gray-50 rounded-lg">
                          <div className="mr-3 mt-0.5">
                            {resource.type === 'link' ? (
                              <LinkIcon className="h-4 w-4 text-blue-600" />
                            ) : (
                              <DocumentTextIcon className="h-4 w-4 text-gray-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{resource.title}</div>
                            {resource.url && (
                              <a
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:text-blue-800"
                              >
                                リンクを開く
                              </a>
                            )}
                            {resource.content && (
                              <div className="text-sm text-gray-600 mt-1">
                                {resource.content.substring(0, 100)}
                                {resource.content.length > 100 && '...'}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  )
}