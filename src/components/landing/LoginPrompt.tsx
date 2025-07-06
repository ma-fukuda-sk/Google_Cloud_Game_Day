import { ArrowRightIcon } from '@heroicons/react/24/outline'
import Button from '../ui/Button'
import Card from '../ui/Card'

export default function LoginPrompt() {
  return (
    <div className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <Card className="mx-auto max-w-3xl text-center bg-gradient-to-r from-blue-50 to-green-50 border-0">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            今すぐ始めてみませんか？
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            GameDay Console で次回のGame Dayをより効率的に、より楽しく運営しましょう。
            管理者として始めるか、参加者として体験するか選択できます。
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* 管理者ログイン */}
            <div className="flex-1 w-full sm:max-w-sm">
              <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">管理者として開始</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    Game Dayイベントを企画・運営・管理
                  </p>
                  <Button 
                    className="mt-4 w-full"
                    onClick={() => window.location.href = '/login'}
                  >
                    管理者ログイン
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </div>
            
            {/* 参加者として体験 */}
            <div className="flex-1 w-full sm:max-w-sm">
              <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">参加者として体験</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    デモイベントで機能を体験
                  </p>
                  <Button 
                    variant="outline"
                    className="mt-4 w-full"
                  >
                    デモに参加
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </div>
          </div>
          
          <p className="mt-6 text-sm text-gray-500">
            アカウント作成不要。Google アカウントでログインできます。
          </p>
        </Card>
      </div>
    </div>
  )
}