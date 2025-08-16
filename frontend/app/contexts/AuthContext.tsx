import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

type Role = 'user' | 'publisher'

type AuthUser = {
  role: Role
  name?: string
  registerNumber?: string
  email?: string
  department?: string
}

type AuthState =
  | { status: 'loading' }
  | { status: 'unauthenticated' }
  | { status: 'authenticated'; user: AuthUser }

type AuthContextType = {
  state: AuthState
  signIn: (user: AuthUser) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const AUTH_STORAGE_KEY = 'auth:state:v1'

function isValidAuthUser(user: any): user is AuthUser {
  return (
    user &&
    typeof user === 'object' &&
    (user.role === 'user' || user.role === 'publisher') &&
    (user.name === undefined || typeof user.name === 'string') &&
    (user.registerNumber === undefined || typeof user.registerNumber === 'string') &&
    (user.email === undefined || typeof user.email === 'string') &&
    (user.department === undefined || typeof user.department === 'string')
  )
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: 'loading' })

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      try {
        const raw = await AsyncStorage.getItem(AUTH_STORAGE_KEY)
        if (raw) {
          const parsed: AuthUser = JSON.parse(raw)
          if (isMounted && isValidAuthUser(parsed)) {
            setState({ status: 'authenticated', user: parsed })
            return
          }
        }
      } catch {
        // fallthrough to unauthenticated
      }
      if (isMounted) setState({ status: 'unauthenticated' })
    })()
    return () => {
      isMounted = false
    }
  }, [])

  const signIn = useCallback(async (user: AuthUser) => {
    try {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
      setState({ status: 'authenticated', user })
    } catch (error) {
      // Log error or show user feedback
      throw new Error('Failed to sign in: Could not save authentication state')
    }
  }, [])

const signOut = useCallback(async () => {
  try {
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY)
    setState({ status: 'unauthenticated' })
  } catch (error) {
    // Even if storage removal fails, we should still update the state
    // as the user explicitly requested to sign out
    setState({ status: 'unauthenticated' })
    // Log error for debugging
    console.warn('Failed to remove auth data from storage:', error)
  }
}, [])

  const value = useMemo(() => ({ state, signIn, signOut }), [state, signIn, signOut])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}


