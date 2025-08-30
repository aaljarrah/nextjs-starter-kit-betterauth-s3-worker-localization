#!/usr/bin/env node

import { initializeJobs, getJobQueue } from '../lib/jobs';
import { logger, logError } from '../lib/logger';

// Job status monitoring script
async function checkJobsStatus() {
  try {
    logger.info('Initializing job queue for status check...');
    await initializeJobs();
    
    const boss = getJobQueue();
    
    // Get overall queue statistics
    // const queueSize = await boss.getQueueSize('default');
    const queueName = 'default';
    const active = await boss.getQueueSize(queueName, { before: 'active' });
    const completed = await boss.getQueueSize(queueName, { before: 'completed' });
    const cancelled =await boss.getQueueSize(queueName, { before: 'cancelled' });
    const failed = await boss.getQueueSize(queueName, { before: 'failed' });
    const retry = await boss.getQueueSize(queueName, { before: 'retry' });

    logger.info({
      active,
      completed,
      cancelled,
      failed,
      retry,
    }, 'Queue Status Summary');

    // Check for any stuck jobs
    if (active > 0) {
      console.log('\n=== Active Jobs Details ===');
      // Note: pg-boss doesn't provide a direct way to get active job details
      // You would need to query the pgboss schema directly for more details
      logger.warn({ activeJobs: active }, 'There are active jobs running');
    }
    
    // Alert on high queue sizes
    if (active > 100) {
      logger.warn({ waitingJobs: active }, 'High number of waiting jobs detected');
    }
    
    if (failed > 50) {
      logger.error({ failedJobs: failed }, 'High number of failed jobs detected');
    }
    
    console.log('\n=== Health Status ===');
    const isHealthy = active < 1000 && failed < 100;
    console.log(`Overall Health: ${isHealthy ? '✅ Healthy' : '❌ Unhealthy'}`);
    
    if (!isHealthy) {
      console.log('\nRecommendations:');
      if (active > 1000) {
        console.log('- Consider scaling up worker processes');
        console.log('- Check worker performance and bottlenecks');
      }
      if (failed > 100) {
        console.log('- Investigate failed job patterns');
        console.log('- Check error logs for common failure causes');
        console.log('- Consider adjusting retry policies');
      }
    }
    
    await boss.stop();
    process.exit(0);
    
  } catch (error) {
    logError(error, { component: 'jobs-status-script' });
    process.exit(1);
  }
}

// Command line options parsing
const args = process.argv.slice(2);
const showHelp = args.includes('--help') || args.includes('-h');

if (showHelp) {
  console.log(`
Job Status Monitor

Usage:
  pnpm jobs:status [options]

Options:
  --help, -h     Show this help message
  
Environment Variables:
  DATABASE_URL   PostgreSQL connection string (required)
  LOG_LEVEL     Log level (debug, info, warn, error)
  
Examples:
  pnpm jobs:status                  # Check current job status
  LOG_LEVEL=debug pnpm jobs:status  # Verbose output
`);
  process.exit(0);
}

// Run the status check
checkJobsStatus().catch((error) => {
  logError(error, { component: 'jobs-status-main' });
  process.exit(1);
});
