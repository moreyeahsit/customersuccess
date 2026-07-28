import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Role } from '@/types/rbac'
import { permissionsFor } from '@/types/rbac'

interface RoleContextValue {
  role: Role
  setRole: (role: Role) => void
  permissions: ReturnType<typeof permissionsFor>
}

const RoleContext = createContext<RoleContextValue | null>(null)

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('Customer Success Manager')
  return <RoleContext.Provider value={{ role, setRole, permissions: permissionsFor(role) }}>{children}</RoleContext.Provider>
}

export function useRole() {
  const ctx = useContext(RoleContext)
  if (!ctx) throw new Error('useRole must be used within RoleProvider')
  return ctx
}
