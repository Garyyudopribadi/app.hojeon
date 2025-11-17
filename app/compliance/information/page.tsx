'use client'

import { useAuth } from '../../../lib/useAuth'
import InformationPage from "@/components/information/information-page"
import Loading from "@/components/ui/loading"

export default function Page() {
  const { loading } = useAuth()

  return loading ? <Loading /> : <InformationPage />
}