import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import ProtectedRoute from '../../components/auth/ProtectedRoute'
import Card, { CardHeader, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { 
  PlusIcon, 
  CalendarIcon, 
  UsersIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { Event } from '../../types/event'
import { eventService } from '../../services/eventService'
import { testFirestoreConnection } from '../../services/testFirestore'
import { useAuth } from '../../contexts/AuthContext'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

export default function EventsPage() {
  const { user } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadEvents = async () => {
    try {
      setLoading(true)
      console.log('Firebase認証状態:', user ? 'ログイン中' : '未ログイン')
      console.log('ユーザー情報:', user)
      
      // Firestore接続テスト
      const connectionTest = await testFirestoreConnection()
      console.log('Firestore接続テスト結果:', connectionTest)
      
      const eventsData = await eventService.getEvents()
      console.log('取得したイベントデータ:', eventsData)
      setEvents(eventsData)
    } catch (error) {
      console.error('イベント取得エラー（詳細）:', error)
      if (error instanceof Error) {
        setError(`エラー: ${error.message}`)
      } else {
        setError('イベントの取得に失敗しました')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      loadEvents()
    }
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

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

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm('このイベントを削除しますか？')) {
      try {
        await eventService.deleteEvent(eventId)
        await loadEvents()
      } catch (error) {
        console.error('イベント削除エラー:', error)
        setError('イベントの削除に失敗しました')
      }
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

  return (
    <ProtectedRoute>
      <Head>
        <title>イベント管理 - GameDay Console</title>
      </Head>

      <AdminLayout>
        <div className="space-y-6">
          {/* ページヘッダー */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">イベント管理</h1>
              <p className="mt-2 text-gray-600">
                Game Dayイベントの作成・管理を行います
              </p>
            </div>
            <Link href="/events/new">
              <Button>
                <PlusIcon className="h-4 w-4 mr-2" />
                新規イベント作成
              </Button>
            </Link>
          </div>

          {/* エラー表示 */}
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {/* イベント一覧 */}
          {events.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  イベントがありません
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  新しいGame Dayイベントを作成して始めましょう
                </p>
                <div className="mt-6">
                  <Link href="/events/new">
                    <Button>
                      <PlusIcon className="h-4 w-4 mr-2" />
                      イベントを作成
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {events.map((event) => (
                <Card key={event.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {event.name}
                        </h3>
                        <Badge color={getStatusColor(event.status)} className="mt-2">
                          {getStatusText(event.status)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    {event.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {format(event.startDate.toDate(), 'yyyy/MM/dd HH:mm', { locale: ja })}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <UsersIcon className="h-4 w-4 mr-2" />
                        {event.currentTeamCount} / {event.maxTeams} チーム
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Link href={`/events/${event.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <EyeIcon className="h-4 w-4 mr-1" />
                          詳細
                        </Button>
                      </Link>
                      <Link href={`/events/${event.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteEvent(event.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  )
}