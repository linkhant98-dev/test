
"use client"

import { useState } from "react"
import { Users, Plus, Search, Shield, MoreVertical, Edit2, Trash2, Key, Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useFirestore, useCollection, useMemoFirebase, useUser, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"

export default function UserManagementPage() {
  const db = useFirestore()
  const { user: currentUser } = useUser()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddOpen, setIsAddOpen] = useState(false)
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Viewer",
    status: "Active"
  })

  const usersRef = useMemoFirebase(() => {
    if (!currentUser) return null;
    return collection(db, "users");
  }, [db, currentUser]);

  const { data: users, isLoading } = useCollection(usersRef)

  const handleAddUser = () => {
    if (!formData.name || !formData.email || !usersRef || !currentUser) return
    
    addDocumentNonBlocking(usersRef, {
      ...formData,
      createdAt: new Date().toISOString()
    }, { email: currentUser.email, uid: currentUser.uid })
    
    setFormData({ name: "", email: "", role: "Viewer", status: "Active" })
    setIsAddOpen(false)
    toast({
      title: "User Added",
      description: `${formData.name} has been added to the system directory.`
    })
  }

  const handleDeleteUser = (id: string, name: string) => {
    if (!db || !currentUser) return
    deleteDocumentNonBlocking(doc(db, "users", id), { email: currentUser.email, uid: currentUser.uid })
    toast({
      title: "User Removed",
      description: `${name} has been deleted from the system.`
    })
  }

  const toggleStatus = (user: any) => {
    if (!db || !currentUser) return
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active'
    updateDocumentNonBlocking(doc(db, "users", user.id), { status: newStatus }, { email: currentUser.email, uid: currentUser.uid })
  }

  const filteredUsers = users?.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline text-foreground">User Management</h1>
          <p className="text-muted-foreground">Manage system users, their access levels and operational status.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" /> Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="font-headline text-2xl">Register System User</DialogTitle>
              <DialogDescription>Define a new user profile and assign their initial access role.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  placeholder="e.g. John Doe"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  placeholder="john@cheesybites.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">System Role</Label>
                <Select value={formData.role} onValueChange={(v) => setFormData({...formData, role: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Administrator">Administrator</SelectItem>
                    <SelectItem value="Production Manager">Production Manager</SelectItem>
                    <SelectItem value="Inventory Manager">Inventory Manager</SelectItem>
                    <SelectItem value="Viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddUser} className="w-full bg-secondary text-secondary-foreground font-bold">
                <Save className="h-4 w-4 mr-2" /> Create User Record
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="p-4 border-b bg-muted/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search users by name or email..." 
              className="pl-9 bg-background" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>User Profile</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border-2 border-primary/20">
                          <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                            {u.name?.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-bold truncate">{u.name}</span>
                          <span className="text-[10px] text-muted-foreground truncate">{u.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="flex items-center gap-1.5 w-fit border-secondary/20 text-secondary bg-secondary/5">
                        <Shield className="h-3 w-3" /> {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={`cursor-pointer transition-colors ${u.status === 'Active' ? 'bg-green-500 hover:bg-green-600' : 'bg-muted hover:bg-muted/80 text-muted-foreground'}`}
                        onClick={() => toggleStatus(u)}
                      >
                        {u.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => toggleStatus(u)}>
                            <Edit2 className="h-4 w-4 mr-2" /> Change Status
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Key className="h-4 w-4 mr-2" /> Reset Access
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeleteUser(u.id, u.name)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-muted-foreground italic">
                      No users found. Register a new user to populate the directory.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
