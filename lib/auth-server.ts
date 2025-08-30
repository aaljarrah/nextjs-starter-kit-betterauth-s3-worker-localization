import { headers as getHeaders } from 'next/headers'
import { auth } from '@/lib/auth'

export interface ServerSessionUser {
  id: string
  email: string
  name?: string
  image?: string
  emailVerified: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ServerSession {
  session: {
    id: string
    userId: string
    expiresAt: Date
  }
  user: ServerSessionUser
}

export async function getServerSession(): Promise<ServerSession | null> {
  try {
    const headerList = await getHeaders()
    const headersInit = new Headers(Array.from(headerList.entries()))
    const session = await auth.api.getSession({ headers: headersInit })
    return (session ?? null) as ServerSession | null
  } catch {
    return null
  }
}

export async function getCurrentUser(): Promise<ServerSessionUser | null> {
  const session = await getServerSession()
  return session?.user ?? null
}


