import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { signInWithGoogle, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true)
      setError('')
      await signInWithGoogle()
      // AuthContextのuseEffectでダッシュボードにリダイレクトされる
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'ログインに失敗しました')
      setIsLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>ログイン - GameDay Console</title>
        <meta name="description" content="GameDay Console管理者ログイン" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
              <span className="text-white font-bold text-lg">GD</span>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            GameDay Console
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            管理者としてログインしてください
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <Card className="px-4 py-8 sm:px-10">
            <div className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">エラー</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{error}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Google Login Button */}
              <div>
                <Button
                  onClick={handleGoogleLogin}
                  isLoading={isLoading}
                  disabled={isLoading}
                  className="w-full flex justify-center items-center"
                  size="lg"
                >
                  {!isLoading && (
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  )}
                  Googleアカウントでログイン
                  {!isLoading && <ArrowRightIcon className="ml-2 h-4 w-4" />}
                </Button>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">または</span>
                </div>
              </div>

              {/* Demo Login */}
              <div>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/dashboard'}
                  className="w-full"
                  size="lg"
                >
                  デモとして体験
                </Button>
              </div>

              {/* Back to home */}
              <div className="text-center">
                <Link
                  href="/"
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  ← トップページに戻る
                </Link>
              </div>
            </div>
          </Card>

          {/* Security note */}
          <div className="mt-6">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    セキュアなログイン
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      Google Cloud Identity & Access Management (IAM) により
                      安全に認証されます。個人情報は適切に保護されます。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}