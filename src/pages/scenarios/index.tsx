import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import ProtectedRoute from '../../components/auth/ProtectedRoute'
import Card, { CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  ClockIcon,
  StarIcon,
  TagIcon
} from '@heroicons/react/24/outline'
import { Scenario } from '../../types/scenario'
import { scenarioService } from '../../services/scenarioService'

export default function ScenariosPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [filteredScenarios, setFilteredScenarios] = useState<Scenario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<Scenario['status'] | ''>('')
  const [categoryFilter, setCategoryFilter] = useState<Scenario['category'] | ''>('')
  const [difficultyFilter, setDifficultyFilter] = useState<Scenario['difficulty'] | ''>('')

  const loadScenarios = async () => {
    try {
      setLoading(true)
      setError('')
      
      const scenariosData = await scenarioService.getScenarios()
      setScenarios(scenariosData)
      setFilteredScenarios(scenariosData)
      
    } catch (error) {
      console.error('シナリオ取得エラー:', error)
      setError('シナリオの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadScenarios()
  }, [])

  // フィルタリング機能
  useEffect(() => {
    let filtered = scenarios

    // 検索フィルタ
    if (searchTerm) {
      filtered = filtered.filter(scenario => 
        scenario.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scenario.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scenario.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // ステータスフィルタ
    if (statusFilter) {
      filtered = filtered.filter(scenario => scenario.status === statusFilter)
    }

    // カテゴリフィルタ
    if (categoryFilter) {
      filtered = filtered.filter(scenario => scenario.category === categoryFilter)
    }

    // 難易度フィルタ
    if (difficultyFilter) {
      filtered = filtered.filter(scenario => scenario.difficulty === difficultyFilter)
    }

    setFilteredScenarios(filtered)
  }, [scenarios, searchTerm, statusFilter, categoryFilter, difficultyFilter])

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

  return (
    <ProtectedRoute>
      <Head>
        <title>シナリオ管理 - GameDay Console</title>
      </Head>

      <AdminLayout>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* ページヘッダー */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">シナリオ管理</h1>
              <p className="mt-2 text-gray-600">
                GameDayで使用するシナリオを管理します
              </p>
            </div>
            <Link href="/scenarios/new">
              <Button>
                <PlusIcon className="h-4 w-4 mr-2" />
                新規シナリオ
              </Button>
            </Link>
          </div>

          {/* エラー表示 */}
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {/* フィルターセクション */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* 検索 */}
                <div className="lg:col-span-2">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="シナリオ名、説明、タグで検索..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* ステータス */}
                <div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as Scenario['status'] | '')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">全ステータス</option>
                    <option value="draft">下書き</option>
                    <option value="published">公開中</option>
                    <option value="archived">アーカイブ</option>
                  </select>
                </div>

                {/* カテゴリ */}
                <div>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value as Scenario['category'] | '')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">全カテゴリ</option>
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
                </div>

                {/* 難易度 */}
                <div>
                  <select
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value as Scenario['difficulty'] | '')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">全難易度</option>
                    <option value="beginner">初級</option>
                    <option value="intermediate">中級</option>
                    <option value="advanced">上級</option>
                    <option value="expert">エキスパート</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 統計情報 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-500">総シナリオ数</div>
                <div className="text-2xl font-bold text-gray-900">{scenarios.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-500">公開中</div>
                <div className="text-2xl font-bold text-green-600">
                  {scenarios.filter(s => s.status === 'published').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-500">下書き</div>
                <div className="text-2xl font-bold text-gray-600">
                  {scenarios.filter(s => s.status === 'draft').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-500">フィルター結果</div>
                <div className="text-2xl font-bold text-blue-600">{filteredScenarios.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* シナリオリスト */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredScenarios.length === 0 ? (
              <div className="lg:col-span-2 text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  シナリオが見つかりません
                </h3>
                <p className="text-gray-500 mb-4">
                  条件に一致するシナリオがありません
                </p>
                <Link href="/scenarios/new">
                  <Button>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    新規シナリオを作成
                  </Button>
                </Link>
              </div>
            ) : (
              filteredScenarios.map((scenario) => (
                <Card key={scenario.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            <Link href={`/scenarios/${scenario.id}`} className="hover:text-blue-600">
                              {scenario.title}
                            </Link>
                          </h3>
                          <Badge color={getStatusColor(scenario.status)}>
                            {getStatusText(scenario.status)}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {scenario.description}
                        </p>

                        <div className="flex items-center space-x-4 mb-3">
                          <div className="flex items-center text-sm text-gray-500">
                            <Badge color={getDifficultyColor(scenario.difficulty)} size="sm">
                              {getDifficultyText(scenario.difficulty)}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500">
                            {getCategoryText(scenario.category)}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            {scenario.estimatedTimeMinutes}分
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <StarIcon className="h-4 w-4 mr-1" />
                            {scenario.maxScore}点
                          </div>
                        </div>

                        {scenario.tags.length > 0 && (
                          <div className="flex items-center space-x-1">
                            <TagIcon className="h-4 w-4 text-gray-400" />
                            <div className="flex flex-wrap gap-1">
                              {scenario.tags.slice(0, 3).map((tag, index) => (
                                <span
                                  key={index}
                                  className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                              {scenario.tags.length > 3 && (
                                <span className="text-xs text-gray-500">
                                  +{scenario.tags.length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                      <div className="text-xs text-gray-500">
                        使用回数: {scenario.usageCount}回
                      </div>
                      <div className="flex space-x-2">
                        <Link href={`/scenarios/${scenario.id}/edit`}>
                          <Button size="sm" variant="outline">
                            編集
                          </Button>
                        </Link>
                        <Link href={`/scenarios/${scenario.id}`}>
                          <Button size="sm">
                            詳細
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  )
}