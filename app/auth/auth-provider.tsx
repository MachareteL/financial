"use client"
import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import type { User } from "@/domain/entities/user"
import { getCurrentAuthUserUseCase } from "@/infrastructure/dependency-injection"

const AuthContext = createContext<{ user: User | null; loading: boolean }>({ user: null, loading: true })

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const u = await getCurrentAuthUserUseCase.execute()
        setUser(u)
      } catch (err) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>
}
