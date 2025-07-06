import type { NextApiRequest, NextApiResponse } from 'next'

type HealthResponse = {
  status: 'ok' | 'error'
  timestamp: string
  version?: string
  environment?: string
  uptime: number
  checks: {
    memory: {
      status: 'ok' | 'warning' | 'error'
      used: number
      total: number
      percentage: number
    }
  }
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthResponse>
) {
  try {
    // メモリ使用量の確認
    const memoryUsage = process.memoryUsage()
    const totalMemory = memoryUsage.heapTotal
    const usedMemory = memoryUsage.heapUsed
    const memoryPercentage = (usedMemory / totalMemory) * 100

    let memoryStatus: 'ok' | 'warning' | 'error' = 'ok'
    if (memoryPercentage > 90) {
      memoryStatus = 'error'
    } else if (memoryPercentage > 75) {
      memoryStatus = 'warning'
    }

    // プロセスのアップタイム（秒）
    const uptime = process.uptime()

    const healthResponse: HealthResponse = {
      status: memoryStatus === 'error' ? 'error' : 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '0.1.0',
      environment: process.env.NODE_ENV || 'development',
      uptime,
      checks: {
        memory: {
          status: memoryStatus,
          used: Math.round(usedMemory / 1024 / 1024), // MB
          total: Math.round(totalMemory / 1024 / 1024), // MB
          percentage: Math.round(memoryPercentage)
        }
      }
    }

    // ステータスコードの決定
    const statusCode = healthResponse.status === 'ok' ? 200 : 503

    res.status(statusCode).json(healthResponse)
  } catch (error) {
    console.error('Health check error:', error)
    
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {
        memory: {
          status: 'error',
          used: 0,
          total: 0,
          percentage: 0
        }
      }
    })
  }
}