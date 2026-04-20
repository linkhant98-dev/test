
"use client"

import { useState } from "react"
import { Plus, Search, User, Mail, Phone, MapPin, Loader2, MoreVertical, Edit2, Trash2, Save, Globe, Landmark, CreditCard, Shield, Clock, Hash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export default function CustomersPage() {
  const db = useFirestore()
  const { user } = useUser()
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [newCustomer, setNewCustomer] = useState({
    code: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    customerType: "Retailer",
    customerClass: "Grade B",
    taxId: "",
    creditLimit: 0,
    paymentTerms: "Net 15",
    website: ""
  })

  const customersRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, "customers");
  }, [db, user]);

  const { data: customers, isLoading } = useCollection(customersRef)

  const handleAddCustomer = () => {
    if (!newCustomer.name || !customersRef) return
    addDocumentNonBlocking(customersRef, {
      ...newCustomer,
      createdAt: new Date().toISOString()
    })
    setIsAddOpen(false)
    setNewCustomer({ 
      code: "", name: "", email: "", phone: "", address: "", 
      customerType: "Retailer", customerClass: "Grade B",
      taxId: "", creditLimit: 0, paymentTerms: "Net 15", website: ""
    })
  }

  const handleUpdateCustomer = () => {
    if (!editingCustomer || !db) return
    const docRef = doc(db, "customers", editingCustomer.id)
    updateDocumentNonBlocking(docRef, {
      code: editingCustomer.code,
      name: editingCustomer.name,
      email: editingCustomer.email,
      phone: editingCustomer.phone,
      address: editingCustomer.address,
      customerType: editingCustomer.customerType,
      customerClass: editingCustomer.customerClass,
      taxId: editingCustomer.taxId,
      creditLimit: Number(editingCustomer.creditLimit),
      paymentTerms: editingCustomer.paymentTerms,
      website: editingCustomer.website
    })
    setIsEditOpen(false)
    setEditingCustomer(null)
  }

  const handleDelete = (id: string) => {
    deleteDocumentNonBlocking(doc(db, "customers", id))
  }

  const filtered = customers?.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.code && c.code.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || []

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline text-foreground">Customer Master</h1>
          <p className="text-muted-foreground">Manage client directory, classifications, and credit policies (MMK).</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">
              <Plus className="h-4 w-4 mr-2" /> Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle className="font-headline text-2xl">New Customer Profile</DialogTitle>
              <DialogDescription>Add a new business or individual customer with formal data.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Customer Code</Label>
                  <Input value={newCustomer.code} onChange={(e) => setNewCustomer({...newCustomer, code: e.target.value.toUpperCase()})} placeholder="e.g. CUST-001" />
                </div>
                <div className="grid gap-2">
                  <Label>Full Name / Company</Label>
                  <Input value={newCustomer.name} onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})} placeholder="e.g. City Mart Snacks" />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label>Customer Type</Label>
                  <Select onValueChange={(v) => setNewCustomer({...newCustomer, customerType: v})} defaultValue={newCustomer.customerType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Retailer">Retailer</SelectItem>
                      <SelectItem value="Wholesaler">Wholesaler</SelectItem>
                      <SelectItem value="Distributor">Distributor</SelectItem>
                      <SelectItem value="Corporate">Corporate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Classification</Label>
                  <Select onValueChange={(v) => setNewCustomer({...newCustomer, customerClass: v})} defaultValue={newCustomer.customerClass}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VIP">VIP</SelectItem>
                      <SelectItem value="Grade A">Grade A</SelectItem>
                      <SelectItem value="Grade B">Grade B</SelectItem>
                      <SelectItem value="Grade C">Grade C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Payment Terms</Label>
                  <Select onValueChange={(v) => setNewCustomer({...newCustomer, paymentTerms: v})} defaultValue={newCustomer.paymentTerms}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COD">COD (Cash on Delivery)</SelectItem>
                      <SelectItem value="Net 7">Net 7 Days</SelectItem>
                      <SelectItem value="Net 15">Net 15 Days</SelectItem>
                      <SelectItem value="Net 30">Net 30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Email Address</Label>
                  <Input value={newCustomer.email} onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})} placeholder="contact@email.com" />
                </div>
                <div className="grid gap-2">
                  <Label>Phone Number</Label>
                  <Input value={newCustomer.phone} onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})} placeholder="+95 9..." />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Website</Label>
                  <Input value={newCustomer.website} onChange={(e) => setNewCustomer({...newCustomer, website: e.target.value})} placeholder="https://..." />
                </div>
                <div className="grid gap-2">
                  <Label>Credit Limit (MMK)</Label>
                  <Input type="number" value={newCustomer.creditLimit} onChange={(e) => setNewCustomer({...newCustomer, creditLimit: Number(e.target.value)})} />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Tax ID / Reg Number</Label>
                <Input value={newCustomer.taxId} onChange={(e) => setNewCustomer({...newCustomer, taxId: e.target.value})} placeholder="VAT-123456" />
              </div>

              <div className="grid gap-2">
                <Label>Shipping Address</Label>
                <Input value={newCustomer.address} onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})} placeholder="Full physical address" />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddCustomer} className="w-full bg-secondary text-secondary-foreground font-bold">Save Customer Profile</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name, code, email, or tax ID..." className="pl-9 bg-muted/20" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Code</TableHead>
                  <TableHead>Customer / Type</TableHead>
                  <TableHead>Classification</TableHead>
                  <TableHead>Financials</TableHead>
                  <TableHead>Contact Info</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-xs font-bold text-secondary">
                      {c.code || <span className="text-muted-foreground italic">N/A</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                          {c.name[0]}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">{c.name}</span>
                          <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{c.customerType}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] font-bold ${c.customerClass === 'VIP' ? 'bg-amber-50 text-amber-600 border-amber-200' : ''}`}>
                        {c.customerClass}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-[11px]">
                        <div className="flex items-center gap-1.5 font-bold"><CreditCard className="h-3 w-3" /> Limit: MMK {c.creditLimit?.toLocaleString()}</div>
                        <div className="flex items-center gap-1.5 text-muted-foreground"><Clock className="h-3 w-3" /> Terms: {c.paymentTerms}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-[10px] text-muted-foreground">
                        <div className="flex items-center gap-1.5"><Mail className="h-2.5 w-2.5" /> {c.email}</div>
                        <div className="flex items-center gap-1.5"><Phone className="h-2.5 w-2.5" /> {c.phone}</div>
                        {c.website && <div className="flex items-center gap-1.5"><Globe className="h-2.5 w-2.5" /> {c.website}</div>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setEditingCustomer(c); setIsEditOpen(true); }}>
                            <Edit2 className="h-4 w-4 mr-2" /> Edit Info
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(c.id)}>
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
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">Edit Customer Profile</DialogTitle>
            <DialogDescription>Update identification and formal data for {editingCustomer?.name}.</DialogDescription>
          </DialogHeader>
          {editingCustomer && (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Customer Code</Label>
                  <Input value={editingCustomer.code} onChange={(e) => setEditingCustomer({...editingCustomer, code: e.target.value.toUpperCase()})} />
                </div>
                <div className="grid gap-2">
                  <Label>Customer Name</Label>
                  <Input value={editingCustomer.name} onChange={(e) => setEditingCustomer({...editingCustomer, name: e.target.value})} />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label>Customer Type</Label>
                  <Select onValueChange={(v) => setEditingCustomer({...editingCustomer, customerType: v})} defaultValue={editingCustomer.customerType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Retailer">Retailer</SelectItem>
                      <SelectItem value="Wholesaler">Wholesaler</SelectItem>
                      <SelectItem value="Distributor">Distributor</SelectItem>
                      <SelectItem value="Corporate">Corporate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Classification</Label>
                  <Select onValueChange={(v) => setEditingCustomer({...editingCustomer, customerClass: v})} defaultValue={editingCustomer.customerClass}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VIP">VIP</SelectItem>
                      <SelectItem value="Grade A">Grade A</SelectItem>
                      <SelectItem value="Grade B">Grade B</SelectItem>
                      <SelectItem value="Grade C">Grade C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Payment Terms</Label>
                  <Select onValueChange={(v) => setEditingCustomer({...editingCustomer, paymentTerms: v})} defaultValue={editingCustomer.paymentTerms}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COD">COD</SelectItem>
                      <SelectItem value="Net 7">Net 7</SelectItem>
                      <SelectItem value="Net 15">Net 15</SelectItem>
                      <SelectItem value="Net 30">Net 30</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input value={editingCustomer.email} onChange={(e) => setEditingCustomer({...editingCustomer, email: e.target.value})} />
                </div>
                <div className="grid gap-2">
                  <Label>Phone</Label>
                  <Input value={editingCustomer.phone} onChange={(e) => setEditingCustomer({...editingCustomer, phone: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Website</Label>
                  <Input value={editingCustomer.website} onChange={(e) => setEditingCustomer({...editingCustomer, website: e.target.value})} />
                </div>
                <div className="grid gap-2">
                  <Label>Credit Limit (MMK)</Label>
                  <Input type="number" value={editingCustomer.creditLimit} onChange={(e) => setEditingCustomer({...editingCustomer, creditLimit: Number(e.target.value)})} />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Address</Label>
                <Input value={editingCustomer.address} onChange={(e) => setEditingCustomer({...editingCustomer, address: e.target.value})} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleUpdateCustomer} className="w-full bg-secondary text-secondary-foreground font-bold">
              <Save className="h-4 w-4 mr-2" /> Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
