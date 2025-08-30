import fs from 'node:fs'
import path from 'node:path'

function walk(dir: string, results: string[] = []): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (['node_modules', '.next', 'out', 'build', '.git'].includes(entry.name)) continue
      walk(fullPath, results)
    } else if (entry.isFile()) {
      if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
        results.push(fullPath)
      }
    }
  }
  return results
}

function main() {
  const root = process.cwd()
  const files = walk(root)
  const offenders: string[] = []
  for (const file of files) {
    const rel = path.relative(root, file)
    if (rel.startsWith('node_modules') || rel.startsWith('.next')) continue
    const content = fs.readFileSync(file, 'utf8')
    const head = content.split(/\r?\n/).slice(0, 5).join('\n')
    if (/^\s*['\"]use client['\"];?/m.test(head)) {
      const base = path.basename(file)
      const allow = new Set([
        'ThemeToggle.tsx',
        'LanguageToggle.tsx',
        'SignOutButton.tsx',
        'auth-hooks.ts',
      ])
      if (!allow.has(base)) offenders.push(rel)
    }
  }

  if (offenders.length) {
    console.log('\nFound client components that may violate SSR-first policy:')
    for (const f of offenders) console.log(' -', f)
    process.exitCode = 1
  } else {
    console.log('No unexpected use of "use client" found.')
  }
}

try {
  main()
} catch (err) {
  console.error(err)
  process.exit(1)
}


