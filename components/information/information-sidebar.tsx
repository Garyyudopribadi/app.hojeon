"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import {
  BookOpen,
  Bot,
  Command,
  Frame,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings2,
  SquareTerminal,
  Leaf,
  Droplets,
  Wind,
  Flame,
  CircuitBoard,
  Biohazard,
  Info,
  BrickWall,
  Cross,
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
      title: "Information Management",
      url: "#",
      icon: Info,
      items: [
        {
          title: "Data Collection",
          url: "#",
        },
        {
          title: "Data Analysis",
          url: "#",
        },
        {
          title: "Reports",
          url: "#",
        },
        {
          title: "Compliance Check",
          url: "#",
        },
      ],
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
      name: "Environment Management",
      url: "/compliance/environment",
      icon: Leaf,
    },
    {
      name: "Document Management",
      url: "#",
      icon: BookOpen,
    },
  ],
}

export function InformationSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = useState({
    name: "Information User",
    email: "info@example.com",
    avatar: "/avatars/info.jpg",
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
          name: profile?.nickname || "Information User",
          email: authUser.email || "info@example.com",
          avatar: "/avatars/info.jpg",
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
                  <Info className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Information Facility</span>
                  <span className="truncate text-xs">Compliance</span>
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