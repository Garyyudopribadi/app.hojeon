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
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
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
      title: "Air Quality",
      url: "#",
      icon: Wind,
      isActive: true,
      items: [
        {
          title: "Monitoring",
          url: "#",
        },
        {
          title: "Reports",
          url: "#",
        },
        {
          title: "Alerts",
          url: "#",
        },
      ],
    },
    {
      title: "Water Quality",
      url: "#",
      icon: Droplets,
      items: [
        {
          title: "Testing",
          url: "#",
        },
        {
          title: "Compliance",
          url: "#",
        },
        {
          title: "History",
          url: "#",
        },
      ],
    },
    {
      title: "Environmental Impact",
      url: "#",
      icon: Leaf,
      items: [
        {
          title: "Assessments",
          url: "#",
        },
        {
          title: "Mitigation",
          url: "#",
        },
        {
          title: "Audits",
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
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
  projects: [
    {
      name: "Air Monitoring Project",
      url: "#",
      icon: Wind,
    },
    {
      name: "Water Treatment",
      url: "#",
      icon: Droplets,
    },
    {
      name: "Sustainability",
      url: "#",
      icon: Leaf,
    },
  ],
}

export function EnvironmentSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = useState({
    name: "Environment User",
    email: "env@example.com",
    avatar: "/avatars/env.jpg",
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
          name: profile?.nickname || "Environment User",
          email: authUser.email || "env@example.com",
          avatar: "/avatars/env.jpg",
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
                  <span className="truncate font-medium">Environment</span>
                  <span className="truncate text-xs">Compliance</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}