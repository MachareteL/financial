"use client"
import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import type { UserSession } from "@/domain/dto/user.types.d.ts"
import { getCurrentAuthUserUseCase } from "@/infrastructure/dependency-injection"

const AuthContext = createContext<{ session: UserSession | null; loading: boolean }>({ session: null, loading: true })

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: ReactNode }) {

  const [session, setSession] = useState<UserSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const sessionData = await getCurrentAuthUserUseCase.execute()
        setSession(sessionData)
      } catch (err) {
        setSession(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  return <AuthContext.Provider value={{ session, loading }}>{children}</AuthContext.Provider>
}