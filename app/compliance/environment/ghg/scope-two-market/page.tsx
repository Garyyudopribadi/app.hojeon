'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../../../lib/useAuth'
import ScopeTwoMarketPage from "@/components/environment/scope-two-market-page"
import Loading from "@/components/ui/loading"

export default function Page() {
  const { loading, profile } = useAuth()
  const router = useRouter()
  const hasCheckedRef = useRef(false)

  useEffect(() => {
    if (!loading && profile && !hasCheckedRef.current) {
      hasCheckedRef.current = true
      const dept = profile?.department ? String(profile.department).toLowerCase() : null
      if (dept && dept !== 'compliance') {
        const safeDept = dept.replace(/[^a-z0-9-_/]/gi, '').replace(/^\/+|\/+$/g, '')
        router.push('/' + safeDept)
      }
    }
  }, [loading, profile, router])

  if (loading) return <Loading />
  
  return <ScopeTwoMarketPage />
}
