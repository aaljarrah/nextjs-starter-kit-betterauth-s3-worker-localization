import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getJobQueueHealth } from '@/lib/jobs';
import { apiLogger, logError } from '@/lib/logger';

// Readiness probe endpoint
// This endpoint checks if the application is ready to serve traffic
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  try {
    // Check critical dependencies that must be working for the app to be ready
    const [dbReady, jobQueueReady] = await Promise.allSettled([
      checkDatabaseReadiness(),
      checkJobQueueReadiness(),
    ]);

    const ready = dbReady.status === 'fulfilled' && 
                  jobQueueReady.status === 'fulfilled' &&
                  dbReady.value && 
                  jobQueueReady.value;

    const response = {
      ready,
      timestamp,
      responseTime: Date.now() - startTime,
      checks: {
        database: dbReady.status === 'fulfilled' ? dbReady.value : false,
        jobQueue: jobQueueReady.status === 'fulfilled' ? jobQueueReady.value : false,
      },
      ...(dbReady.status === 'rejected' && { databaseError: dbReady.reason?.message }),
      ...(jobQueueReady.status === 'rejected' && { jobQueueError: jobQueueReady.reason?.message }),
    };

    const statusCode = ready ? 200 : 503;

    apiLogger.info(
      {
        ready,
        responseTime: response.responseTime,
        checks: response.checks,
      },
      'Readiness check completed'
    );

    return NextResponse.json(response, { status: statusCode });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    logError(error, { 
      component: 'readiness-check',
      responseTime 
    });

    return NextResponse.json(
      {
        ready: false,
        timestamp,
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime,
      },
      { status: 503 }
    );
  }
}

// Check if database is ready
async function checkDatabaseReadiness(): Promise<boolean> {
  try {
    const prisma = new PrismaClient();
    
    // Check if we can connect and perform a basic query
    await prisma.$queryRaw`SELECT 1`;
    
    await prisma.$disconnect();
    return true;
  } catch (error) {
    logError(error, { component: 'database-readiness' });
    return false;
  }
}

// Check if job queue is ready
async function checkJobQueueReadiness(): Promise<boolean> {
  try {
    const health = await getJobQueueHealth();
    return health.healthy;
  } catch (error) {
    logError(error, { component: 'job-queue-readiness' });
    return false;
  }
}
