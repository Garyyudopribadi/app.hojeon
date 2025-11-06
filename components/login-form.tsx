"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<"form">) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Login attempt started')
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log('Sign in result:', { data, error })

      if (error) {
        toast.error(error.message)
        setLoading(false)
        return
      }

      console.log('Fetching profile for user:', data.user.id)

      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle()

      console.log('Profile fetch result:', { profile, profileError })

      if (profileError) {
        toast.error('Error fetching profile: ' + profileError.message)
        setLoading(false)
        return
      }

      // Check role case-insensitively
      if (profile && profile.role.toLowerCase() === 'compliance') {
        console.log('Redirecting to /compliance')
        window.location.href = '/compliance'
      } else {
        console.log('Redirecting to /dashboard')
        window.location.href = '/dashboard'
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      toast.error('An unexpected error occurred')
      setLoading(false)
    }
  }

  return (
    <>
      {loading && (
        <div className="flex flex-col items-center justify-center gap-4 p-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Logging in and loading data...</p>
        </div>
      )}
      {!loading && (
        <form onSubmit={handleSubmit} className={cn("flex flex-col gap-6", className)} {...props}>
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-bold">Login to your account</h1>
            <p className="text-balance text-sm text-muted-foreground">Enter your email below to login to your account</p>
          </div>
          <div className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </div>
          <div className="text-center text-sm">
           Forget Password or Don&apos;t have an account?{" "}
            <a href="#" className="underline underline-offset-4">
              Create Ticket.
            </a>
          </div>
        </form>
      )}
    </>
  )
}
