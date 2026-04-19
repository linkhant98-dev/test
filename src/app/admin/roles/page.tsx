
"use client"

import { ShieldCheck, Plus, Search, Lock, Unlock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const roles = [
  { name: "Administrator", permissions: "Full Access", users: 2, color: "bg-destructive/10 text-destructive" },
  { name: "Production Manager", permissions: "Production, BOM, Reports", users: 5, color: "bg-secondary/10 text-secondary" },
  { name: "Inventory Manager", permissions: "Inventory, Master Data", users: 8, color: "bg-primary/10 text-primary" },
  { name: "Viewer", permissions: "Read Only Reports", users: 12, color: "bg-muted text-muted-foreground" },
]

export default function RolesPermissionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline text-foreground">Role Permissions</h1>
          <p className="text-muted-foreground">Configure access control policies and permission groups.</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" /> New Role
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roles.map((role) => (
          <Card key={role.name} className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div className="flex flex-col gap-1">
                <CardTitle className="font-headline text-xl">{role.name}</CardTitle>
                <CardDescription className="text-xs">{role.users} users assigned</CardDescription>
              </div>
              <Badge className={`${role.color} border-none`}>
                <Lock className="h-3 w-3 mr-1" /> Configured
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-muted/30 border border-muted flex items-start gap-3">
                  <ShieldCheck className="h-4 w-4 text-secondary mt-0.5" />
                  <div>
                    <span className="text-xs font-bold uppercase text-muted-foreground block mb-1">Key Permissions</span>
                    <p className="text-sm font-medium">{role.permissions}</p>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm">Edit Permissions</Button>
                  <Button variant="outline" size="sm">View Users</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
