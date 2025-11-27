 'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../lib/useAuth'
import { User, LogOut, Flame, Zap, Beaker, Building, Bandage, Leaf, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { supabase } from '@/lib/supabase'

const menuItems = [
  { title: 'Fire Safety', description: 'Manage fire safety protocols', icon: Flame, path: null },
  { title: 'Electrical Safety', description: 'Electrical safety guidelines', icon: Zap, path: null },
  { title: 'Chemical', description: 'Chemical handling procedures', icon: Beaker, path: null },
  { title: 'Building Safety', description: 'Building safety measures', icon: Building, path: null },
  { title: 'First Aid Kit', description: 'First aid kit locations', icon: Bandage, path: null },
  { title: 'Environment', description: 'Environmental policies', icon: Leaf, path: '/yongjin/compliance/environtment' },
  { title: 'Document Control', description: 'Document management', icon: FileText, path: null },
]

export default function DashboardPage() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [loadingLocal, setLoadingLocal] = useState(true)
  const router = useRouter()
  const { loading, profile } = useAuth()

  useEffect(() => {
    if (!loading) {
      setLoadingLocal(false)
    }
  }, [loading])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  return (
    <>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-xl shadow-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex justify-between items-center py-6">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
                PT.YONGJIN JAVASUKA GARMENT
              </h1>
              <p className="text-sm text-gray-500 font-medium" suppressHydrationWarning>
                {formatDate(currentTime)} • {formatTime(currentTime)}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700">Gary Yudo</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-gray-100/50 transition-all duration-200 active:scale-95">
                    <User className="h-5 w-5 text-gray-700" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-white/95 backdrop-blur-xl border-gray-200/50 shadow-xl rounded-2xl" align="end" forceMount>
                  <DropdownMenuItem className="hover:bg-gray-50/80 transition-colors rounded-xl mx-1 my-0.5">
                    <User className="mr-3 h-4 w-4 text-gray-600" />
                    <span className="font-medium text-gray-900">Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-gray-50/80 transition-colors rounded-xl mx-1 my-0.5">
                    <LogOut className="mr-3 h-4 w-4 text-gray-600" />
                    <span className="font-medium text-gray-900">Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-12 px-6 sm:px-8 lg:px-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">Management System</h2>
          <p className="text-base text-gray-600 max-w-xl mx-auto leading-relaxed">
            Comprehensive management solutions for your entity
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {menuItems.map((item, index) => {
            const IconComponent = item.icon
            const cardElement = (
              <Card className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-sm hover:shadow-xl hover:bg-white transition-all duration-300 cursor-pointer rounded-2xl hover:scale-[1.02] active:scale-[0.98]">
                <CardHeader className="pb-4 pt-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-xl bg-gray-100/80 shadow-sm group-hover:bg-gray-200/80 group-hover:shadow-md transition-all duration-300">
                      <IconComponent className="h-7 w-7 text-gray-700" />
                    </div>
                    <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-gray-800 transition-colors leading-tight">
                      {item.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-gray-600 group-hover:text-gray-500 transition-colors text-sm leading-relaxed">
                    {item.description}
                  </CardDescription>
                </CardContent>
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-2xl" />
              </Card>
            )
            return item.path ? (
              <Link key={index} href={item.path}>
                {cardElement}
              </Link>
            ) : (
              <div key={index}>
                {cardElement}
              </div>
            )
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/70 backdrop-blur-xl border-t border-gray-200/50 mt-20">
        <div className="max-w-7xl mx-auto py-8 px-6 sm:px-8 lg:px-10">
          <p className="text-center text-sm text-gray-600 font-medium">
            © 2025 PT.YONGJIN JAVASUKA GARMENT. All rights reserved. 
            <span className="text-gray-900 font-semibold ml-1">Developed by Garyyudo</span>
          </p>
        </div>
      </footer>
    </div>
    )}
  </>
  )
}