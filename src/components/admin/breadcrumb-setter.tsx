"use client"

import { useEffect } from "react"
import { useBreadcrumbLabels } from "./breadcrumb-context"

export function BreadcrumbSetter({ id, label }: { id: string; label: string }) {
  const { setLabel } = useBreadcrumbLabels()
  useEffect(() => { setLabel(id, label) }, [id, label, setLabel])
  return null
}
