import { NextResponse } from 'next/server';
import { getJobQueueHealth } from '@/lib/jobs';
import { apiLogger, logError } from '@/lib/logger';
import { PrismaClient } from '@prisma/client';

// Basic health check endpoint
export async function GET() {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  
  try {
    const healthChecks = await Promise.allSettled([
      checkDatabase(),
      checkJobQueue(),
      checkEnvironment(),
    ]);

    const [dbCheck, jobQueueCheck, envCheck] = healthChecks;

    const health = {
      status: 'healthy' as 'healthy' | 'unhealthy',
      timestamp,
      uptime: process.uptime(),
      version: process.env.npm_package_version || '0.1.0',
      environment: process.env.NODE_ENV || 'development',
      checks: {
        database: dbCheck.status === 'fulfilled' ? dbCheck.value : { 
          healthy: false, 
          error: dbCheck.reason?.message 
        },
        jobQueue: jobQueueCheck.status === 'fulfilled' ? jobQueueCheck.value : { 
          healthy: false, 
          error: jobQueueCheck.reason?.message 
        },
        environment: envCheck.status === 'fulfilled' ? envCheck.value : { 
          healthy: false, 
          error: envCheck.reason?.message 
        },
        storage: {
          healthy: Boolean(process.env.S3_BUCKET),
          // Do not attempt network call here to keep endpoint light
        },
      },
      responseTime: Date.now() - startTime,
    };

    // Determine overall health status
    const allHealthy = Object.values(health.checks).every(check => check.healthy);
    health.status = allHealthy ? 'healthy' : 'unhealthy';

    const statusCode = health.status === 'healthy' ? 200 : 503;

    apiLogger.info(
      {
        status: health.status,
        responseTime: health.responseTime,
        checks: Object.fromEntries(
          Object.entries(health.checks).map(([key, value]) => [key, { healthy: value.healthy }])
        ),
      },
      'Health check completed'
    );

    return NextResponse.json(health, { status: statusCode });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    logError(error, { 
      component: 'health-check',
      responseTime 
    });

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp,
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime,
      },
      { status: 503 }
    );
  }
}

// Database health check
async function checkDatabase() {
  try {
    const prisma = new PrismaClient();
    const startTime = Date.now();
    
    // Simple query to check database connectivity
    await prisma.$queryRaw`SELECT 1 as health_check`;
    
    const responseTime = Date.now() - startTime;
    
    await prisma.$disconnect();

    return {
      healthy: true,
      responseTime,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Database connection failed',
      timestamp: new Date().toISOString(),
    };
  }
}

// Job queue health check
async function checkJobQueue() {
  try {
    return await getJobQueueHealth();
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Job queue check failed',
      timestamp: new Date().toISOString(),
    };
  }
}

// Environment health check
async function checkEnvironment() {
  const requiredEnvVars = [
    'DATABASE_URL',
    'BETTER_AUTH_SECRET',
    'NODE_ENV',
  ];

  const optionalEnvVars = [
    'GITHUB_CLIENT_ID',
    'GITHUB_CLIENT_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'S3_ENDPOINT',
    'S3_REGION',
    'S3_ACCESS_KEY_ID',
    'S3_SECRET_ACCESS_KEY',
    'S3_BUCKET',
    'S3_FORCE_PATH_STYLE',
    'S3_SIGNED_URL_EXPIRY_SECONDS',
  ];

  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  const optional = optionalEnvVars.filter(envVar => !process.env[envVar]);

  return {
    healthy: missing.length === 0,
    required: {
      present: requiredEnvVars.filter(envVar => process.env[envVar]),
      missing,
    },
    optional: {
      present: optionalEnvVars.filter(envVar => process.env[envVar]),
      missing: optional,
    },
    timestamp: new Date().toISOString(),
  };
}
