'use client'

import * as React from 'react'
import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from 'next-themes'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-input bg-transparent hover:bg-accent hover:text-accent-foreground">
        <Monitor className="h-4 w-4" />
        <span className="sr-only">Toggle theme</span>
      </button>
    )
  }

  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  const getIcon = () => {
    if (theme === 'light') return <Sun className="h-4 w-4" />
    if (theme === 'dark') return <Moon className="h-4 w-4" />
    return <Monitor className="h-4 w-4" />
  }

  const getLabel = () => {
    if (theme === 'light') return 'Switch to dark mode'
    if (theme === 'dark') return 'Switch to system mode'
    return 'Switch to light mode'
  }

  return (
    <button
      onClick={cycleTheme}
      className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-input bg-transparent hover:bg-accent hover:text-accent-foreground transition-colors"
      aria-label={getLabel()}
    >
      {getIcon()}
      <span className="sr-only">{getLabel()}</span>
    </button>
  )
}
