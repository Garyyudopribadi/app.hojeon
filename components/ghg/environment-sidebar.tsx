"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import {
  BookOpen,
  LifeBuoy,
  Settings2,
  Leaf,
  Flame,
  CircuitBoard,
  Biohazard,
  Info,
  BrickWall,
  Cross,
  PieChart,
  Wind,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavPlatform } from "@/components/nav-platform"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { supabase } from "@/lib/supabase"

const data = {
  navMain: [
    {
      title: "Scope 1",
      url: "/compliance/environment/ghg/scopeone",
      icon: Flame,
      items: [
        {
          title: "Raw Data",
          url: "/compliance/environment/ghg/scopeone",
        },
      ],
    },
    {
      title: "Scope 2",
      url: "#",
      icon: CircuitBoard,
      items: [],
    },
    {
      title: "Scope 3",
      url: "#",
      icon: Wind,
      items: [],
    },
    {
      title: "Quantitative Data Analysis",
      url: "#",
      icon: PieChart,
      items: [],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Notifications",
          url: "#",
        },
        {
          title: "Data Sources",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
  ],
  platform: [
    {
      name: "Information Facility",
      url: "/compliance/information",
      icon: Info,
    },
    {
      name: "Fire Safety",
      url: "#",
      icon: Flame,
    },
    {
      name: "Electrical Safety",
      url: "#",
      icon: CircuitBoard,
    },
    {
      name: "Chemical Safety",
      url: "#",
      icon: Biohazard,
    },
    {
      name: "Building Safety",
      url: "#",
      icon: BrickWall,
    },
    {
      name: "First Aid Management",
      url: "#",
      icon: Cross,
    },
    {
      name: "Document Management",
      url: "#",
      icon: BookOpen,
    },
  ],
}

export function GhgSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = useState({
    name: "GHG User",
    email: "ghg@example.com",
    avatar: "/avatars/ghg.jpg",
  })

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('nickname')
          .eq('id', authUser.id)
          .maybeSingle()
        setUser({
          name: profile?.nickname || "GHG User",
          email: authUser.email || "ghg@example.com",
          avatar: "/avatars/ghg.jpg",
        })
      }
    }
    fetchUser()
  }, [])
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Leaf className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">GHG</span>
                  <span className="truncate text-xs">Greenhouse Gas</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavPlatform platform={data.platform} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}