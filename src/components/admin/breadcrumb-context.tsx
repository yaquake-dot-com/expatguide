"use client"

import { createContext, useContext, useState, useCallback } from "react"

type Labels = Record<string, string>

const BreadcrumbContext = createContext<{
  labels: Labels
  setLabel: (id: string, label: string) => void
}>({ labels: {}, setLabel: () => {} })

export function BreadcrumbProvider({ children }: { children: React.ReactNode }) {
  const [labels, setLabels] = useState<Labels>({})

  const setLabel = useCallback((id: string, label: string) => {
    setLabels((prev) => (prev[id] === label ? prev : { ...prev, [id]: label }))
  }, [])

  return (
    <BreadcrumbContext value={{ labels, setLabel }}>
      {children}
    </BreadcrumbContext>
  )
}

export function useBreadcrumbLabels() {
  return useContext(BreadcrumbContext)
}
