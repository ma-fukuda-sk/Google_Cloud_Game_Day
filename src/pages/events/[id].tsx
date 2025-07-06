import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import ProtectedRoute from '../../components/auth/ProtectedRoute'
import Card, { CardHeader, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import AddTeamModal from '../../components/teams/AddTeamModal'
import EditTeamModal from '../../components/teams/EditTeamModal'
import { 
  ArrowLeftIcon,
  CalendarIcon,
  UsersIcon,
  ClockIcon,
  CogIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { Event, Team } from '../../types/event'
import { Scenario } from '../../types/scenario'
import { eventService } from '../../services/eventService'
import { teamService } from '../../services/teamService'
import { scenarioService } from '../../services/scenarioService'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

export default function EventDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const [event, setEvent] = useState<Event | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isAddTeamModalOpen, setIsAddTeamModalOpen] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [isEditTeamModalOpen, setIsEditTeamModalOpen] = useState(false)

  const loadEventData = async (eventId: string) => {
    try {
      setLoading(true)
      
      // イベント詳細取得
      const eventData = await eventService.getEvent(eventId)
      if (!eventData) {
        setError('イベントが見つかりません')
        return
      }
      setEvent(eventData)

      // チーム一覧取得
      const teamsData = await teamService.getTeamsByEvent(eventId)
      setTeams(teamsData)

      // シナリオ詳細取得
      if (eventData.scenarios && eventData.scenarios.length > 0) {
        const scenarioPromises = eventData.scenarios.map(scenarioId => 
          scenarioService.getScenario(scenarioId)
        )
        const scenarioResults = await Promise.all(scenarioPromises)
        const validScenarios = scenarioResults.filter(scenario => scenario !== null) as Scenario[]
        setScenarios(validScenarios)
      }
      
    } catch (error) {
      console.error('イベント詳細取得エラー:', error)
      setError('イベント詳細の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id && typeof id === 'string') {
      loadEventData(id)
    }
  }, [id])

  const getStatusColor = (status: Event['status']) => {
    switch (status) {
      case 'draft': return 'gray'
      case 'published': return 'blue'
      case 'active': return 'green'
      case 'completed': return 'purple'
      case 'cancelled': return 'red'
      default: return 'gray'
    }
  }

  const getStatusText = (status: Event['status']) => {
    switch (status) {
      case 'draft': return '下書き'
      case 'published': return '公開中'
      case 'active': return '進行中'
      case 'completed': return '完了'
      case 'cancelled': return 'キャンセル'
      default: return status
    }
  }

  const getScoringTypeText = (type: Event['scoringType']) => {
    switch (type) {
      case 'points': return 'ポイント制'
      case 'time': return '時間制'
      case 'hybrid': return 'ハイブリッド'
      default: return type
    }
  }

  const handleDeleteEvent = async () => {
    if (!event || !window.confirm('このイベントを削除しますか？')) {
      return
    }

    try {
      await eventService.deleteEvent(event.id)
      router.push('/events')
    } catch (error) {
      console.error('イベント削除エラー:', error)
      setError('イベントの削除に失敗しました')
    }
  }

  const handleTeamAdded = () => {
    // チーム追加後にデータを再読み込み
    if (id && typeof id === 'string') {
      loadEventData(id)
    }
  }

  const handleTeamUpdated = () => {
    // チーム更新後にデータを再読み込み
    if (id && typeof id === 'string') {
      loadEventData(id)
    }
  }

  const handleEditTeam = (team: Team) => {
    setSelectedTeam(team)
    setIsEditTeamModalOpen(true)
  }

  const handleDeleteTeam = async (team: Team) => {
    if (!window.confirm(`${team.name} を削除しますか？`)) {
      return
    }

    try {
      await teamService.deleteTeam(team.id)
      // データを再読み込み
      if (id && typeof id === 'string') {
        loadEventData(id)
      }
    } catch (error) {
      console.error('チーム削除エラー:', error)
      setError('チームの削除に失敗しました')
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

  if (error || !event) {
    return (
      <ProtectedRoute>
        <AdminLayout>
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {error || 'イベントが見つかりません'}
            </h2>
            <Link href="/events">
              <Button variant="outline">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                イベント一覧に戻る
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
        <title>{event.name} - GameDay Console</title>
      </Head>

      <AdminLayout>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* ページヘッダー */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/events">
                <Button variant="outline" size="sm">
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  戻る
                </Button>
              </Link>
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-2xl font-bold text-gray-900">{event.name}</h1>
                  <Badge color={getStatusColor(event.status)}>
                    {getStatusText(event.status)}
                  </Badge>
                </div>
                {event.description && (
                  <p className="mt-2 text-gray-600">{event.description}</p>
                )}
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Link href={`/events/${event.id}/edit`}>
                <Button variant="outline">
                  <PencilIcon className="h-4 w-4 mr-2" />
                  編集
                </Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={handleDeleteEvent}
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
                      <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm text-gray-500">開始日時</div>
                        <div className="font-medium">
                          {format(event.startDate.toDate(), 'yyyy年MM月dd日 HH:mm', { locale: ja })}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm text-gray-500">終了日時</div>
                        <div className="font-medium">
                          {format(event.endDate.toDate(), 'yyyy年MM月dd日 HH:mm', { locale: ja })}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <ClockIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm text-gray-500">予定時間</div>
                        <div className="font-medium">{event.duration}分</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <UsersIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm text-gray-500">参加チーム</div>
                        <div className="font-medium">
                          {event.currentTeamCount} / {event.maxTeams} チーム
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500 mb-2">採点方式</div>
                    <div className="font-medium">{getScoringTypeText(event.scoringType)}</div>
                  </div>

                  {event.registrationDeadline && (
                    <div className="pt-4 border-t border-gray-200">
                      <div className="text-sm text-gray-500 mb-2">参加登録締切</div>
                      <div className="font-medium">
                        {format(event.registrationDeadline.toDate(), 'yyyy年MM月dd日 HH:mm', { locale: ja })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 設定情報 */}
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold text-gray-900">イベント設定</h2>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <CogIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm text-gray-500">遅刻参加</div>
                        <div className="font-medium">
                          {event.settings.allowLateRegistration ? '許可' : '不許可'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <CogIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm text-gray-500">自動採点開始</div>
                        <div className="font-medium">
                          {event.settings.autoStartScoring ? '有効' : '無効'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <CogIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm text-gray-500">リーダーボード表示</div>
                        <div className="font-medium">
                          {event.settings.showLeaderboard ? '表示' : '非表示'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <CogIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm text-gray-500">通知機能</div>
                        <div className="font-medium">
                          {event.settings.notificationEnabled ? '有効' : '無効'}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* サイドバー */}
            <div className="space-y-6">
              {/* 参加チーム */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">参加チーム</h3>
                    <Button 
                      size="sm"
                      onClick={() => setIsAddTeamModalOpen(true)}
                      disabled={event.currentTeamCount >= event.maxTeams}
                    >
                      チーム追加
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {teams.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500">
                        まだチームが登録されていません
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {teams.map((team) => (
                        <div key={team.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{team.name}</div>
                            <div className="text-sm text-gray-500">
                              {team.members.length}名 • スコア: {team.score}
                            </div>
                            {team.gcpProjectId && (
                              <div className="text-xs text-gray-400 mt-1">
                                プロジェクト: {team.gcpProjectId}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Badge color={team.status === 'active' ? 'green' : 'gray'}>
                              {team.status}
                            </Badge>
                            
                            {/* チーム管理ボタン */}
                            <div className="flex space-x-1">
                              <button
                                onClick={() => handleEditTeam(team)}
                                className="p-1 text-gray-400 hover:text-blue-600 rounded"
                                title="編集"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteTeam(team)}
                                className="p-1 text-gray-400 hover:text-red-600 rounded"
                                title="削除"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 使用シナリオ */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">使用シナリオ</h3>
                    <Link href={`/events/${event.id}/edit`}>
                      <Button size="sm" variant="outline">
                        編集
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {scenarios.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500">
                        シナリオが設定されていません
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {scenarios.map((scenario) => (
                        <div key={scenario.id} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{scenario.title}</div>
                              <div className="text-sm text-gray-500 mt-1">{scenario.description}</div>
                              <div className="flex items-center space-x-3 mt-2">
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  {scenario.difficulty === 'beginner' && '初級'}
                                  {scenario.difficulty === 'intermediate' && '中級'}
                                  {scenario.difficulty === 'advanced' && '上級'}
                                  {scenario.difficulty === 'expert' && 'エキスパート'}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {scenario.estimatedTimeMinutes}分
                                </span>
                                <span className="text-xs text-gray-500">
                                  最大{scenario.maxScore}点
                                </span>
                              </div>
                            </div>
                            <Link href={`/scenarios/${scenario.id}`}>
                              <Button size="sm" variant="outline" className="ml-2">
                                詳細
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* チーム追加モーダル */}
        {event && (
          <AddTeamModal
            isOpen={isAddTeamModalOpen}
            onClose={() => setIsAddTeamModalOpen(false)}
            event={event}
            onTeamAdded={handleTeamAdded}
          />
        )}

        {/* チーム編集モーダル */}
        {selectedTeam && (
          <EditTeamModal
            isOpen={isEditTeamModalOpen}
            onClose={() => setIsEditTeamModalOpen(false)}
            team={selectedTeam}
            onTeamUpdated={handleTeamUpdated}
          />
        )}
      </AdminLayout>
    </ProtectedRoute>
  )
}