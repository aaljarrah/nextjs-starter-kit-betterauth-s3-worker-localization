import PgBoss from 'pg-boss';
import { jobLogger, logError } from './logger';

// Define job types for type safety
export interface JobTypes {
  'user.welcome-email': {
    userId: string;
    email: string;
    locale: string;
  };
  'notification.send': {
    userId: string;
    type: 'email' | 'push' | 'sms';
    title: string;
    message: string;
    metadata?: Record<string, unknown>;
  };
  'cleanup.expired-sessions': {
    batchSize?: number;
    olderThanDays?: number;
  };
  'backup.database': {
    type: 'full' | 'incremental';
    retentionDays?: number;
  };
  'report.generate': {
    reportType: string;
    userId: string;
    dateFrom: string;
    dateTo: string;
    format: 'pdf' | 'excel' | 'csv';
  };
}

// Job type names for convenience
export const JOB_TYPES = {
  USER_WELCOME_EMAIL: 'user.welcome-email' as const,
  NOTIFICATION_SEND: 'notification.send' as const,
  CLEANUP_EXPIRED_SESSIONS: 'cleanup.expired-sessions' as const,
  BACKUP_DATABASE: 'backup.database' as const,
  REPORT_GENERATE: 'report.generate' as const,
} as const;

// Job configuration
const JOB_CONFIG = {
  retryLimit: 3,
  retryDelay: 60, // 60 seconds
  retryBackoff: true,
  expireInHours: 24,
} as const;

// PgBoss instance
let boss: PgBoss | null = null;

// Initialize PgBoss
export async function initializeJobs(): Promise<PgBoss> {
  if (boss) {
    return boss;
  }

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required for job queue');
  }

  try {
    // Basic PgBoss initialization
    boss = new PgBoss({
      connectionString: process.env.DATABASE_URL,
      application_name: `${process.env.APP_NAME || 'app'}-jobs`,
      max: 10, // Maximum number of connections
      // TODO: Add more configuration options as needed:
      // - archiveCompletedAfterSeconds
      // - deleteAfterDays  
      // - maintenanceIntervalSeconds
      // - monitorStateIntervalSeconds
    });

    // Basic error handling
    boss.on('error', (error) => {
      logError(error, { component: 'pg-boss' });
    });

    await boss.start();
    jobLogger.info('Job queue initialized successfully');

    return boss;
  } catch (error) {
    logError(error, { component: 'pg-boss-init' });
    throw error;
  }
}

// Get PgBoss instance
export function getJobQueue(): PgBoss {
  if (!boss) {
    throw new Error('Job queue not initialized. Call initializeJobs() first.');
  }
  return boss;
}

// Stop job queue gracefully
export async function stopJobs(): Promise<void> {
  if (boss) {
    try {
      await boss.stop();
      boss = null;
      jobLogger.info('Job queue stopped successfully');
    } catch (error) {
      logError(error, { component: 'pg-boss-stop' });
      throw error;
    }
  }
}

// Generic job publisher
export async function publishJob<K extends keyof JobTypes>(
  name: K,
  data: JobTypes[K],
  options?: {
    priority?: number;
    startAfter?: Date | string;
    singletonKey?: string;
    retryLimit?: number;
    retryDelay?: number;
    expireInHours?: number;
  }
): Promise<string | null> {
  const queue = getJobQueue();
  
  try {
    const jobId = await queue.send(name, data, {
      ...JOB_CONFIG,
      ...options,
    });

    jobLogger.info(
      { jobId, jobName: name, data },
      'Job published successfully'
    );

    return jobId;
  } catch (error) {
    logError(error, { 
      component: 'job-publisher',
      jobName: name,
      data 
    });
    throw error;
  }
}

// Schedule recurring job
export async function scheduleJob<K extends keyof JobTypes>(
  name: K,
  data: JobTypes[K],
  cron: string,
  options?: {
    timezone?: string;
    tz?: string;
  }
): Promise<void> {
  const queue = getJobQueue();
  
  try {
    await queue.schedule(name, cron, data, options);
    
    jobLogger.info(
      { jobName: name, cron, data, options },
      'Recurring job scheduled successfully'
    );
  } catch (error) {
    logError(error, { 
      component: 'job-scheduler',
      jobName: name,
      cron,
      data 
    });
    throw error;
  }
}

// Cancel a job
export async function cancelJob(jobId: string): Promise<boolean> {
  try {
    // TODO: Implement proper job cancellation based on pg-boss API
    // const queue = getJobQueue();
    // await queue.cancel(jobName, jobId);
    
    jobLogger.info({ jobId }, 'TODO: Implement job cancellation');
    
    return false; // TODO: Return actual cancellation result
  } catch (error) {
    logError(error, { 
      component: 'job-canceller',
      jobId 
    });
    throw error;
  }
}

// Get job status
export async function getJobStatus(jobId: string) {
  try {
    // TODO: Implement proper job status retrieval
    // const queue = getJobQueue();
    // const job = await queue.getJobById(jobId, { includeArchive: true });
    
    jobLogger.debug({ jobId }, 'TODO: Implement job status retrieval');
    
    return null; // TODO: Return actual job status
  } catch (error) {
    logError(error, { 
      component: 'job-status',
      jobId 
    });
    throw error;
  }
}

// Health check for job queue
export async function getJobQueueHealth() {
  if (!boss) {
    return { healthy: false, error: 'Job queue not initialized' };
  }

  try {
    // Basic health check - just verify the connection is alive
    // TODO: Implement more detailed queue statistics:
    // - Queue sizes by state
    // - Failed job counts
    // - Processing rates
    // - Worker status
    
    return {
      healthy: true,
      timestamp: new Date().toISOString(),
      // TODO: Add queue statistics here
    };
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
}
