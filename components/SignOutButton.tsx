'use client'

import * as React from 'react'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'

type SignOutButtonProps = React.ComponentProps<typeof Button>

export function SignOutButton({ children, ...props }: SignOutButtonProps) {
  const [isLoading, setIsLoading] = React.useState(false)

  const handleClick = async () => {
    try {
      setIsLoading(true)
      await authClient.signOut()
      window.location.reload()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleClick} disabled={isLoading} className="h-auto p-1 hover:bg-accent" {...props}>
      {children}
    </Button>
  )
}


