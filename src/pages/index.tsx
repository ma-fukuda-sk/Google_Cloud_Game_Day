import Head from 'next/head'
import Hero from '../components/landing/Hero'
import Features from '../components/landing/Features'
import LoginPrompt from '../components/landing/LoginPrompt'

export default function Home() {
  return (
    <>
      <Head>
        <title>GameDay Console - Game Day管理プラットフォーム</title>
        <meta
          name="description"
          content="チーム対抗の技術訓練イベント「Game Day」の企画から運営までを一元管理できるクラウドプラットフォーム"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen">
        <Hero />
        <Features />
        <LoginPrompt />
      </main>

      <footer className="bg-gray-900 text-white py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">GameDay Console</h3>
              <p className="text-gray-300 text-sm">
                Google Cloud Platform 上で動作する
                Game Day管理プラットフォーム
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">機能</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>イベント管理</li>
                <li>チーム管理</li>
                <li>スコアボード</li>
                <li>リアルタイム監視</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">サポート</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>ドキュメント</li>
                <li>GitHub</li>
                <li>お問い合わせ</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700">
            <p className="text-center text-sm text-gray-400">
              © 2024 GameDay Console. Built with Google Cloud Platform.
            </p>
          </div>
        </div>
      </footer>
    </>
  )
}
