
"use client"

import { useState } from "react"
import { ShieldCheck, Plus, Search, Lock, Unlock, Edit2, Trash2, Loader2, Save, CheckCircle2, Users as UsersIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useFirestore, useCollection, useMemoFirebase, useUser, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"

const AVAILABLE_PERMISSIONS = [
  { id: "master_data", label: "Master Data Management", desc: "Manage materials, products, and prices" },
  { id: "sales", label: "Sales & Invoicing", desc: "Create and manage B2B invoices and outlet sales" },
  { id: "inventory", label: "Inventory Control", desc: "Handle stock adjustments, transfers, and receipts" },
  { id: "production", label: "Production Planning", desc: "Schedule and record production orders" },
  { id: "reports", label: "Operational Reports", desc: "View and export system-wide intelligence reports" },
  { id: "admin", label: "System Administration", desc: "Manage users, roles, and global settings" },
  { id: "audit", label: "Audit Logs", desc: "Access the central system activity trail" }
]

export default function RolesPermissionsPage() {
  const db = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [viewUsersRole, setViewUsersRole] = useState<string | null>(null)
  const [editingRole, setEditingRole] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: [] as string[]
  })

  const rolesRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, "system_roles");
  }, [db, user]);

  const usersRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, "users");
  }, [db, user]);

  const { data: roles, isLoading: isRolesLoading } = useCollection(rolesRef)
  const { data: allUsers } = useCollection(usersRef)

  const handleOpenAdd = () => {
    setEditingRole(null)
    setFormData({ name: "", description: "", permissions: [] })
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (role: any) => {
    setEditingRole(role)
    setFormData({ 
      name: role.name, 
      description: role.description || "", 
      permissions: role.permissions || [] 
    })
    setIsDialogOpen(true)
  }

  const handleTogglePermission = (permId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter(id => id !== permId)
        : [...prev.permissions, permId]
    }))
  }

  const handleSaveRole = () => {
    if (!formData.name || !rolesRef || !user) return

    const userCtx = { email: user.email, uid: user.uid };

    if (editingRole) {
      updateDocumentNonBlocking(doc(db, "system_roles", editingRole.id), formData, userCtx)
      toast({ title: "Role Updated", description: `Permissions for ${formData.name} have been modified.` })
    } else {
      addDocumentNonBlocking(rolesRef, {
        ...formData,
        createdAt: new Date().toISOString()
      }, userCtx)
      toast({ title: "Role Created", description: `New role ${formData.name} is now available.` })
    }

    setIsDialogOpen(false)
  }

  const handleDeleteRole = (id: string, name: string) => {
    if (!db || !user) return
    deleteDocumentNonBlocking(doc(db, "system_roles", id), { email: user.email, uid: user.uid })
    toast({ title: "Role Removed", description: `${name} has been deleted from the system.` })
  }

  const filteredRoles = roles?.filter(r => 
    r.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-foreground">Role Permissions</h1>
          <p className="text-muted-foreground">Configure access control policies and functional permission groups.</p>
        </div>
        <Button onClick={handleOpenAdd} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" /> New Role
        </Button>
      </div>

      <div className="mb-4 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search roles..." 
          className="pl-9" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isRolesLoading ? (
        <div className="p-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRoles.map((role) => {
            const assignedUsers = allUsers?.filter(u => u.role === role.name) || [];
            
            return (
              <Card key={role.id} className="border-none shadow-sm hover:shadow-md transition-all group">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="flex flex-col gap-1">
                    <CardTitle className="font-headline text-xl flex items-center gap-2">
                      {role.name}
                      {role.name === 'Administrator' && <Badge variant="secondary" className="bg-primary/10 text-primary text-[10px]">System</Badge>}
                    </CardTitle>
                    <CardDescription className="text-xs line-clamp-1">{role.description || "No description provided."}</CardDescription>
                  </div>
                  <Badge className="bg-secondary/10 text-secondary border-none">
                    <Lock className="h-3 w-3 mr-1" /> Active
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 rounded-lg bg-muted/30 border border-muted flex items-start gap-3">
                      <ShieldCheck className="h-4 w-4 text-secondary mt-0.5" />
                      <div>
                        <span className="text-xs font-bold uppercase text-muted-foreground block mb-1">Assigned Policies</span>
                        <div className="flex flex-wrap gap-1">
                          {role.permissions?.length > 0 ? (
                            role.permissions.map((p: string) => (
                              <Badge key={p} variant="outline" className="text-[9px] py-0 bg-white">
                                {AVAILABLE_PERMISSIONS.find(ap => ap.id === p)?.label || p}
                              </Badge>
                            ))
                          ) : <span className="text-[10px] text-muted-foreground italic">No permissions assigned.</span>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                       <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 text-primary hover:text-primary hover:bg-primary/5"
                        onClick={() => setViewUsersRole(role.name)}
                       >
                         <UsersIcon className="h-3.5 w-3.5 mr-1.5" />
                         {assignedUsers.length} Assigned {assignedUsers.length === 1 ? 'User' : 'Users'}
                       </Button>

                       <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(role)}>
                          <Edit2 className="h-3.5 w-3.5 mr-1.5" /> Edit
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive hover:text-destructive hover:bg-destructive/5"
                          onClick={() => handleDeleteRole(role.id, role.name)}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {filteredRoles.length === 0 && !isRolesLoading && (
            <div className="col-span-full py-20 text-center border-2 border-dashed rounded-3xl text-muted-foreground">
              No custom roles defined. Create your first organizational role above.
            </div>
          )}
        </div>
      )}

      {/* Edit/Add Role Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">
              {editingRole ? "Modify Role Permissions" : "Define New System Role"}
            </DialogTitle>
            <DialogDescription>
              Assign functional access levels to this user group.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="role-name">Role Identifier</Label>
              <Input 
                id="role-name" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. Production Supervisor"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role-desc">Role Description</Label>
              <Input 
                id="role-desc" 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Brief summary of duties..."
              />
            </div>
            <div className="space-y-4">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Functional Permissions</Label>
              <div className="grid gap-4">
                {AVAILABLE_PERMISSIONS.map((perm) => (
                  <div key={perm.id} className="flex items-start space-x-3 p-3 rounded-xl border bg-muted/10 hover:bg-accent/5 transition-colors">
                    <Checkbox 
                      id={perm.id} 
                      checked={formData.permissions.includes(perm.id)}
                      onCheckedChange={() => handleTogglePermission(perm.id)}
                    />
                    <div className="grid gap-1.5 leading-none cursor-pointer" onClick={() => handleTogglePermission(perm.id)}>
                      <label htmlFor={perm.id} className="text-sm font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {perm.label}
                      </label>
                      <p className="text-[10px] text-muted-foreground">
                        {perm.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveRole} className="w-full bg-secondary text-secondary-foreground font-bold h-12">
              <Save className="h-4 w-4 mr-2" /> 
              {editingRole ? "Update Permission Policy" : "Register System Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Users Dialog */}
      <Dialog open={!!viewUsersRole} onOpenChange={(open) => !open && setViewUsersRole(null)}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl flex items-center gap-2">
              <UsersIcon className="h-5 w-5 text-primary" />
              Users with "{viewUsersRole}" Role
            </DialogTitle>
            <DialogDescription>
              Directory of accounts currently assigned to this functional group.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto space-y-2 py-4">
            {allUsers?.filter(u => u.role === viewUsersRole).map((u) => (
              <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl border bg-muted/5">
                <Avatar className="h-9 w-9 border-2 border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                    {u.name?.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold truncate">{u.name}</span>
                  <span className="text-[10px] text-muted-foreground truncate">{u.email}</span>
                </div>
                <div className="ml-auto">
                   <Badge variant="outline" className="text-[9px] uppercase bg-green-50 text-green-600 border-green-200">
                     {u.status || 'Active'}
                   </Badge>
                </div>
              </div>
            ))}
            {(allUsers?.filter(u => u.role === viewUsersRole).length || 0) === 0 && (
              <div className="text-center py-10">
                <UsersIcon className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-xs text-muted-foreground italic">No users are currently assigned to this role.</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" className="w-full" onClick={() => setViewUsersRole(null)}>Close Directory</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
