 'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../../../lib/useAuth'
import ScopeTwoBasedmarketPage from "@/components/environment/scope-two-basedmarket-page"
import Loading from "@/components/ui/loading"

export default function Page() {
  const { loading, profile } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      const dept = profile?.department ? String(profile.department).toLowerCase() : null
      if (dept && dept !== 'compliance') {
        const safeDept = dept.replace(/[^a-z0-9-_/]/gi, '').replace(/^\/+|\/+$/g, '')
        router.push('/' + safeDept)
      }
    }
  }, [loading, profile, router])

  return loading ? <Loading /> : <ScopeTwoBasedmarketPage />
}
