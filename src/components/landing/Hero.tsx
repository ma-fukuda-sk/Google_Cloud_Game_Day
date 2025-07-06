import { ArrowRightIcon, PlayIcon } from '@heroicons/react/24/outline'
import Button from '../ui/Button'

export default function Hero() {
  return (
    <div className="relative overflow-hidden bg-white">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-green-50" />
      
      <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-16 sm:pt-24 sm:pb-20 lg:px-8 lg:pt-32">
        <div className="mx-auto max-w-2xl text-center">
          {/* Badge */}
          <div className="mb-8">
            <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
              <PlayIcon className="mr-1.5 h-4 w-4" />
              Game Day 管理プラットフォーム
            </span>
          </div>
          
          {/* Main heading */}
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            <span className="text-blue-600">Game Day</span> を
            <br />
            もっと簡単に
          </h1>
          
          {/* Description */}
          <p className="mt-6 text-lg leading-8 text-gray-600">
            GameDay Console は、チーム対抗の技術訓練イベント「Game Day」の
            企画から運営までを一元管理できるクラウドプラットフォームです。
          </p>
          
          {/* CTA buttons */}
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button 
              size="lg"
              onClick={() => window.location.href = '/login'}
            >
              管理者ログイン
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
            >
              デモを見る
            </Button>
          </div>
          
          {/* Stats */}
          <div className="mt-16 flow-root sm:mt-20">
            <div className="mx-auto grid max-w-lg grid-cols-3 gap-8 lg:max-w-none">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">100+</div>
                <div className="mt-1 text-sm text-gray-500">開催イベント</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">500+</div>
                <div className="mt-1 text-sm text-gray-500">参加チーム</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">2000+</div>
                <div className="mt-1 text-sm text-gray-500">参加者</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}