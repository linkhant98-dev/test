
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import Image from "next/image"
import { 
  LayoutDashboard, 
  Database, 
  Package, 
  Factory, 
  FileText, 
  ShieldCheck,
  ChevronRight,
  Globe,
  LogOut,
  Tag,
  Settings,
  Store,
  Receipt,
  ArrowRightLeft,
  User as UserIcon,
  CircleUser,
  Loader2,
  BookOpen
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
import { useTranslation } from "@/context/language-context"
import { Button } from "@/components/ui/button"
import { useUser, useAuth } from "@/firebase"
import { signOut } from "firebase/auth"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAppSettings } from "@/components/theme-provider"

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { t, setLanguage, language } = useTranslation()
  const { user, isUserLoading } = useUser()
  const auth = useAuth()
  const settings = useAppSettings()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (pathname === "/login") return null

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth)
      router.push("/login")
    }
  }

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
        { title: t("priceMaster"), url: "/master-data/prices" },
        { title: t("bomManagement"), url: "/master-data/bom" },
        { title: t("warehouses"), url: "/master-data/warehouses" },
        { title: t("wasteReasons"), url: "/master-data/waste-reasons" },
        { title: t("customers"), url: "/master-data/customers" },
        { title: t("outlets"), url: "/master-data/outlets" },
      ]
    },
    {
      title: t("sales"),
      icon: Tag,
      items: [
        { title: t("invoices"), url: "/sales/invoices" },
        { title: t("outletSales"), url: "/sales/outlet-sales" },
      ]
    },
    {
      title: t("inventory"),
      icon: Package,
      items: [
        { title: t("stockOverview"), url: "/inventory" },
        { title: t("inventoryLedger"), url: "/inventory/ledger" },
        { title: t("goodsReceipt"), url: "/inventory/receipt" },
        { title: t("productionIssues"), url: "/inventory/issue" },
        { title: t("adjustments"), url: "/inventory/adjust" },
        { title: t("expenseEntry"), url: "/inventory/expense" },
        { title: t("stockTransfer"), url: "/inventory/transfer" },
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
        { title: t("globalSettings"), url: "/admin/settings" },
        { title: t("userManagement"), url: "/admin/users" },
        { title: t("rolePermissions"), url: "/admin/roles" },
        { title: t("systemLogs"), url: "/admin/logs" },
      ]
    }
  ]

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="h-16 flex items-center px-6 border-b shrink-0">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center p-1 shadow-sm overflow-hidden group-hover:scale-105 transition-transform">
             {settings?.companyLogoUrl ? (
               <img src={settings.companyLogoUrl} alt="Logo" className="object-contain h-full w-full" />
             ) : (
                <Image 
                  src="https://picsum.photos/seed/cheese-logo/100/100"
                  alt="Logo"
                  width={32}
                  height={32}
                  className="object-contain"
                />
             )}
          </div>
          <span className="text-xl font-black font-headline tracking-tighter uppercase leading-none">Cheesy Bites</span>
        </Link>
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

        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel>{t("userProfile")}</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/profile"} tooltip={t("profile")}>
                <Link href="/profile">
                  <CircleUser className="h-4 w-4" />
                  <span className="font-medium">{t("profile")}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 space-y-4">
        {!mounted ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {user && (
              <div className="flex flex-col gap-2 p-2 rounded-xl bg-muted/40 border">
                <Link href="/profile" className="flex items-center gap-3 p-1 rounded-lg hover:bg-muted/60 transition-colors">
                  <Avatar className="h-8 w-8 border-2 border-primary">
                    <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                      {user.isAnonymous ? "DA" : (user.email?.[0].toUpperCase() || "U")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold truncate">
                      {user.isAnonymous ? "Demo Admin" : (user.displayName || "Standard User")}
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate opacity-70">
                      {t("profile")}
                    </span>
                  </div>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full h-8 text-[10px] font-bold text-destructive hover:text-destructive hover:bg-destructive/5"
                  onClick={handleLogout}
                >
                  <LogOut className="h-3 w-3 mr-2" />
                  {t("signOut")}
                </Button>
              </div>
            )}

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
          </>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
