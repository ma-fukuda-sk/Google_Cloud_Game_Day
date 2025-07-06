import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import ProtectedRoute from '../../components/auth/ProtectedRoute'
import Card, { CardHeader, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import AddTeamModal from '../../components/teams/AddTeamModal'
import EditTeamModal from '../../components/teams/EditTeamModal'
import {
  PlusIcon,
  UsersIcon,
  GlobeAltIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { teamService } from '../../services/teamService'
import { eventService } from '../../services/eventService'
import { Team } from '../../types/event'
import { Event } from '../../types/event'

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)

  // チーム一覧とイベント一覧を取得
  const loadData = async () => {
    try {
      setLoading(true)
      setError('')
      
      // 全イベントを取得
      const allEvents = await eventService.getEvents()
      setEvents(allEvents)
      
      // 全チームを取得（各イベントから）
      const allTeams: Team[] = []
      for (const event of allEvents) {
        const eventTeams = await teamService.getTeamsByEvent(event.id)
        allTeams.push(...eventTeams)
      }
      
      setTeams(allTeams)
    } catch (error) {
      console.error('データ取得エラー:', error)
      setError('データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // チーム削除
  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm('このチームを削除してもよろしいですか？')) return
    
    try {
      await teamService.deleteTeam(teamId)
      await loadData() // データを再読み込み
    } catch (error) {
      console.error('チーム削除エラー:', error)
      setError('チームの削除に失敗しました')
    }
  }

  // イベント名を取得するヘルパー関数
  const getEventName = (eventId: string) => {
    const event = events.find(e => e.id === eventId)
    return event ? event.name : 'Unknown Event'
  }

  // ステータスバッジのスタイル
  const getStatusBadge = (status: Team['status']) => {
    const variants = {
      registered: 'blue',
      active: 'green',
      completed: 'gray',
      disqualified: 'red'
    } as const

    const labels = {
      registered: '登録済み',
      active: '参加中',
      completed: '完了',
      disqualified: '失格'
    }

    return (
      <Badge variant={variants[status]}>
        {labels[status]}
      </Badge>
    )
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
        <title>チーム管理 - GameDay Console</title>
      </Head>

      <AdminLayout>
        <div className="space-y-6">
          {/* ページヘッダー */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">チーム管理</h1>
              <p className="mt-2 text-gray-600">
                全イベントのチーム一覧と管理
              </p>
            </div>
            <Button
              onClick={() => setShowAddModal(true)}
              disabled={events.length === 0}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              新規チーム
            </Button>
          </div>

          {/* エラー表示 */}
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {/* 統計情報 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UsersIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-500">総チーム数</div>
                    <div className="text-2xl font-bold text-gray-900">{teams.length}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                      <div className="h-4 w-4 bg-green-600 rounded-full"></div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-500">参加中</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {teams.filter(t => t.status === 'active').length}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <div className="h-4 w-4 bg-gray-600 rounded-full"></div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-500">完了</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {teams.filter(t => t.status === 'completed').length}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <div className="h-4 w-4 bg-blue-600 rounded-full"></div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-500">登録済み</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {teams.filter(t => t.status === 'registered').length}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* チーム一覧テーブル */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">チーム一覧</h2>
            </CardHeader>
            <CardContent>
              {teams.length === 0 ? (
                <div className="text-center py-12">
                  <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">チームがありません</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    最初のチームを作成しましょう
                  </p>
                  <div className="mt-6">
                    <Button
                      onClick={() => setShowAddModal(true)}
                      disabled={events.length === 0}
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      新規チーム
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          イベント名
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          チーム名
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          メンバー数
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          スコア
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ステータス
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          チームURL
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {teams.map((team) => (
                        <tr key={team.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {getEventName(team.eventId)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {team.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {team.members.length}名
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {team.score}点
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(team.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <Link
                              href={`/gameconsole/${team.eventId}/${team.id}`}
                              className="flex items-center text-blue-600 hover:text-blue-900"
                            >
                              <GlobeAltIcon className="h-4 w-4 mr-1" />
                              プレイページ
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => setEditingTeam(team)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteTeam(team.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* チーム追加モーダル */}
        {showAddModal && events.length > 0 && (
          <AddTeamModal
            isOpen={showAddModal}
            event={events[0]}
            onClose={() => setShowAddModal(false)}
            onTeamAdded={() => {
              setShowAddModal(false)
              loadData()
            }}
          />
        )}

        {/* チーム編集モーダル */}
        {editingTeam && (
          <EditTeamModal
            isOpen={!!editingTeam}
            team={editingTeam}
            onClose={() => setEditingTeam(null)}
            onTeamUpdated={() => {
              setEditingTeam(null)
              loadData()
            }}
          />
        )}
      </AdminLayout>
    </ProtectedRoute>
  )
}