import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Button from '../ui/Button'
import { teamSchema, type TeamSchemaType } from '../../schemas/teamSchema'
import { teamService } from '../../services/teamService'
import { Event } from '../../types/event'

interface AddTeamModalProps {
  isOpen: boolean
  onClose: () => void
  event: Event
  onTeamAdded?: () => void
}

export default function AddTeamModal({ isOpen, onClose, event, onTeamAdded }: AddTeamModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
    watch
  } = useForm<TeamSchemaType>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: '',
      members: [
        { name: '', email: '', role: 'leader' }
      ],
      gcpProjectId: ''
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'members'
  })

  const members = watch('members')

  const onSubmit = async (data: TeamSchemaType) => {
    try {
      setIsSubmitting(true)
      setSubmitError('')
      
      const teamData = {
        ...data,
        eventId: event.id,
        gcpProjectId: data.gcpProjectId || undefined
      }
      
      await teamService.createTeam(teamData)
      
      // 成功時の処理
      reset()
      onTeamAdded?.()
      onClose()
      
    } catch (error) {
      console.error('チーム作成エラー:', error)
      if (error instanceof Error) {
        setSubmitError(error.message)
      } else {
        setSubmitError('チームの作成に失敗しました')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      reset()
      setSubmitError('')
      onClose()
    }
  }

  const addMember = () => {
    if (fields.length < 10) {
      append({ name: '', email: '', role: 'member' })
    }
  }

  const removeMember = (index: number) => {
    if (fields.length > 1) {
      remove(index)
    }
  }

  const leaderCount = members?.filter(m => m.role === 'leader').length || 0

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={handleClose}
                    disabled={isSubmitting}
                  >
                    <span className="sr-only">閉じる</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="w-full mt-3 text-center sm:ml-0 sm:mt-0 sm:text-left">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                      新規チーム追加
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        {event.name} にチームを追加します
                        （{event.currentTeamCount}/{event.maxTeams} チーム）
                      </p>
                    </div>

                    {/* エラー表示 */}
                    {submitError && (
                      <div className="mt-4 rounded-md bg-red-50 p-4">
                        <div className="text-sm text-red-700">{submitError}</div>
                      </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
                      {/* チーム名 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          チーム名 *
                        </label>
                        <input
                          type="text"
                          {...register('name')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="例: チーム・アルファ"
                        />
                        {errors.name && (
                          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                        )}
                      </div>

                      {/* GCPプロジェクトID */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          GCPプロジェクトID（任意）
                        </label>
                        <input
                          type="text"
                          {...register('gcpProjectId')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="例: my-gameday-project"
                        />
                        {errors.gcpProjectId && (
                          <p className="mt-1 text-sm text-red-600">{errors.gcpProjectId.message}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                          チーム専用のGCPプロジェクトがある場合に入力してください
                        </p>
                      </div>

                      {/* メンバー */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label className="block text-sm font-medium text-gray-700">
                            メンバー *
                          </label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addMember}
                            disabled={fields.length >= 10}
                          >
                            <PlusIcon className="h-4 w-4 mr-1" />
                            追加
                          </Button>
                        </div>

                        <div className="space-y-3">
                          {fields.map((field, index) => (
                            <div key={field.id} className="p-4 border border-gray-200 rounded-lg">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium text-gray-700">
                                  メンバー {index + 1}
                                </span>
                                {fields.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeMember(index)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </button>
                                )}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                  <input
                                    type="text"
                                    {...register(`members.${index}.name`)}
                                    placeholder="名前"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                  />
                                  {errors.members?.[index]?.name && (
                                    <p className="mt-1 text-xs text-red-600">
                                      {errors.members[index]?.name?.message}
                                    </p>
                                  )}
                                </div>

                                <div>
                                  <input
                                    type="email"
                                    {...register(`members.${index}.email`)}
                                    placeholder="メールアドレス"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                  />
                                  {errors.members?.[index]?.email && (
                                    <p className="mt-1 text-xs text-red-600">
                                      {errors.members[index]?.email?.message}
                                    </p>
                                  )}
                                </div>

                                <div>
                                  <select
                                    {...register(`members.${index}.role`)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                  >
                                    <option value="leader">リーダー</option>
                                    <option value="member">メンバー</option>
                                  </select>
                                  {errors.members?.[index]?.role && (
                                    <p className="mt-1 text-xs text-red-600">
                                      {errors.members[index]?.role?.message}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* リーダー数の警告 */}
                        {leaderCount !== 1 && (
                          <div className="mt-2 p-3 rounded-md bg-yellow-50">
                            <p className="text-sm text-yellow-800">
                              {leaderCount === 0 
                                ? 'リーダーを1名指定してください' 
                                : 'リーダーは1名のみ指定してください'
                              }
                            </p>
                          </div>
                        )}

                        {errors.members && (
                          <p className="mt-2 text-sm text-red-600">{errors.members.message}</p>
                        )}
                      </div>

                      {/* アクションボタン */}
                      <div className="flex justify-end space-x-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleClose}
                          disabled={isSubmitting}
                        >
                          キャンセル
                        </Button>
                        <Button
                          type="submit"
                          isLoading={isSubmitting}
                          disabled={event.currentTeamCount >= event.maxTeams}
                        >
                          チームを追加
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}