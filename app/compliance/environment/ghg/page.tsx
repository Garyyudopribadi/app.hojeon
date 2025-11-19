'use client'

import { useAuth } from '@/lib/useAuth'
import EnvironmentPage from "@/components/environment/environment-page"
import Loading from "@/components/ui/loading"

export default function Page() {
  const { loading } = useAuth()

  return loading ? <Loading /> : <EnvironmentPage />
}
