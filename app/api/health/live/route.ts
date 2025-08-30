import { NextRequest, NextResponse } from 'next/server';

// Liveness probe endpoint
// This endpoint checks if the application is running and not in a deadlocked state
// It should be lightweight and fast
export async function GET(request: NextRequest) {
  const timestamp = new Date().toISOString();
  const startTime = Date.now();

  try {
    // Basic checks to ensure the process is alive and responsive
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    // Convert memory usage to MB for readability
    const memoryInMB = {
      rss: Math.round(memoryUsage.rss / 1024 / 1024 * 100) / 100,
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100,
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100,
      external: Math.round(memoryUsage.external / 1024 / 1024 * 100) / 100,
    };

    const response = {
      alive: true,
      timestamp,
      uptime: process.uptime(),
      pid: process.pid,
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      memory: memoryInMB,
      cpuUsage: cpuUsage.system.toString(),
      responseTime: Date.now() - startTime,
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json(
      {
        alive: false,
        timestamp,
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime,
      },
      { status: 503 }
    );
  }
}
