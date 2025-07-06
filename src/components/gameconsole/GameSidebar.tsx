import { useState } from 'react'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  TrophyIcon,
  ClockIcon,
  CheckCircleIcon,
  PlayCircleIcon,
  LockClosedIcon,
  ExclamationTriangleIcon,
  UsersIcon
} from '@heroicons/react/24/outline'
import { Team, Event } from '../../types/event'
import { Scenario } from '../../types/scenario'
import Badge from '../ui/Badge'

interface GameSidebarProps {
  team: Team
  event: Event
  scenarios: Scenario[]
  selectedScenario: Scenario | null
  onSelectScenario: (scenario: Scenario) => void
  className?: string
}

export default function GameSidebar({
  team,
  event,
  scenarios,
  selectedScenario,
  onSelectScenario,
  className = ''
}: GameSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  // 進捗計算
  const getProgress = () => {
    if (scenarios.length === 0) return { completed: 0, total: 0, percentage: 0 }
    
    const completed = team.completedScenarios.length
    const total = scenarios.length
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
    
    return { completed, total, percentage }
  }

  const progress = getProgress()

  // シナリオの状態を取得
  const getScenarioStatus = (scenario: Scenario) => {
    const isCompleted = team.completedScenarios.includes(scenario.id)
    const isSelected = selectedScenario?.id === scenario.id
    const isCurrent = team.currentScenario === scenario.id

    if (isCompleted) return 'completed'
    if (isCurrent || isSelected) return 'current'
    return 'available'
  }

  // ステータスアイコンを取得
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'current':
        return <PlayCircleIcon className="h-5 w-5 text-blue-500" />
      case 'locked':
        return <LockClosedIcon className="h-5 w-5 text-gray-400" />
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
    }
  }

  return (
    <div className={`bg-white shadow-lg transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-80'} ${className}`}>
      {/* ヘッダー */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-gray-900 truncate">{team.name}</h2>
              <p className="text-sm text-gray-600 truncate">{event.name}</p>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-md hover:bg-gray-100 text-gray-500"
          >
            {isCollapsed ? (
              <ChevronRightIcon className="h-5 w-5" />
            ) : (
              <ChevronLeftIcon className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* スコアと進捗（展開時のみ） */}
        {!isCollapsed && (
          <div className="mt-4 space-y-3">
            {/* スコア表示 */}
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
              <div className="flex items-center">
                <TrophyIcon className="h-6 w-6 text-yellow-500 mr-2" />
                <div>
                  <div className="text-sm text-gray-600">総スコア</div>
                  <div className="text-xl font-bold text-gray-900">{team.score}点</div>
                </div>
              </div>
            </div>

            {/* 進捗表示 */}
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">進捗状況</span>
                <span className="text-sm text-gray-600">{progress.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {progress.completed} / {progress.total} シナリオ完了
              </div>
            </div>

            {/* チーム情報 */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center text-sm text-gray-600">
                <UsersIcon className="h-4 w-4 mr-2" />
                {team.members.length}名のメンバー
              </div>
              <div className="mt-1">
                <Badge variant={
                  team.status === 'active' ? 'green' :
                  team.status === 'completed' ? 'gray' :
                  team.status === 'registered' ? 'blue' : 'red'
                }>
                  {team.status === 'active' ? '参加中' :
                   team.status === 'completed' ? '完了' :
                   team.status === 'registered' ? '登録済み' : '失格'}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* シナリオ一覧 */}
      <div className="flex-1 overflow-y-auto">
        {!isCollapsed && (
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">シナリオ</h3>
          </div>
        )}
        
        <div className="space-y-2 px-2">
          {scenarios.map((scenario) => {
            const status = getScenarioStatus(scenario)
            const isSelected = selectedScenario?.id === scenario.id
            
            return (
              <div
                key={scenario.id}
                className={`
                  relative cursor-pointer rounded-lg transition-all duration-200
                  ${isSelected 
                    ? 'bg-blue-100 border-blue-300 shadow-sm' 
                    : 'hover:bg-gray-50 border-transparent'
                  }
                  ${isCollapsed ? 'p-2' : 'p-3'}
                  border
                `}
                onClick={() => onSelectScenario(scenario)}
              >
                {!isCollapsed ? (
                  <>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getStatusIcon(status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {scenario.title}
                          </h4>
                          {status === 'completed' && (
                            <Badge variant="green" size="sm">完了</Badge>
                          )}
                        </div>
                        <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center">
                            <TrophyIcon className="h-3 w-3 mr-1" />
                            {scenario.maxScore}点
                          </div>
                          <div className="flex items-center">
                            <ClockIcon className="h-3 w-3 mr-1" />
                            {scenario.estimatedTimeMinutes}分
                          </div>
                        </div>
                        <div className="mt-1">
                          <Badge 
                            variant="gray" 
                            size="sm"
                            className="text-xs"
                          >
                            {scenario.difficulty === 'beginner' && '初級'}
                            {scenario.difficulty === 'intermediate' && '中級'}
                            {scenario.difficulty === 'advanced' && '上級'}
                            {scenario.difficulty === 'expert' && 'エキスパート'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    {/* 問題数表示 */}
                    <div className="mt-2 text-xs text-gray-500">
                      {(() => {
                        const completedCount = scenario.problems.filter(p => {
                          // teamServiceをインポートしていないため、ここでは直接チェック
                          const completedProblems = team.completedProblems || []
                          const newFormatKey = `${scenario.id}-${p.id}`
                          return completedProblems.includes(newFormatKey) || completedProblems.includes(p.id)
                        }).length
                        const totalCount = scenario.problems.length
                        
                        return `${completedCount}/${totalCount} 問題完了`
                      })()}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center">
                    <div className="relative">
                      {getStatusIcon(status)}
                      {status === 'completed' && (
                        <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full" />
                      )}
                    </div>
                  </div>
                )}
                
                {/* 選択インジケーター */}
                {isSelected && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <div className="h-2 w-2 bg-blue-600 rounded-full" />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* シナリオがない場合 */}
        {scenarios.length === 0 && !isCollapsed && (
          <div className="p-4 text-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">シナリオが見つかりません</p>
          </div>
        )}
      </div>

      {/* フッター（展開時のみ） */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-500 text-center">
            最終活動: {team.lastActivityAt ? 
              new Date(team.lastActivityAt.toDate()).toLocaleString() : 
              '未記録'
            }
          </div>
        </div>
      )}
    </div>
  )
}