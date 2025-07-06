import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import {
  XMarkIcon,
  HomeIcon,
  UsersIcon,
  TrophyIcon,
  ChartBarIcon,
  CogIcon,
  CalendarIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline'
import clsx from 'clsx'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navigation = [
  { name: 'ダッシュボード', href: '/dashboard', icon: HomeIcon, current: false },
  { name: 'イベント管理', href: '/events', icon: CalendarIcon, current: false },
  { name: 'チーム管理', href: '/teams', icon: UsersIcon, current: false },
  { name: 'シナリオ管理', href: '/scenarios', icon: DocumentTextIcon, current: false },
  { name: 'スコアボード', href: '/scoreboard', icon: TrophyIcon, current: false },
  { name: 'レポート', href: '/reports', icon: ChartBarIcon, current: false },
  { name: '監査ログ', href: '/audit', icon: ClipboardDocumentListIcon, current: false },
  { name: 'システム設定', href: '/settings', icon: CogIcon, current: false },
]

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile sidebar */}
      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button type="button" className="-m-2.5 p-2.5" onClick={onClose}>
                      <span className="sr-only">サイドバーを閉じる</span>
                      <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                  <div className="flex h-16 shrink-0 items-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600">
                      <span className="text-white font-bold text-sm">GD</span>
                    </div>
                    <span className="ml-3 text-lg font-semibold text-gray-900">
                      GameDay Console
                    </span>
                  </div>
                  <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                      <li>
                        <ul role="list" className="-mx-2 space-y-1">
                          {navigation.map((item) => (
                            <li key={item.name}>
                              <a
                                href={item.href}
                                className={clsx(
                                  item.current
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-700 hover:text-blue-700 hover:bg-blue-50',
                                  'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium'
                                )}
                              >
                                <item.icon
                                  className={clsx(
                                    item.current ? 'text-blue-700' : 'text-gray-400 group-hover:text-blue-700',
                                    'h-6 w-6 shrink-0'
                                  )}
                                  aria-hidden="true"
                                />
                                {item.name}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </li>
                    </ul>
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600">
              <span className="text-white font-bold text-sm">GD</span>
            </div>
            <span className="ml-3 text-lg font-semibold text-gray-900">
              GameDay Console
            </span>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        className={clsx(
                          item.current
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-700 hover:text-blue-700 hover:bg-blue-50',
                          'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium'
                        )}
                      >
                        <item.icon
                          className={clsx(
                            item.current ? 'text-blue-700' : 'text-gray-400 group-hover:text-blue-700',
                            'h-6 w-6 shrink-0'
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
              
              {/* Bottom section */}
              <li className="mt-auto">
                <div className="rounded-lg bg-blue-50 p-4 text-center">
                  <h3 className="text-sm font-medium text-blue-900">
                    現在のイベント
                  </h3>
                  <p className="mt-1 text-xs text-blue-700">
                    春の陣 2024
                  </p>
                  <div className="mt-3">
                    <div className="text-xs text-blue-600">参加チーム数</div>
                    <div className="text-lg font-bold text-blue-900">12</div>
                  </div>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  )
}