
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Database, 
  Package, 
  Factory, 
  History, 
  FileText, 
  Sparkles,
  Settings,
  ShieldCheck,
  ChevronRight
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

const navigation = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Master Data",
    icon: Database,
    items: [
      { title: "Materials", url: "/master-data/materials" },
      { title: "Finished Goods", url: "/master-data/products" },
      { title: "BOM Management", url: "/master-data/bom" },
      { title: "Warehouses", url: "/master-data/warehouses" },
      { title: "Waste Reasons", url: "/master-data/waste-reasons" },
    ]
  },
  {
    title: "Inventory",
    icon: Package,
    items: [
      { title: "Stock Overview", url: "/inventory" },
      { title: "Goods Receipt", url: "/inventory/receipt" },
      { title: "Production Issues", url: "/inventory/issue" },
      { title: "Adjustments", url: "/inventory/adjust" },
    ]
  },
  {
    title: "Production",
    icon: Factory,
    items: [
      { title: "Production Orders", url: "/production" },
      { title: "Planning", url: "/production/plan" },
      { title: "AI Variance Insights", url: "/production/ai-insights" },
    ]
  },
  {
    title: "Reporting",
    icon: FileText,
    url: "/reports",
  },
  {
    title: "Administration",
    icon: ShieldCheck,
    items: [
      { title: "User Management", url: "/admin/users" },
      { title: "Role Permissions", url: "/admin/roles" },
      { title: "System Logs", url: "/admin/logs" },
    ]
  }
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
            <span className="text-xl font-bold text-primary-foreground">🧀</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold leading-none font-headline text-foreground">Cheesy Bites</span>
            <span className="text-xs text-muted-foreground">Inventory Control</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {navigation.map((item) => (
              <SidebarMenuItem key={item.title}>
                {item.items ? (
                  <Collapsible className="group/collapsible">
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={item.title} className="hover:bg-sidebar-accent transition-colors duration-200">
                        <item.icon className="h-4 w-4" />
                        <span className="flex-1 font-medium">{item.title}</span>
                        <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild isActive={pathname === subItem.url}>
                              <Link href={subItem.url} className="py-2">
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title} className="hover:bg-sidebar-accent transition-colors duration-200">
                    <Link href={item.url!}>
                      <item.icon className="h-4 w-4" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="rounded-lg bg-accent p-4 flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-secondary" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-secondary">AI Assistant</span>
            <span className="text-[10px] text-muted-foreground leading-tight">Ready for analysis</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
