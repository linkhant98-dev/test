
"use client"

import { useState } from "react"
import { 
  Plus, 
  Search, 
  FileText, 
  Printer, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Loader2,
  MoreVertical,
  ArrowUpRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useFirestore, useCollection, useMemoFirebase, useUser, addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase"
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
import Link from "next/link"

export default function InvoicesPage() {
  const db = useFirestore()
  const { user } = useUser()
  const [isAddOpen, setIsAddOpen] = useState(false)
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
    items: [{ productName: "", quantity: 1, price: 0 }]
  })

  const handleAddInvoice = () => {
    if (!formData.customerId || !invoicesRef) return
    const customer = customers?.find(c => c.id === formData.customerId)
    
    const invoiceItems = formData.items.map(item => ({
      ...item,
      total: item.quantity * item.price
    }))
    
    const totalAmount = invoiceItems.reduce((acc, curr) => acc + curr.total, 0)
    
    addDocumentNonBlocking(invoicesRef, {
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      customerId: formData.customerId,
      customerName: customer?.name || "Unknown",
      items: invoiceItems,
      totalAmount,
      status: "Draft",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    })
    setIsAddOpen(false)
  }

  const updateStatus = (id: string, newStatus: string) => {
    updateDocumentNonBlocking(doc(db, "invoices", id), { status: newStatus })
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
          <h1 className="text-3xl font-bold font-headline">Invoices</h1>
          <p className="text-muted-foreground">Manage sales billing and payment tracking.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" /> Create Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="font-headline text-2xl">Create New Invoice</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
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
              
              <div className="space-y-4">
                <Label className="font-bold">Line Items</Label>
                {formData.items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-6">
                      <Select onValueChange={(v) => {
                        const product = products?.find(p => p.name === v)
                        const newItems = [...formData.items]
                        newItems[idx] = { ...newItems[idx], productName: v, price: product?.price || 0 }
                        setFormData({...formData, items: newItems})
                      }}>
                        <SelectTrigger><SelectValue placeholder="Product" /></SelectTrigger>
                        <SelectContent>
                          {products?.map(p => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => {
                        const newItems = [...formData.items]
                        newItems[idx].quantity = Number(e.target.value)
                        setFormData({...formData, items: newItems})
                      }} />
                    </div>
                    <div className="col-span-3">
                      <div className="relative">
                        <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                        <Input type="number" className="pl-6" value={item.price} disabled />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddInvoice} className="w-full bg-secondary text-secondary-foreground font-bold">Post Invoice</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm">
           <CardHeader className="pb-2">
             <CardTitle className="text-xs font-bold text-muted-foreground uppercase">Total Receivables</CardTitle>
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">${invoices?.filter(i => i.status !== 'Paid').reduce((acc, curr) => acc + curr.totalAmount, 0).toLocaleString()}</div>
           </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-secondary/10">
           <CardHeader className="pb-2">
             <CardTitle className="text-xs font-bold text-secondary uppercase">Paid Invoices</CardTitle>
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold text-secondary">{invoices?.filter(i => i.status === 'Paid').length || 0}</div>
           </CardContent>
        </Card>
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
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices?.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-mono font-bold text-sm">{inv.invoiceNumber}</TableCell>
                    <TableCell className="font-medium">{inv.customerName}</TableCell>
                    <TableCell className="font-bold">${inv.totalAmount.toLocaleString()}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{inv.dueDate}</TableCell>
                    <TableCell>{getStatusBadge(inv.status)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => updateStatus(inv.id, 'Sent')} disabled={inv.status === 'Sent'}>
                            Mark as Sent
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateStatus(inv.id, 'Paid')} disabled={inv.status === 'Paid'}>
                            Mark as Paid
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/sales/invoices/${inv.id}/print`} className="flex items-center">
                              <Printer className="h-4 w-4 mr-2" /> Print Invoice
                            </Link>
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
    </div>
  )
}
