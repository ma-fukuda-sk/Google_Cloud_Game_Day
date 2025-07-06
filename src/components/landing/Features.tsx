import {
  ClockIcon,
  UsersIcon,
  ChartBarIcon,
  CogIcon,
  ShieldCheckIcon,
  CloudIcon
} from '@heroicons/react/24/outline'
import Card, { CardContent } from '../ui/Card'

const features = [
  {
    name: 'リアルタイム管理',
    description: 'イベントの進行状況をリアルタイムで監視し、即座に対応できます。',
    icon: ClockIcon,
    color: 'text-blue-600 bg-blue-100'
  },
  {
    name: 'チーム管理',
    description: 'チームの登録から進捗管理まで、参加者情報を一元管理できます。',
    icon: UsersIcon,
    color: 'text-green-600 bg-green-100'
  },
  {
    name: 'スコアボード',
    description: '自動スコア計算とリアルタイムランキング表示で競争を演出します。',
    icon: ChartBarIcon,
    color: 'text-purple-600 bg-purple-100'
  },
  {
    name: 'シナリオ管理',
    description: '多様な技術課題シナリオを作成・管理し、難易度を調整できます。',
    icon: CogIcon,
    color: 'text-orange-600 bg-orange-100'
  },
  {
    name: 'セキュリティ',
    description: 'Google Cloud の堅牢なセキュリティで参加者データを安全に保護します。',
    icon: ShieldCheckIcon,
    color: 'text-red-600 bg-red-100'
  },
  {
    name: 'クラウド基盤',
    description: 'スケーラブルなGCPインフラで大規模イベントにも対応できます。',
    icon: CloudIcon,
    color: 'text-indigo-600 bg-indigo-100'
  }
]

export default function Features() {
  return (
    <div className="bg-gray-50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-600">
            強力な機能
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Game Day運営に必要なすべてを
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            企画から実施、分析まで。Game Day の成功に必要な機能をワンストップで提供します。
          </p>
        </div>
        
        <div className="mx-auto mt-12 max-w-7xl">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.name} className="relative group hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${feature.color}`}>
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {feature.name}
                    </h3>
                    <CardContent className="mt-2 text-sm">
                      {feature.description}
                    </CardContent>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}