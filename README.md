# Next.js Starter - Better Auth + S3 + Worker

A production-ready Next.js 15 starter kit featuring Better Auth, S3 file storage, pg-boss job queue worker, structured logging, health endpoints, and full internationalization support (EN/AR, RTL/LTR).

## 🚀 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Better-auth with OAuth support
- **Job Processing**: pg-boss for reliable background jobs
- **Logging**: pino for structured, high-performance logging
- **Styling**: Tailwind CSS with custom theme system
- **Internationalization**: next-intl (English/Arabic with RTL support)
- **File Storage**: S3-compatible object storage (AWS S3, Cloudflare R2, MinIO, etc.)
- **Monitoring**: Comprehensive health endpoints

## 📋 Quick Start

> **Note**: This project uses PNPM as the package manager for better performance and disk efficiency.

### 1. Environment Setup

Create a `.env` file with these essential variables:

```bash
# Core Application
NODE_ENV=development
APP_NAME="nextjs-starter"
DATABASE_URL="postgresql://user:password@localhost:5432/app_db"
BETTER_AUTH_SECRET="your-secret-key-here-minimum-32-characters-long"

# Optional: Job Queue Settings
WORKER_CONCURRENCY=20
WORKER_TEAM_SIZE=3

# Optional: OAuth Providers
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Optional: S3 Storage
S3_ENDPOINT="" # leave empty for AWS S3
S3_REGION="us-east-1"
S3_ACCESS_KEY_ID=""
S3_SECRET_ACCESS_KEY=""
S3_BUCKET="uploads"
S3_FORCE_PATH_STYLE="false"

# Optional: Logging Configuration
LOG_LEVEL=debug
LOG_FORMAT=pretty
```

### 2. Installation & Setup

```bash
# Install pnpm globally (if not already installed)
npm install -g pnpm

# Install dependencies
pnpm install

# Set up database
pnpm dlx prisma migrate dev

# Start development server
pnpm dev

# Start worker service (in separate terminal)
pnpm worker:dev
```

### 3. Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm check:ssr    # Scan for unexpected 'use client' usage
pnpm worker       # Run worker service (production)
pnpm worker:dev   # Run worker service (development)
pnpm jobs:status  # Check job queue status
```

## 🏗️ Architecture Overview

### Core Structure
```
nextjs-starter/
├── app/                    # Next.js App Router
│   ├── [locale]/          # Internationalized routes
│   ├── api/               # API endpoints
│   │   ├── auth/          # Authentication endpoints
│   │   └── health/        # Health monitoring endpoints
│   └── globals.css        # Global styles with CSS variables
├── components/            # Reusable UI components
├── lib/                   # Core business logic
│   ├── auth.ts           # Authentication configuration
│   ├── db.ts             # Database connection
│   ├── jobs.ts           # Job queue configuration
│   ├── job-handlers.ts   # Job processing logic
│   ├── logger.ts         # Logging utilities
│   ├── worker.ts         # Worker service
│   └── utils.ts          # Utility functions
├── messages/             # Internationalization files
├── prisma/              # Database schema and migrations
└── scripts/             # Administrative scripts
```

### Key Features

#### 🎯 Job Processing System
- **Type-safe job definitions** with full TypeScript support
- **Background processing** for emails, notifications, and maintenance
- **Scheduled jobs** with cron-like syntax
- **Retry mechanisms** with exponential backoff
- **Job monitoring** and status tracking

#### 📊 Logging & Monitoring
- **Structured JSON logging** in production
- **Pretty printing** in development
- **Performance metrics** with timing
- **Error tracking** with stack traces
- **Module-specific loggers** (API, Worker, Jobs, Auth, DB)

#### 🏥 Health Monitoring
- **`/api/health`** - Comprehensive system health check
- **`/api/health/live`** - Lightweight liveness probe
- **`/api/health/ready`** - Dependency readiness check
- **`/api/health/metrics`** - Detailed system metrics

#### 🌍 Internationalization
- **RTL/LTR support** for Arabic and English
- **Theme-aware components** with CSS custom properties
- **Localized routing** with automatic language detection
- **Translation-ready UI** with structured message files

## 💼 Job System Usage

### Publishing Jobs

```typescript
import { publishJob, JOB_TYPES } from '@/lib/jobs';

// Send welcome email
await publishJob(JOB_TYPES.USER_WELCOME_EMAIL, {
  userId: "user123",
  email: "user@example.com",
  locale: "en"
});

// Schedule notification
await publishJob(JOB_TYPES.NOTIFICATION_SEND, {
  userId: "user123",
  type: "email",
  title: "Important Update",
  message: "Your order has been shipped!"
});
```

### Scheduling Recurring Jobs

```typescript
import { scheduleJob, JOB_TYPES } from '@/lib/jobs';

// Daily cleanup at 2 AM UTC
await scheduleJob(
  JOB_TYPES.CLEANUP_EXPIRED_SESSIONS,
  { batchSize: 1000, olderThanDays: 30 },
  '0 2 * * *',
  { timezone: 'UTC' }
);
```

### Available Job Types
- **User Welcome Email** - Send welcome emails to new users
- **Notifications** - Email, push, and SMS notifications
- **Session Cleanup** - Remove expired user sessions
- **Database Backup** - Automated database backups
- **Report Generation** - Generate user reports in various formats

## 📝 Logging Best Practices

### Basic Logging
```typescript
import { logger, apiLogger, workerLogger } from '@/lib/logger';

logger.info('Application started');
apiLogger.info({ userId: 123 }, 'User logged in');
workerLogger.error({ jobId: 'job123' }, 'Job failed');
```

### Performance Logging
```typescript
import { createPerformanceLogger } from '@/lib/logger';

const perfLogger = createPerformanceLogger('database-query');
// ... perform operation
perfLogger.finish({ recordsProcessed: 150 });
```

### Error Handling
```typescript
import { logError } from '@/lib/logger';

try {
  // risky operation
} catch (error) {
  logError(error, { context: 'user-registration', userId: 123 });
  throw error; // Re-throw for proper error handling
}
```

## 🏥 Health Monitoring Setup

### Uptime Kuma Configuration
```yaml
# Main Health Check
URL: https://your-domain.com/api/health
Method: GET
Expected Status: 200
Timeout: 10 seconds
Interval: 60 seconds

# Readiness Check
URL: https://your-domain.com/api/health/ready
Method: GET
Expected Status: 200
Timeout: 5 seconds
Interval: 30 seconds
```

### Health Endpoints Details
- **Main Health (`/api/health`)**: Database, job queue, environment validation
- **Liveness (`/api/health/live`)**: Process responsiveness, memory usage
- **Readiness (`/api/health/ready`)**: Critical dependency availability
- **Metrics (`/api/health/metrics`)**: Detailed performance and queue statistics

## 🎨 Theme System

The project uses CSS custom properties for theme consistency:

```css
/* Use theme variables instead of hardcoded colors */
.component {
  background-color: var(--background);
  color: var(--foreground);
  border: 1px solid var(--border);
}
```

### Tailwind Classes
Use semantic color classes that adapt to themes:
- `bg-background` / `text-foreground`
- `border-border` / `text-muted-foreground`
- `bg-card` / `text-card-foreground`
- `bg-primary` / `text-primary-foreground`

## 🌍 Internationalization Guide

### Adding New Languages
1. Create message file: `messages/[locale].json`
2. Add locale to middleware configuration
3. Update routing in `app/[locale]/layout.tsx`

### RTL/LTR Support
Components automatically adapt to text direction:
```tsx
// Proper RTL-aware styling
<div className="flex items-center gap-4 rtl:flex-row-reverse">
  <Icon className="h-4 w-4" />
  <span>{t('label')}</span>
</div>
```

## 🔧 Development Guidelines

### SSR-first and Authentication Policy

- Prefer Server Components by default. Only mark components with `'use client'` when client-side interactivity is required (local state, effects, event handlers, refs, imperative APIs).
- Never place `'use client'` in layouts or top-level route groups. Keep client islands small and leaf-only.
- Retrieve the authenticated user on the server. Use `getServerSession`/`getCurrentUser` from `lib/auth-server.ts` inside Server Components, Route Handlers, and Actions.
- For client interactivity that depends on auth, pass required data from Server Components as props, or use small client islands (e.g., `SignOutButton`).
- Avoid fetching auth state with hooks on the client for initial render. Favor server-rendered content for performance and SEO.

Example usage:

```tsx
// Server component
import { getCurrentUser } from '@/lib/auth-server'

export default async function Page() {
  const user = await getCurrentUser()
  if (!user) return <div>...</div>
  return <div>Hello {user.email}</div>
}
```

```tsx
// Client island for sign out
'use client'
import { authClient } from '@/lib/auth-client'

export function SignOutButton() {
  return <button onClick={() => authClient.signOut().then(() => location.reload())}>Sign out</button>
}
```

### Adding New Job Types
1. **Define interface** in `lib/jobs.ts`:
```typescript
export interface JobTypes {
  'custom.task': {
    taskId: string;
    data: Record<string, unknown>;
  };
}
```

2. **Create handler** in `lib/job-handlers.ts`:
```typescript
const handleCustomTask: JobHandler<JobTypes['custom.task']> = async (job) => {
  const perfLogger = createPerformanceLogger('custom-task');
  try {
    // Implementation here
    perfLogger.finish();
  } catch (error) {
    perfLogger.error(error);
    throw error;
  }
};
```

3. **Register handler** in worker configuration

### Database Changes
```bash
# Create migration
pnpm dlx prisma migrate dev --name describe_changes

# Generate client
pnpm dlx prisma generate

# Reset database (development only)
pnpm dlx prisma migrate reset
```

### Code Quality Standards
- **No `any` types** - Use specific types or `unknown`
- **Error handling** - Always catch and log errors appropriately
- **Type safety** - Leverage TypeScript strictly
- **Logging** - Use structured logging with context
- **Testing** - Write tests for critical business logic

## ⚡ PNPM Configuration

This project is optimized for PNPM with the following configurations:

### Workspace Setup
- **`pnpm-workspace.yaml`** - Workspace configuration
- **`.npmrc`** - PNPM-specific settings with performance optimizations

### Key PNPM Benefits
- **Faster installs** - Symlinked node_modules structure
- **Disk efficiency** - Single global store for packages
- **Stricter dependency resolution** - Better security
- **Workspace support** - Built-in monorepo capabilities

### Common PNPM Commands
```bash
pnpm install              # Install dependencies
pnpm add <package>        # Add dependency
pnpm add -D <package>     # Add dev dependency
pnpm dlx <command>        # Run package without installing (like npx)
pnpm up                   # Update dependencies
pnpm why <package>        # Show dependency tree
```

## 🚨 Production Deployment

### Environment Configuration
- Set `NODE_ENV=production`
- Use strong `BETTER_AUTH_SECRET`
- Configure production database
- Set up proper logging aggregation
- Configure health check monitoring

### Scaling Considerations
- **Worker Scaling**: Run multiple worker processes
- **Database**: Use connection pooling and read replicas
- **Caching**: Implement Redis for session storage
- **Monitoring**: Set up comprehensive alerting

### Security Checklist
- ✅ Environment variables secured
- ✅ Database credentials rotated
- ✅ OAuth secrets configured
- ✅ CORS properly configured
- ✅ Rate limiting implemented
- ✅ Input validation in place

## 📚 Additional Resources

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [pg-boss Documentation](https://github.com/timgit/pg-boss)
- [pino Logging Documentation](https://getpino.io)
- [Better-auth Documentation](https://better-auth.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🤝 Contributing

1. Use **PNPM** for all package management
2. Follow the established code patterns  
3. Add comprehensive logging to new features
4. Include health checks for new services
5. Update documentation for significant changes
6. Ensure all jobs have proper error handling
7. Test internationalization with both LTR and RTL

## 📝 Migration Notes

**PNPM Migration Completed:**
- ✅ Removed `package-lock.json` and replaced with `pnpm-lock.yaml`
- ✅ Added `pnpm-workspace.yaml` and `.npmrc` for optimizations
- ✅ Updated all documentation to use PNPM commands
- ✅ Replaced MinIO code with generic S3 client (AWS SDK v3)
- ✅ All scripts now use PNPM for better performance

---

**Built with senior developer best practices** - This project prioritizes maintainability, scalability, and production readiness from the ground up, using PNPM for superior package management.