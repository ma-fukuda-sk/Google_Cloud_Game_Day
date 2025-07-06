import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, useEffect, useCallback } from 'react'
import AdminLayout from '../../../components/layout/AdminLayout'
import ProtectedRoute from '../../../components/auth/ProtectedRoute'
import Card, { CardHeader, CardContent } from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useForm, useController } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import DatePicker from 'react-datepicker'
import { eventEditSchema, type EventEditSchemaType } from '../../../schemas/eventEditSchema'
import { eventService } from '../../../services/eventService'
import { scenarioService } from '../../../services/scenarioService'
import { Event } from '../../../types/event'
import { Scenario } from '../../../types/scenario'
import { useAuth } from '../../../contexts/AuthContext'
import 'react-datepicker/dist/react-datepicker.css'

export default function EditEventPage() {
  const router = useRouter()
  const { id } = router.query
  const { user } = useAuth()
  const [event, setEvent] = useState<Event | null>(null)
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [isLoadingScenarios, setIsLoadingScenarios] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [loading, setLoading] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
    control
  } = useForm<EventEditSchemaType>({
    resolver: zodResolver(eventEditSchema)
  })

  const watchedStartDate = watch('startDate')
  const watchedEndDate = watch('endDate')

  // 公開済みシナリオを取得
  const loadScenarios = async () => {
    try {
      setIsLoadingScenarios(true)
      const publishedScenarios = await scenarioService.getPublishedScenarios()
      setScenarios(publishedScenarios)
    } catch (error) {
      console.error('シナリオ取得エラー:', error)
      setSubmitError('シナリオの取得に失敗しました')
    } finally {
      setIsLoadingScenarios(false)
    }
  }

  // イベントデータを読み込み
  const loadEvent = useCallback(async (eventId: string) => {
    try {
      setLoading(true)
      const eventData = await eventService.getEvent(eventId)
      
      if (!eventData) {
        setSubmitError('イベントが見つかりません')
        return
      }

      setEvent(eventData)
      
      // フォームにデータをセット
      reset({
        name: eventData.name,
        description: eventData.description || '',
        status: eventData.status,
        startDate: eventData.startDate.toDate(),
        endDate: eventData.endDate.toDate(),
        duration: eventData.duration,
        maxTeams: eventData.maxTeams,
        registrationDeadline: eventData.registrationDeadline?.toDate() || null,
        scenarios: eventData.scenarios,
        scoringType: eventData.scoringType,
        settings: eventData.settings
      })
      
    } catch (error) {
      console.error('イベント取得エラー:', error)
      setSubmitError('イベントの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [reset])

  useEffect(() => {
    loadScenarios()
    if (id && typeof id === 'string') {
      loadEvent(id)
    }
  }, [id, loadEvent])

  const onSubmit = async (data: EventEditSchemaType) => {
    console.log('フォーム更新開始:', data)
    
    if (!user || !event) {
      setSubmitError('ユーザーまたはイベント情報が不正です')
      return
    }

    try {
      setIsSubmitting(true)
      setSubmitError('')
      
      console.log('イベント更新リクエスト送信中...')
      
      await eventService.updateEvent(event.id, data)
      console.log('イベント更新成功')
      
      router.push(`/events/${event.id}`)
    } catch (error) {
      console.error('イベント更新エラー（詳細）:', error)
      if (error instanceof Error) {
        setSubmitError(`エラー: ${error.message}`)
      } else {
        setSubmitError('イベントの更新に失敗しました')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // シナリオ選択コンポーネント
  const ScenarioSelector = ({ scenarios, control }: {
    scenarios: Scenario[]
    control: ReturnType<typeof useForm<EventEditSchemaType>>['control']
  }) => {
    const { field } = useController({
      control,
      name: 'scenarios',
      defaultValue: []
    })

    const handleScenarioChange = (scenarioId: string, checked: boolean) => {
      const currentValue = field.value || []
      if (checked) {
        field.onChange([...currentValue, scenarioId])
      } else {
        field.onChange(currentValue.filter((id: string) => id !== scenarioId))
      }
    }

    return (
      <div className="space-y-3">
        {scenarios.map((scenario) => {
          const isChecked = field.value?.includes(scenario.id) || false
          
          return (
            <div key={scenario.id} className="border border-gray-200 rounded-lg p-4">
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => handleScenarioChange(scenario.id, e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">{scenario.title}</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {scenario.difficulty === 'beginner' && '初級'}
                      {scenario.difficulty === 'intermediate' && '中級'}
                      {scenario.difficulty === 'advanced' && '上級'}
                      {scenario.difficulty === 'expert' && 'エキスパート'}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {scenario.estimatedTimeMinutes}分
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{scenario.description}</p>
                  <div className="text-xs text-gray-500 mt-2">
                    カテゴリ: {scenario.category} | 最大スコア: {scenario.maxScore}点
                  </div>
                </div>
              </label>
            </div>
          )
        })}
      </div>
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

  if (!event) {
    return (
      <ProtectedRoute>
        <AdminLayout>
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              イベントが見つかりません
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
        <title>{event.name}の編集 - GameDay Console</title>
      </Head>

      <AdminLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* ページヘッダー */}
          <div className="flex items-center space-x-4">
            <Link href={`/events/${event.id}`}>
              <Button variant="outline" size="sm">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                戻る
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">イベント編集</h1>
              <p className="mt-2 text-gray-600">
                {event.name} の設定を編集します
              </p>
            </div>
          </div>

          {/* エラー表示 */}
          {submitError && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{submitError}</div>
            </div>
          )}

          {/* バリデーションエラー表示（デバッグ用） */}
          {Object.keys(errors).length > 0 && (
            <div className="rounded-md bg-yellow-50 p-4">
              <h3 className="text-sm font-medium text-yellow-800">フォームエラー:</h3>
              <ul className="mt-2 text-sm text-yellow-700">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field}>
                    {field}: {error?.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* 基本情報 */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">基本情報</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    イベント名 *
                  </label>
                  <input
                    type="text"
                    {...register('name')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="例: 春の陣 2024"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    説明
                  </label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="イベントの概要や目的を記載してください"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ステータス *
                  </label>
                  <select
                    {...register('status')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="draft">下書き</option>
                    <option value="published">公開中</option>
                    <option value="active">進行中</option>
                    <option value="completed">完了</option>
                    <option value="cancelled">キャンセル</option>
                  </select>
                  {errors.status && (
                    <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 日程設定 */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">日程設定</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      開始日時 *
                    </label>
                    <DatePicker
                      selected={watchedStartDate}
                      onChange={(date: Date | null) => date && setValue('startDate', date)}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      dateFormat="yyyy/MM/dd HH:mm"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholderText="開始日時を選択"
                    />
                    {errors.startDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      終了日時 *
                    </label>
                    <DatePicker
                      selected={watchedEndDate}
                      onChange={(date: Date | null) => date && setValue('endDate', date)}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      dateFormat="yyyy/MM/dd HH:mm"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholderText="終了日時を選択"
                      minDate={watchedStartDate}
                    />
                    {errors.endDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    予定時間（分） *
                  </label>
                  <input
                    type="number"
                    {...register('duration', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="240"
                  />
                  {errors.duration && (
                    <p className="mt-1 text-sm text-red-600">{errors.duration.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    参加登録締切
                  </label>
                  <DatePicker
                    selected={watch('registrationDeadline')}
                    onChange={(date: Date | null) => setValue('registrationDeadline', date)}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="yyyy/MM/dd HH:mm"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholderText="参加登録締切を選択（任意）"
                    isClearable
                    maxDate={watchedStartDate}
                  />
                  {errors.registrationDeadline && (
                    <p className="mt-1 text-sm text-red-600">{errors.registrationDeadline.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 参加設定 */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">参加設定</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    最大参加チーム数 *
                  </label>
                  <input
                    type="number"
                    {...register('maxTeams', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="10"
                    min={event.currentTeamCount}
                  />
                  {event.currentTeamCount > 0 && (
                    <p className="mt-1 text-xs text-gray-500">
                      現在 {event.currentTeamCount} チームが参加中のため、それ以上の値を設定してください
                    </p>
                  )}
                  {errors.maxTeams && (
                    <p className="mt-1 text-sm text-red-600">{errors.maxTeams.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    採点方式 *
                  </label>
                  <select
                    {...register('scoringType')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="points">ポイント制</option>
                    <option value="time">時間制</option>
                    <option value="hybrid">ハイブリッド</option>
                  </select>
                  {errors.scoringType && (
                    <p className="mt-1 text-sm text-red-600">{errors.scoringType.message}</p>
                  )}
                </div>

                {/* シナリオ選択 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    使用シナリオ *
                  </label>
                  {isLoadingScenarios ? (
                    <div className="text-sm text-gray-500">シナリオを読み込み中...</div>
                  ) : scenarios.length === 0 ? (
                    <div className="text-sm text-gray-500">
                      公開済みシナリオがありません。先にシナリオを作成してください。
                    </div>
                  ) : (
                    <ScenarioSelector 
                      scenarios={scenarios}
                      control={control}
                    />
                  )}
                  {errors.scenarios && (
                    <p className="mt-1 text-sm text-red-600">{errors.scenarios.message}</p>
                  )}
                  <div className="text-xs text-gray-500 mt-2">
                    選択したシナリオがイベント中に利用可能になります
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 設定 */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">イベント設定</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      {...register('settings.allowLateRegistration')}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">遅刻参加を許可する</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      {...register('settings.autoStartScoring')}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">自動で採点を開始する</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      {...register('settings.showLeaderboard')}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">リーダーボードを表示する</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      {...register('settings.notificationEnabled')}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">通知機能を有効にする</span>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* アクションボタン */}
            <div className="flex justify-end space-x-4">
              <Link href={`/events/${event.id}`}>
                <Button variant="outline" disabled={isSubmitting}>
                  キャンセル
                </Button>
              </Link>
              <Button type="submit" isLoading={isSubmitting}>
                更新する
              </Button>
            </div>
          </form>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  )
}