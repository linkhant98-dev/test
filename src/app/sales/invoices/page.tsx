
"use client"

import { useState } from "react"
import { 
  Plus, 
  Search, 
  FileText, 
  Printer, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Loader2,
  MoreVertical,
  ArrowUpRight,
  Edit2,
  Save,
  Trash2,
  Minus,
  CreditCard
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useFirebase, useFirestore, useCollection, useMemoFirebase, useUser, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase"
import { collection, doc, getDocs, query, where } from "firebase/firestore"
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
import Link from "next/link"

const PAYMENT_METHODS = ["Cash", "Bank", "KPay", "WavePay"];

export default function InvoicesPage() {
  const { firestore: db } = useFirebase()
  const { user } = useUser()
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const invoicesRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, "invoices");
  }, [db, user]);

  const customersRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, "customers");
  }, [db, user]);

  const productsRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, "finished_goods");
  }, [db, user]);

  const { data: invoices, isLoading } = useCollection(invoicesRef)
  const { data: customers } = useCollection(customersRef)
  const { data: products } = useCollection(productsRef)

  const [formData, setFormData] = useState({
    customerId: "",
    paymentMethod: "Cash",
    items: [{ productName: "", quantity: 1, price: 0, unit: "Units" }]
  })

  const calculateTotal = (items: any[]) => {
    return items.reduce((acc, curr) => acc + (curr.quantity * curr.price), 0)
  }

  const handleAddLine = (isEdit: boolean = false) => {
    const newItem = { productName: "", quantity: 1, price: 0, unit: "Units" }
    if (isEdit) {
      setEditingInvoice({
        ...editingInvoice,
        items: [...editingInvoice.items, newItem]
      })
    } else {
      setFormData({
        ...formData,
        items: [...formData.items, newItem]
      })
    }
  }

  const handleRemoveLine = (index: number, isEdit: boolean = false) => {
    if (isEdit) {
      if (editingInvoice.items.length <= 1) return
      const newItems = editingInvoice.items.filter((_: any, i: number) => i !== index)
      setEditingInvoice({ ...editingInvoice, items: newItems })
    } else {
      if (formData.items.length <= 1) return
      const newItems = formData.items.filter((_, i) => i !== index)
      setFormData({ ...formData, items: newItems })
    }
  }

  // Enhanced Price Lookup Logic
  const fetchBestPrice = async (productId: string, customerType: string) => {
    const product = products?.find(p => p.id === productId);
    let bestPrice = product?.price || 0;

    // Check for specific price rules for this customer type and current date
    const rulesRef = collection(db, "finished_goods", productId, "price_rules");
    const today = new Date().toISOString().split('T')[0];
    
    try {
      const q = query(
        rulesRef, 
        where("customerType", "==", customerType),
        where("validFrom", "<=", today)
      );
      
      const snapshot = await getDocs(q);
      const activeRules = snapshot.docs
        .map(d => d.data())
        .filter(r => r.validTo >= today);

      if (activeRules.length > 0) {
        // Use the rule price (if multiple, pick the most recent or lowest, but for MVP just pick first)
        bestPrice = activeRules[0].price;
      }
    } catch (e) {
      console.error("Price lookup error:", e);
    }

    return bestPrice;
  };

  const handleProductSelect = async (val: string, index: number, isEdit: boolean = false) => {
    const product = products?.find(p => p.name === val);
    const customerId = isEdit ? editingInvoice.customerId : formData.customerId;
    const customer = customers?.find(c => c.id === customerId);
    
    if (!product) return;

    // Async lookup for tiered pricing
    const resolvedPrice = await fetchBestPrice(product.id, customer?.customerType || "Retailer");

    if (isEdit) {
      const newItems = [...editingInvoice.items]
      newItems[index] = { 
        ...newItems[index], 
        productName: val, 
        price: resolvedPrice,
        unit: product?.unit || "Units" 
      }
      setEditingInvoice({ ...editingInvoice, items: newItems })
    } else {
      const newItems = [...formData.items]
      newItems[index] = { 
        ...newItems[index], 
        productName: val, 
        price: resolvedPrice,
        unit: product?.unit || "Units" 
      }
      setFormData({ ...formData, items: newItems })
    }
  }

  const handleItemChange = (field: string, val: any, index: number, isEdit: boolean = false) => {
    if (isEdit) {
      const newItems = [...editingInvoice.items]
      newItems[index] = { ...newItems[index], [field]: val }
      setEditingInvoice({ ...editingInvoice, items: newItems })
    } else {
      const newItems = [...formData.items]
      newItems[index] = { ...newItems[index], [field]: val }
      setFormData({ ...formData, items: newItems })
    }
  }

  const handleAddInvoice = () => {
    if (!formData.customerId || !invoicesRef) return
    const customer = customers?.find(c => c.id === formData.customerId)
    
    const invoiceItems = formData.items.map(item => ({
      ...item,
      total: item.quantity * item.price
    }))
    
    const totalAmount = calculateTotal(invoiceItems)
    
    addDocumentNonBlocking(invoicesRef, {
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      customerId: formData.customerId,
      customerName: customer?.name || "Unknown",
      paymentMethod: formData.paymentMethod,
      items: invoiceItems,
      totalAmount,
      status: "Draft",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    })
    setIsAddOpen(false)
    setFormData({ customerId: "", paymentMethod: "Cash", items: [{ productName: "", quantity: 1, price: 0, unit: "Units" }] })
  }

  const handleUpdateInvoice = () => {
    if (!editingInvoice || !db) return
    const updatedItems = editingInvoice.items.map((item: any) => ({
      ...item,
      total: item.quantity * item.price
    }))
    const totalAmount = calculateTotal(updatedItems)
    
    const docRef = doc(db, "invoices", editingInvoice.id)
    updateDocumentNonBlocking(docRef, {
      paymentMethod: editingInvoice.paymentMethod,
      items: updatedItems,
      totalAmount,
      dueDate: editingInvoice.dueDate
    })
    setIsEditOpen(false)
    setEditingInvoice(null)
  }

  const updateStatus = (id: string, newStatus: string) => {
    updateDocumentNonBlocking(doc(db, "invoices", id), { status: newStatus })
  }

  const handleDelete = (id: string) => {
    deleteDocumentNonBlocking(doc(db, "invoices", id))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid': return <Badge className="bg-secondary"><CheckCircle2 className="h-3 w-3 mr-1" /> Paid</Badge>
      case 'Sent': return <Badge variant="outline" className="border-primary text-primary"><ArrowUpRight className="h-3 w-3 mr-1" /> Sent</Badge>
      case 'Overdue': return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" /> Overdue</Badge>
      default: return <Badge variant="outline" className="opacity-60"><Clock className="h-3 w-3 mr-1" /> Draft</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline">Sales Invoices</h1>
          <p className="text-muted-foreground">Manage multi-item billing and tiered price lookups (MMK).</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" /> Create Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-headline text-2xl">Create New Invoice</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Bill To Customer</Label>
                  <Select onValueChange={(v) => setFormData({...formData, customerId: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Payment Method</Label>
                  <Select 
                    defaultValue={formData.paymentMethod} 
                    onValueChange={(v) => setFormData({...formData, paymentMethod: v})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map(method => (
                        <SelectItem key={method} value={method}>{method}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="font-bold">Line Items</Label>
                  <Button variant="outline" size="sm" onClick={() => handleAddLine(false)}>
                    <Plus className="h-3 w-3 mr-1" /> Add Line
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {formData.items.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-muted/20 p-2 rounded-lg relative group">
                      <div className="col-span-4">
                        <Select onValueChange={(v) => handleProductSelect(v, idx, false)}>
                          <SelectTrigger><SelectValue placeholder="Product" /></SelectTrigger>
                          <SelectContent>
                            {products?.map(p => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <Input 
                          type="number" 
                          placeholder="Qty"
                          value={item.quantity} 
                          onChange={(e) => handleItemChange("quantity", Number(e.target.value), idx, false)} 
                        />
                      </div>
                      <div className="col-span-2">
                        <Input 
                          placeholder="Unit"
                          value={item.unit} 
                          onChange={(e) => handleItemChange("unit", e.target.value, idx, false)} 
                        />
                      </div>
                      <div className="col-span-2">
                        <Input 
                          type="number" 
                          placeholder="Price"
                          value={item.price} 
                          onChange={(e) => handleItemChange("price", Number(e.target.value), idx, false)} 
                        />
                      </div>
                      <div className="col-span-1 text-right font-mono text-sm font-bold">
                        {(item.quantity * item.price).toLocaleString()}
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveLine(idx, false)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <div className="text-right">
                  <span className="text-xs text-muted-foreground uppercase font-bold tracking-widest block">Total Invoice Amount (MMK)</span>
                  <span className="text-2xl font-black text-primary">MMK {calculateTotal(formData.items).toLocaleString()}</span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddInvoice} className="w-full bg-secondary text-secondary-foreground font-bold h-12">Post & Save Invoice</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices?.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-mono font-bold">{inv.invoiceNumber}</TableCell>
                    <TableCell className="font-medium">{inv.customerName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">{inv.items?.length || 0} Lines</Badge>
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                         <CreditCard className="h-3 w-3" /> {inv.paymentMethod}
                       </div>
                    </TableCell>
                    <TableCell className="font-bold">MMK {inv.totalAmount.toLocaleString()}</TableCell>
                    <TableCell>{getStatusBadge(inv.status)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setEditingInvoice({...inv}); setIsEditOpen(true); }}>
                            <Edit2 className="h-4 w-4 mr-2" /> Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => updateStatus(inv.id, 'Sent')} disabled={inv.status === 'Sent'}>
                            <ArrowUpRight className="h-4 w-4 mr-2" /> Mark as Sent
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateStatus(inv.id, 'Paid')} disabled={inv.status === 'Paid'}>
                            <CheckCircle2 className="h-4 w-4 mr-2" /> Mark as Paid
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/sales/invoices/${inv.id}/print`} className="flex items-center">
                              <Printer className="h-4 w-4 mr-2" /> Print Invoice
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(inv.id)}>
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
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl">Edit Invoice {editingInvoice?.invoiceNumber}</DialogTitle>
          </DialogHeader>
          {editingInvoice && (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Bill To</Label>
                  <Input value={editingInvoice.customerName} disabled />
                </div>
                <div className="grid gap-2">
                  <Label>Payment Method</Label>
                  <Select 
                    value={editingInvoice.paymentMethod} 
                    onValueChange={(v) => setEditingInvoice({...editingInvoice, paymentMethod: v})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map(method => (
                        <SelectItem key={method} value={method}>{method}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="font-bold">Line Items</Label>
                  <Button variant="outline" size="sm" onClick={() => handleAddLine(true)}>
                    <Plus className="h-3 w-3 mr-1" /> Add Line
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {editingInvoice.items.map((item: any, idx: number) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-muted/20 p-2 rounded-lg relative group">
                      <div className="col-span-4">
                        <Select value={item.productName} onValueChange={(v) => handleProductSelect(v, idx, true)}>
                          <SelectTrigger><SelectValue placeholder="Product" /></SelectTrigger>
                          <SelectContent>
                            {products?.map(p => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <Input 
                          type="number" 
                          value={item.quantity} 
                          onChange={(e) => handleItemChange("quantity", Number(e.target.value), idx, true)} 
                        />
                      </div>
                      <div className="col-span-2">
                        <Input 
                          value={item.unit} 
                          onChange={(e) => handleItemChange("unit", e.target.value, idx, true)} 
                        />
                      </div>
                      <div className="col-span-2">
                        <Input 
                          type="number" 
                          value={item.price} 
                          onChange={(e) => handleItemChange("price", Number(e.target.value), idx, true)} 
                        />
                      </div>
                      <div className="col-span-1 text-right font-mono text-sm font-bold">
                        {(item.quantity * item.price).toLocaleString()}
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveLine(idx, true)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <div className="text-right">
                  <span className="text-xs text-muted-foreground uppercase font-bold tracking-widest block">Updated Total (MMK)</span>
                  <span className="text-2xl font-black text-primary">MMK {calculateTotal(editingInvoice.items).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleUpdateInvoice} className="w-full bg-secondary text-secondary-foreground font-bold h-12">
              <Save className="h-4 w-4 mr-2" /> Update & Save Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
