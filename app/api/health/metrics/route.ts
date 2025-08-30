import { NextRequest, NextResponse } from 'next/server';
import { getJobQueueHealth } from '@/lib/jobs';
import { apiLogger, logError } from '@/lib/logger';

// Metrics endpoint for monitoring systems
// This endpoint provides detailed metrics for monitoring and alerting
export async function GET(request: NextRequest) {
  const timestamp = new Date().toISOString();
  const startTime = Date.now();

  try {
    const [jobQueueMetrics, systemMetrics] = await Promise.allSettled([
      getJobQueueMetrics(),
      getSystemMetrics(),
    ]);

    const metrics = {
      timestamp,
      system: systemMetrics.status === 'fulfilled' ? systemMetrics.value : null,
      jobQueue: jobQueueMetrics.status === 'fulfilled' ? jobQueueMetrics.value : null,
      responseTime: Date.now() - startTime,
    };

    apiLogger.debug({ metricsCollected: true }, 'Metrics collected successfully');

    return NextResponse.json(metrics, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    logError(error, { 
      component: 'metrics-collection',
      responseTime 
    });

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp,
        responseTime,
      },
      { status: 500 }
    );
  }
}

// Get system metrics
async function getSystemMetrics() {
  const memoryUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  
  return {
    uptime: process.uptime(),
    memory: {
      rss: memoryUsage.rss,
      heapTotal: memoryUsage.heapTotal,
      heapUsed: memoryUsage.heapUsed,
      heapUtilization: (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100,
      external: memoryUsage.external,
      arrayBuffers: memoryUsage.arrayBuffers,
    },
    cpu: {
      user: cpuUsage.user,
      system: cpuUsage.system,
    },
    process: {
      pid: process.pid,
      ppid: process.ppid,
      platform: process.platform,
      arch: process.arch,
      version: process.version,
      nodeEnv: process.env.NODE_ENV,
    },
    eventLoop: {
      // These would require additional monitoring libraries like '@nodejs/clinic'
      // For now, we'll track basic metrics
      // activeHandles: (process as any)._getActiveHandles?.()?.length || 0,
      // activeRequests: (process as any)._getActiveRequests?.()?.length || 0,
    },
  };
}

// Get job queue metrics
async function getJobQueueMetrics() {
  try {
    const health = await getJobQueueHealth();
    
    if (!health.healthy) {
      return {
        healthy: false,
        error: health.error,
      };
    }

    return {
      healthy: true,
      timestamp: health.timestamp,
    };
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Failed to collect job queue metrics',
    };
  }
}
