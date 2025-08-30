import pino from 'pino';

// Define log levels for different environments
const getLogLevel = (): string => {
  switch (process.env.NODE_ENV) {
    case 'production':
      return process.env.LOG_LEVEL || 'info';
    case 'test':
      return 'silent';
    default:
      return 'debug';
  }
};

// Define transport configuration
const getTransport = () => {
  if (process.env.NODE_ENV === 'development') {
    return {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
        singleLine: false,
        hideObject: false,
      },
    };
  }
  
  // Production transport - structured JSON logging
  return {
    target: 'pino/file',
    options: {
      destination: process.stdout.fd,
    },
  };
};

// Create the base logger configuration
const loggerConfig: pino.LoggerOptions = {
  level: getLogLevel(),
  formatters: {
    level: (label) => ({ level: label }),
    bindings: (bindings) => ({
      pid: bindings.pid,
      hostname: bindings.hostname,
    }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  serializers: {
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
    err: pino.stdSerializers.err,
  },
  base: {
    service: process.env.APP_NAME || 'app',
    version: process.env.npm_package_version || '0.1.0',
  },
};

// Add transport if not in test environment
if (process.env.NODE_ENV !== 'test') {
  loggerConfig.transport = getTransport();
}

// Create and export the main logger
export const logger = pino(loggerConfig);

// Create child loggers for specific modules
export const createChildLogger = (module: string, context?: Record<string, unknown>) => {
  return logger.child({ 
    module,
    ...context
  });
};

// Create specific loggers for different services
export const apiLogger = createChildLogger('api');
export const workerLogger = createChildLogger('worker');
export const jobLogger = createChildLogger('jobs');
export const authLogger = createChildLogger('auth');
export const dbLogger = createChildLogger('database');

// Helper function for error logging with stack trace
export const logError = (error: Error | unknown, context?: Record<string, unknown>) => {
  if (error instanceof Error) {
    logger.error({ 
      err: error, 
      stack: error.stack,
      ...context 
    }, error.message);
  } else {
    logger.error({ 
      error: String(error),
      ...context 
    }, 'Unknown error occurred');
  }
};

// Helper function for performance logging
export const createPerformanceLogger = (operation: string) => {
  const start = Date.now();
  const childLogger = logger.child({ operation });
  
  return {
    logger: childLogger,
    finish: (context?: Record<string, unknown>) => {
      const duration = Date.now() - start;
      childLogger.info({ 
        duration: `${duration}ms`,
        ...context 
      }, `${operation} completed`);
    },
    error: (error: Error | unknown, context?: Record<string, unknown>) => {
      const duration = Date.now() - start;
      logError(error, { 
        operation, 
        duration: `${duration}ms`,
        ...context 
      });
    },
  };
};

export default logger;
