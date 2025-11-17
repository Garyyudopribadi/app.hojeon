import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { EnvironmentSidebar } from "@/components/environment/environment-sidebar"
import EnvironmentContent from "@/components/environment/environment-content"
import Image from "next/image"

export default function EnvironmentPage() {
  return (
    <SidebarProvider>
      <EnvironmentSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between px-4 sticky top-0 bg-background z-10">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/compliance">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Environment</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center pointer-events-none">
            <Image src="/logo.png" alt="Logo" width={100} height={100} />
          </div>
        </header>
        <EnvironmentContent />
      </SidebarInset>
    </SidebarProvider>
  )
}