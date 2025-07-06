import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import {
  ClockIcon,
  TrophyIcon,
  PlayIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  LightBulbIcon,
  ChevronRightIcon,
  Bars3Icon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { teamService } from '../../../services/teamService'
import { eventService } from '../../../services/eventService'
import { scenarioService } from '../../../services/scenarioService'
import { Team, Event } from '../../../types/event'
import { Scenario, Problem } from '../../../types/scenario'
import Card, { CardHeader, CardContent } from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import GameSidebar from '../../../components/gameconsole/GameSidebar'

export default function GameConsolePage() {
  const router = useRouter()
  const { eventId, teamId } = router.query
  const [team, setTeam] = useState<Team | null>(null)
  const [event, setEvent] = useState<Event | null>(null)
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null)
  const [expandedProblem, setExpandedProblem] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // データ読み込み
  const loadData = async () => {
    if (!eventId || !teamId || typeof eventId !== 'string' || typeof teamId !== 'string') {
      return
    }

    try {
      setLoading(true)
      setError('')

      // チーム情報を取得
      const teamData = await teamService.getTeam(teamId)
      if (!teamData) {
        setError('チームが見つかりません')
        return
      }
      setTeam(teamData)

      // イベント情報を取得
      const eventData = await eventService.getEvent(eventId)
      if (!eventData) {
        setError('イベントが見つかりません')
        return
      }
      setEvent(eventData)

      // イベントに紐づくシナリオを取得
      const scenarioPromises = eventData.scenarios.map(scenarioId => 
        scenarioService.getScenario(scenarioId)
      )
      const scenarioResults = await Promise.all(scenarioPromises)
      const validScenarios = scenarioResults.filter(s => s !== null) as Scenario[]
      setScenarios(validScenarios)

      // 最初のシナリオを選択
      if (validScenarios.length > 0) {
        setSelectedScenario(validScenarios[0])
      }

    } catch (error) {
      console.error('データ取得エラー:', error)
      setError('データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [eventId, teamId]) // eslint-disable-line react-hooks/exhaustive-deps

  // シナリオ選択
  const handleSelectScenario = (scenario: Scenario) => {
    setSelectedScenario(scenario)
    setExpandedProblem(null) // 展開された問題をリセット
    setSidebarOpen(false) // モバイルでサイドバーを閉じる
  }

  // 問題のアコーディオンをトグル
  const toggleProblem = (problemId: string) => {
    setExpandedProblem(expandedProblem === problemId ? null : problemId)
  }

  // 回答提出処理
  const handleSubmitAnswer = async (problem: Problem) => {
    if (!problem || !team) return

    // 既に回答済みの問題かチェック
    if (teamService.isProblemCompletedForScenario(team, selectedScenario.id, problem.id)) {
      alert('この問題は既に回答済みです。')
      return
    }

    if (!confirm(`問題「${problem.title}」の回答を提出しますか？`)) {
      return
    }

    try {
      setSubmitting(true)
      
      // 問題完了をマーク（スコア加算も含む）
      await teamService.markProblemCompleted(team.id, selectedScenario.id, problem.id, problem.score)

      // シナリオの全問題が完了した場合、シナリオも完了にマーク
      if (selectedScenario) {
        const allProblemsCompleted = selectedScenario.problems.every(p => 
          teamService.isProblemCompletedForScenario(team, selectedScenario.id, p.id) || p.id === problem.id
        )
        
        if (allProblemsCompleted && !team.completedScenarios.includes(selectedScenario.id)) {
          await teamService.markScenarioCompleted(team.id, selectedScenario.id)
        }
      }
      
      // チーム情報を再読み込み
      await loadData()
      
      alert(`回答を提出しました！ +${problem.score}点`)
      setExpandedProblem(null)
      
    } catch (error) {
      console.error('回答提出エラー:', error)
      alert('回答の提出に失敗しました: ' + (error instanceof Error ? error.message : '不明なエラー'))
    } finally {
      setSubmitting(false)
    }
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !team || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-2 text-lg font-medium text-gray-900">
            {error || 'データの読み込みに失敗しました'}
          </h2>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{team.name} - {event.name} | GameDay Console</title>
      </Head>

      <div className="min-h-screen bg-gray-50 flex">
        {/* モバイル用サイドバーオーバーレイ */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
            <div className="relative flex-1 flex flex-col max-w-xs w-full">
              <GameSidebar
                team={team}
                event={event}
                scenarios={scenarios}
                selectedScenario={selectedScenario}
                onSelectScenario={handleSelectScenario}
                className="h-full"
              />
            </div>
          </div>
        )}

        {/* デスクトップ用サイドバー */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <GameSidebar
            team={team}
            event={event}
            scenarios={scenarios}
            selectedScenario={selectedScenario}
            onSelectScenario={handleSelectScenario}
            className="h-screen"
          />
        </div>

        {/* メインコンテンツエリア */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* モバイル用ヘッダー */}
          <div className="bg-white shadow-sm lg:hidden">
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="text-gray-500 hover:text-gray-600"
                >
                  <Bars3Icon className="h-6 w-6" />
                </button>
                <div className="flex-1 text-center">
                  <h1 className="text-lg font-semibold text-gray-900">{team.name}</h1>
                  <p className="text-sm text-gray-500">{event.name}</p>
                </div>
                <div className="flex items-center">
                  <TrophyIcon className="h-5 w-5 text-yellow-500 mr-1" />
                  <span className="text-sm font-semibold text-gray-900">{team.score}</span>
                </div>
              </div>
            </div>
          </div>

          {/* メインコンテンツ */}
          <div className="flex-1 overflow-auto">
            <div className="p-4 lg:p-8">
              {selectedScenario ? (
                <div className="space-y-6">
                  {/* シナリオ詳細 */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900">
                          {selectedScenario.title}
                        </h2>
                        <div className="flex items-center space-x-2">
                          <Badge variant="blue">
                            {selectedScenario.difficulty === 'beginner' && '初級'}
                            {selectedScenario.difficulty === 'intermediate' && '中級'}
                            {selectedScenario.difficulty === 'advanced' && '上級'}
                            {selectedScenario.difficulty === 'expert' && 'エキスパート'}
                          </Badge>
                          <div className="flex items-center text-sm text-gray-500">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            {selectedScenario.estimatedTimeMinutes}分
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-gray-700">{selectedScenario.description}</p>
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 mb-2">詳細説明</h3>
                          <p className="text-sm text-gray-600 whitespace-pre-line">
                            {selectedScenario.detailedDescription}
                          </p>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-900 mb-2">学習目標</h3>
                          <p className="text-sm text-gray-600">{selectedScenario.objectives}</p>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-900 mb-2">使用技術</h3>
                          <p className="text-sm text-gray-600">{selectedScenario.technologies}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 問題一覧（アコーディオン形式） */}
                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-semibold text-gray-900">問題一覧</h3>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {selectedScenario.problems
                          .sort((a, b) => a.order - b.order)
                          .map((problem) => {
                            const isExpanded = expandedProblem === problem.id
                            const isCompleted = teamService.isProblemCompletedForScenario(team, selectedScenario.id, problem.id)
                            
                            return (
                              <div
                                key={problem.id}
                                className={`border rounded-lg overflow-hidden transition-all duration-200 ${
                                  isCompleted 
                                    ? 'border-green-200 bg-green-50' 
                                    : 'border-gray-200'
                                }`}
                              >
                                {/* 問題ヘッダー */}
                                <div
                                  className={`p-4 cursor-pointer transition-colors ${
                                    isCompleted
                                      ? 'bg-green-50 hover:bg-green-100'
                                      : isExpanded
                                      ? 'bg-blue-50 border-b border-gray-200'
                                      : 'hover:bg-gray-50'
                                  }`}
                                  onClick={() => toggleProblem(problem.id)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-2">
                                        {isCompleted && (
                                          <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
                                        )}
                                        <span className={`font-medium ${
                                          isCompleted ? 'text-green-900' : 'text-gray-900'
                                        }`}>
                                          問題 {problem.order}: {problem.title}
                                        </span>
                                        <Badge 
                                          variant={isCompleted ? "green" : "gray"} 
                                          size="sm"
                                        >
                                          {problem.score}点
                                        </Badge>
                                        {isCompleted && (
                                          <Badge variant="green" size="sm">
                                            完了
                                          </Badge>
                                        )}
                                        <Badge 
                                          variant="blue" 
                                          size="sm"
                                          className="text-xs"
                                        >
                                          {problem.gradingMethod === 'automatic' && '自動採点'}
                                          {problem.gradingMethod === 'manual' && '手動採点'}
                                          {problem.gradingMethod === 'command' && 'コマンド採点'}
                                        </Badge>
                                      </div>
                                      <p className={`text-sm mt-1 line-clamp-2 ${
                                        isCompleted ? 'text-green-700' : 'text-gray-600'
                                      }`}>
                                        {problem.description}
                                      </p>
                                    </div>
                                    <div className="ml-4 flex items-center space-x-2">
                                      <ChevronRightIcon className={`h-5 w-5 transition-transform duration-200 ${
                                        isCompleted ? 'text-green-400' : 'text-gray-400'
                                      } ${isExpanded ? 'rotate-90' : ''}`} />
                                    </div>
                                  </div>
                                </div>

                                {/* 問題詳細（展開時） */}
                                {isExpanded && (
                                  <div className="p-4 bg-white border-t border-gray-100 animate-in slide-in-from-top duration-200">
                                    <div className="space-y-4">
                                      <div>
                                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                                          問題内容
                                        </h4>
                                        <div className="text-sm text-gray-700 whitespace-pre-line bg-gray-50 p-3 rounded-md">
                                          {problem.description}
                                        </div>
                                      </div>

                                      {problem.gradingCommand && (
                                        <div>
                                          <h4 className="text-sm font-medium text-gray-900 mb-2">
                                            採点コマンド
                                          </h4>
                                          <div className="bg-gray-900 text-gray-100 p-3 rounded-md">
                                            <code className="text-sm">
                                              {problem.gradingCommand}
                                            </code>
                                          </div>
                                        </div>
                                      )}

                                      {/* 回答ボタン */}
                                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                                          <div className="flex items-center">
                                            <TrophyIcon className="h-4 w-4 mr-1" />
                                            {problem.score}点
                                          </div>
                                          <div>
                                            問題 {problem.order} / {selectedScenario.problems.length}
                                          </div>
                                        </div>
                                        
                                        {isCompleted ? (
                                          <div className="flex items-center text-green-600">
                                            <CheckCircleIcon className="h-5 w-5 mr-2" />
                                            <span className="font-medium">回答済み</span>
                                          </div>
                                        ) : (
                                          <Button
                                            onClick={() => handleSubmitAnswer(problem)}
                                            isLoading={submitting}
                                            className="flex items-center bg-green-600 hover:bg-green-700"
                                          >
                                            <PlayIcon className="h-4 w-4 mr-2" />
                                            回答する
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* ヒント */}
                  {selectedScenario.hints.length > 0 && (
                    <Card>
                      <CardHeader>
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                          <LightBulbIcon className="h-5 w-5 mr-2 text-yellow-500" />
                          ヒント
                        </h3>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {selectedScenario.hints.map((hint) => (
                            <div key={hint.id} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="text-sm text-gray-700">{hint.content}</p>
                                </div>
                                <div className="ml-4 text-xs text-gray-500">
                                  -{hint.penalty}点
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* リソース */}
                  {selectedScenario.resources.length > 0 && (
                    <Card>
                      <CardHeader>
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                          <DocumentTextIcon className="h-5 w-5 mr-2 text-blue-500" />
                          参考資料
                        </h3>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {selectedScenario.resources.map((resource, index) => (
                            <div key={`${resource.title}-${index}`} className="p-3 border border-gray-200 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium text-gray-900">{resource.title}</div>
                                  <div className="text-sm text-gray-500">{resource.type}</div>
                                </div>
                                {resource.url && (
                                  <a
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-900 text-sm"
                                  >
                                    開く
                                  </a>
                                )}
                              </div>
                              {resource.content && (
                                <div className="mt-2 text-sm text-gray-600">
                                  {resource.content}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      シナリオを選択してください
                    </h3>
                    <p className="text-gray-500">
                      サイドバーからシナリオを選択してゲームを開始しましょう
                    </p>
                    <Button
                      className="mt-4 lg:hidden"
                      onClick={() => setSidebarOpen(true)}
                    >
                      <Bars3Icon className="h-4 w-4 mr-2" />
                      シナリオを選択
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}