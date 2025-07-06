import Head from 'next/head'
import AdminLayout from '../components/layout/AdminLayout'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import Card, { CardHeader, CardContent } from '../components/ui/Card'
import { 
  ChartBarIcon, 
  UsersIcon, 
  CalendarIcon, 
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline'

const stats = [
  { 
    name: '開催中のイベント', 
    value: '2', 
    change: '+12%', 
    changeType: 'positive',
    icon: CalendarIcon 
  },
  { 
    name: '参加チーム数', 
    value: '24', 
    change: '+8%', 
    changeType: 'positive',
    icon: UsersIcon 
  },
  { 
    name: '今月のイベント', 
    value: '5', 
    change: '+2%', 
    changeType: 'positive',
    icon: ChartBarIcon 
  },
  { 
    name: 'アクティブアラート', 
    value: '3', 
    change: '-2', 
    changeType: 'negative',
    icon: ExclamationTriangleIcon 
  },
]

const recentEvents = [
  {
    id: 1,
    name: '春の陣 2024',
    status: 'active',
    teams: 12,
    startTime: '2024-03-15 10:00',
    duration: '4時間'
  },
  {
    id: 2,
    name: 'セキュリティ対策演習',
    status: 'scheduled',
    teams: 8,
    startTime: '2024-03-20 13:00',
    duration: '3時間'
  },
  {
    id: 3,
    name: 'インフラ構築チャレンジ',
    status: 'completed',
    teams: 15,
    startTime: '2024-03-10 09:00',
    duration: '6時間'
  },
]

const recentActivity = [
  {
    id: 1,
    message: 'チーム "DevOps Masters" がシナリオ3を完了しました',
    time: '5分前',
    type: 'success'
  },
  {
    id: 2,
    message: '新しいチーム "Cloud Ninjas" が登録されました',
    time: '12分前',
    type: 'info'
  },
  {
    id: 3,
    message: 'サーバー負荷が高くなっています',
    time: '18分前',
    type: 'warning'
  },
  {
    id: 4,
    message: 'イベント "春の陣 2024" が開始されました',
    time: '2時間前',
    type: 'info'
  },
]

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <Head>
        <title>ダッシュボード - GameDay Console</title>
      </Head>

      <AdminLayout>
        <div className="space-y-8">
          {/* Page header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
            <p className="mt-2 text-gray-600">
              Game Day イベントの概要と最新の活動状況
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.name}>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <stat.icon className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="ml-4 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.name}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {stat.value}
                        </div>
                        <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                          stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {stat.change}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Recent Events */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">最近のイベント</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h4 className="font-medium text-gray-900">{event.name}</h4>
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            event.status === 'active' 
                              ? 'bg-green-100 text-green-800'
                              : event.status === 'scheduled'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {event.status === 'active' ? '開催中' : 
                             event.status === 'scheduled' ? '予定' : '完了'}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-gray-600">
                          {event.teams} チーム参加 • {event.duration} • {event.startTime}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">最新の活動</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${
                        activity.type === 'success' 
                          ? 'bg-green-400'
                          : activity.type === 'warning'
                          ? 'bg-yellow-400'
                          : 'bg-blue-400'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  )
}