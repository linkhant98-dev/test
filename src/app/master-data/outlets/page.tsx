
"use client"

import { useState } from "react"
import { Plus, Search, Store, MapPin, User, Phone, MoreVertical, Edit2, Trash2, Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useFirestore, useCollection, useMemoFirebase, useUser, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function OutletsPage() {
  const db = useFirestore()
  const { user } = useUser()
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingOutlet, setEditingOutlet] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const [newOutlet, setNewOutlet] = useState({
    name: "",
    location: "",
    manager: "",
    phone: "",
    status: "Active"
  })

  const outletsRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, "outlets");
  }, [db, user]);

  const { data: outlets, isLoading } = useCollection(outletsRef)

  const handleAddOutlet = () => {
    if (!newOutlet.name || !outletsRef) return
    addDocumentNonBlocking(outletsRef, {
      ...newOutlet,
      createdAt: new Date().toISOString()
    })
    setIsAddOpen(false)
    setNewOutlet({ name: "", location: "", manager: "", phone: "", status: "Active" })
  }

  const handleUpdateOutlet = () => {
    if (!editingOutlet || !db) return
    const docRef = doc(db, "outlets", editingOutlet.id)
    updateDocumentNonBlocking(docRef, {
      name: editingOutlet.name,
      location: editingOutlet.location,
      manager: editingOutlet.manager,
      phone: editingOutlet.phone,
      status: editingOutlet.status
    })
    setIsEditOpen(false)
    setEditingOutlet(null)
  }

  const handleDelete = (id: string) => {
    deleteDocumentNonBlocking(doc(db, "outlets", id))
  }

  const filtered = outlets?.filter(o => 
    o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.location.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline">Outlet Master</h1>
          <p className="text-muted-foreground">Manage retail branches and operational locations.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" /> Add Outlet
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-headline text-2xl">New Outlet Profile</DialogTitle>
              <DialogDescription>Define a new physical retail location.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Outlet Name</Label>
                <Input value={newOutlet.name} onChange={(e) => setNewOutlet({...newOutlet, name: e.target.value})} placeholder="e.g. Junction City Branch" />
              </div>
              <div className="grid gap-2">
                <Label>Location / Address</Label>
                <Input value={newOutlet.location} onChange={(e) => setNewOutlet({...newOutlet, location: e.target.value})} placeholder="Full address" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Manager Name</Label>
                  <Input value={newOutlet.manager} onChange={(e) => setNewOutlet({...newOutlet, manager: e.target.value})} />
                </div>
                <div className="grid gap-2">
                  <Label>Phone Number</Label>
                  <Input value={newOutlet.phone} onChange={(e) => setNewOutlet({...newOutlet, phone: e.target.value})} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddOutlet} className="w-full bg-secondary text-secondary-foreground font-bold">Save Outlet</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search outlets by name or location..." 
              className="pl-9 bg-muted/20" 
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
                  <TableHead>Outlet Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                          <Store className="h-5 w-5" />
                        </div>
                        <span className="font-bold text-sm">{o.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {o.location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-[11px]">
                        <div className="flex items-center gap-1.5 font-medium"><User className="h-3 w-3" /> {o.manager}</div>
                        <div className="flex items-center gap-1.5 text-muted-foreground"><Phone className="h-3 w-3" /> {o.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={o.status === 'Active' ? 'bg-secondary' : 'bg-muted'}>{o.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setEditingOutlet(o); setIsEditOpen(true); }}>
                            <Edit2 className="h-4 w-4 mr-2" /> Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(o.id)}>
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">Edit Outlet</DialogTitle>
          </DialogHeader>
          {editingOutlet && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Outlet Name</Label>
                <Input value={editingOutlet.name} onChange={(e) => setEditingOutlet({...editingOutlet, name: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label>Location</Label>
                <Input value={editingOutlet.location} onChange={(e) => setEditingOutlet({...editingOutlet, location: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Manager</Label>
                  <Input value={editingOutlet.manager} onChange={(e) => setEditingOutlet({...editingOutlet, manager: e.target.value})} />
                </div>
                <div className="grid gap-2">
                  <Label>Phone</Label>
                  <Input value={editingOutlet.phone} onChange={(e) => setEditingOutlet({...editingOutlet, phone: e.target.value})} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select value={editingOutlet.status} onValueChange={(v) => setEditingOutlet({...editingOutlet, status: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleUpdateOutlet} className="w-full bg-secondary text-secondary-foreground font-bold">
              <Save className="h-4 w-4 mr-2" /> Update Outlet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
