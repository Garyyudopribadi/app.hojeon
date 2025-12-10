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
import ScopeTwoBasedmarketContent from "./scope-two-basedmarket-content"
import Image from "next/image"

export default function ScopeTwoBasedmarketPage() {
  return (
    <SidebarProvider variant="floating">
      <EnvironmentSidebar />
      <SidebarInset className="flex flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between px-4 sticky top-0 bg-background z-50 border-b">
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
                  <BreadcrumbLink href="/compliance/environment">
                    Environment
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/compliance/environment/ghg">
                    GHG Emissions
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Scope Two - Market-Based</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center pointer-events-none">
            <Image src="/logo.png" alt="Logo" width={100} height={100} />
          </div>
        </header>
        <div className="flex-1 overflow-auto px-4 w-full">
          <ScopeTwoBasedmarketContent />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
