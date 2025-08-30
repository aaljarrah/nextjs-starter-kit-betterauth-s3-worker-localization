'use client';

import { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth-client';

export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
  };
  user: User;
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const result = await authClient.getSession();
        setSession(result.data);
      } catch (error) {
        console.error('Error checking auth:', error);
        setSession(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // No subscription API available; rely on page navigations or manual refresh
    return () => {};
  }, []);

  const signOut = async () => {
    try {
      await authClient.signOut();
      setSession(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return {
    session,
    user: session?.user,
    isLoading,
    isAuthenticated: !!session,
    signOut,
  };
}
