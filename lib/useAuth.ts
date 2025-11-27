import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from './supabase'

export type UserProfile = {
  id: string
  created_at?: string | null
  nickname?: string | null
  role?: string | null
  entity?: string | null
  facility?: string | null
  department?: string | null
  nik?: string | null
  ktp?: string | null
  tanggal_masuk_karyawan?: string | null
}

export function useAuth() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const router = useRouter()

  useEffect(() => {
    let mounted = true

    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/')
          return
        }

        // fetch full profile from `profiles` table
        const { data: profileData, error } = await supabase
          .from<UserProfile>('profiles')
          .select('id, created_at, nickname, role, entity, facility, department, nik, ktp, tanggal_masuk_karyawan')
          .eq('id', user.id)
          .maybeSingle()

        if (error) {
          const msg = (error as any)?.message || JSON.stringify(error)
          console.error('Error fetching profile:', msg, error)
          // fail-safe: sign the user out / redirect to login
          try {
            router.push('/')
          } catch (e) {
            console.error('Redirect failed after profile error:', e)
          }
          return
        }

        if (mounted) {
          setProfile(profileData ?? null)
          setLoading(false)
        }
      } catch (error) {
        console.error('Error checking auth:', error)
        router.push('/')
      }
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.push('/')
      } else if (event === 'SIGNED_IN' && session?.user) {
        // when user signs in, refresh profile
        checkAuth()
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [router])

  return { loading, profile }
}