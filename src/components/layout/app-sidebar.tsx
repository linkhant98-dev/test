
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Database, 
  Package, 
  Factory, 
  FileText, 
  ShieldCheck,
  ChevronRight,
  Globe
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
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useTranslation } from "@/context/language-context"
import { Button } from "@/components/ui/button"

export function AppSidebar() {
  const pathname = usePathname()
  const { t, setLanguage, language } = useTranslation()

  const navigation = [
    {
      title: t("dashboard"),
      url: "/",
      icon: LayoutDashboard,
    },
    {
      title: t("masterData"),
      icon: Database,
      items: [
        { title: t("materials"), url: "/master-data/materials" },
        { title: t("finishedGoods"), url: "/master-data/products" },
        { title: t("bomManagement"), url: "/master-data/bom" },
        { title: t("warehouses"), url: "/master-data/warehouses" },
        { title: t("wasteReasons"), url: "/master-data/waste-reasons" },
      ]
    },
    {
      title: t("inventory"),
      icon: Package,
      items: [
        { title: t("stockOverview"), url: "/inventory" },
        { title: t("goodsReceipt"), url: "/inventory/receipt" },
        { title: t("productionIssues"), url: "/inventory/issue" },
        { title: t("adjustments"), url: "/inventory/adjust" },
      ]
    },
    {
      title: t("production"),
      icon: Factory,
      items: [
        { title: t("productionOrders"), url: "/production" },
        { title: t("planning"), url: "/production/plan" },
      ]
    },
    {
      title: t("reporting"),
      icon: FileText,
      url: "/reports",
    },
    {
      title: t("administration"),
      icon: ShieldCheck,
      items: [
        { title: t("userManagement"), url: "/admin/users" },
        { title: t("rolePermissions"), url: "/admin/roles" },
        { title: t("systemLogs"), url: "/admin/logs" },
      ]
    }
  ]

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
        <div className="flex flex-col gap-2">
           <div className="flex items-center gap-2 px-2 text-xs font-bold text-muted-foreground uppercase mb-1">
             <Globe className="h-3 w-3" /> {t("language")}
           </div>
           <div className="flex gap-1 p-1 bg-muted rounded-md">
             <Button 
               variant={language === 'en' ? 'secondary' : 'ghost'} 
               size="sm" 
               className="flex-1 h-7 text-[10px]"
               onClick={() => setLanguage('en')}
             >
               {t("english")}
             </Button>
             <Button 
               variant={language === 'my' ? 'secondary' : 'ghost'} 
               size="sm" 
               className="flex-1 h-7 text-[10px]"
               onClick={() => setLanguage('my')}
             >
               {t("myanmar")}
             </Button>
           </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
