
"use client"

import { useState } from "react"
import { Plus, Search, Receipt, DollarSign, Calendar, Truck, CreditCard, Loader2, Trash2, Filter, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useFirestore, useCollection, useMemoFirebase, useUser, addDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase"
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
import { useTranslation } from "@/context/language-context"

const PAYMENT_METHODS = ["Cash", "Bank", "KPay", "WavePay"];

export default function ExpenseEntryPage() {
  const { t } = useTranslation()
  const db = useFirestore()
  const { user } = useUser()
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const [formData, setFormData] = useState({
    materialId: "",
    materialName: "",
    quantity: 0,
    unitPrice: 0,
    vendor: "",
    paymentMethod: "Cash",
    date: new Date().toISOString().split('T')[0],
    description: ""
  })

  // Data Subscriptions
  const materialsRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, "raw_materials");
  }, [db, user]);

  const expensesRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, "expenses");
  }, [db, user]);

  const { data: materials, isLoading: materialsLoading } = useCollection(materialsRef)
  const { data: expenses, isLoading: expensesLoading } = useCollection(expensesRef)

  const handleMaterialSelect = (materialId: string) => {
    const mat = materials?.find(m => m.id === materialId)
    if (mat) {
      setFormData({
        ...formData,
        materialId,
        materialName: mat.name,
        unitPrice: mat.cost || 0
      })
    }
  }

  const handleAddExpense = () => {
    if (!formData.materialName || !expensesRef) return
    
    addDocumentNonBlocking(expensesRef, {
      ...formData,
      totalAmount: formData.quantity * formData.unitPrice,
      createdAt: new Date().toISOString()
    })
    
    setIsAddOpen(false)
    setFormData({
      materialId: "",
      materialName: "",
      quantity: 0,
      unitPrice: 0,
      vendor: "",
      paymentMethod: "Cash",
      date: new Date().toISOString().split('T')[0],
      description: ""
    })
  }

  const handleDelete = (id: string) => {
    deleteDocumentNonBlocking(doc(db, "expenses", id))
  }

  const filtered = expenses?.filter(e => 
    e.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.vendor.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const totalExpense = filtered.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-foreground">{t("expenseEntry")}</h1>
          <p className="text-muted-foreground">Record expenditures linked to material procurement and operations.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">
              <Plus className="h-4 w-4 mr-2" /> New Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="font-headline text-2xl">Record Material Expense</DialogTitle>
              <DialogDescription>Input purchase details for auditing and cost analysis.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Link to Material</Label>
                  <Select onValueChange={handleMaterialSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a material" />
                    </SelectTrigger>
                    <SelectContent>
                      {materials?.map(m => (
                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Date of Purchase</Label>
                  <Input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label>Quantity</Label>
                  <Input type="number" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: Number(e.target.value)})} />
                </div>
                <div className="grid gap-2">
                  <Label>Unit Price (MMK)</Label>
                  <Input type="number" value={formData.unitPrice} onChange={(e) => setFormData({...formData, unitPrice: Number(e.target.value)})} />
                </div>
                <div className="grid gap-2">
                  <Label>Payment Method</Label>
                  <Select value={formData.paymentMethod} onValueChange={(v) => setFormData({...formData, paymentMethod: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Vendor / Supplier</Label>
                <Input placeholder="e.g. Yangon Flour Mills" value={formData.vendor} onChange={(e) => setFormData({...formData, vendor: e.target.value})} />
              </div>

              <div className="grid gap-2">
                <Label>Description (Optional)</Label>
                <Input placeholder="Extra notes..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
              </div>

              <div className="p-4 bg-muted/30 rounded-xl flex items-center justify-between">
                <span className="text-sm font-bold text-muted-foreground uppercase">Estimated Total</span>
                <span className="text-xl font-black text-primary">MMK {(formData.quantity * formData.unitPrice).toLocaleString()}</span>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddExpense} className="w-full bg-secondary text-secondary-foreground font-bold h-12">Save Expense Record</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-primary/5 border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-3 w-3" /> Monthly Spend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black font-headline">MMK {totalExpense.toLocaleString()}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Based on current filter view</p>
          </CardContent>
        </Card>
        <Card className="bg-secondary/5 border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase text-muted-foreground flex items-center gap-2">
              <Receipt className="h-3 w-3" /> Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black font-headline">{filtered.length} Records</div>
            <p className="text-[10px] text-muted-foreground mt-1">Total procurement entries</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="border-b p-4 flex flex-row items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search expenses by material or vendor..." 
              className="pl-9 bg-muted/20" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
             <Button variant="outline" size="sm" className="h-8"><Filter className="h-3 w-3 mr-2" /> Filter</Button>
             <Button variant="outline" size="sm" className="h-8"><FileText className="h-3 w-3 mr-2" /> Export</Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {expensesLoading ? (
            <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Date</TableHead>
                  <TableHead>Material / Details</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.sort((a,b) => b.date.localeCompare(a.date)).map((exp) => (
                  <TableRow key={exp.id}>
                    <TableCell className="font-mono text-[11px]">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-muted-foreground" /> {exp.date}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">{exp.materialName}</span>
                        <span className="text-[10px] text-muted-foreground uppercase">{exp.quantity} units @ MMK {exp.unitPrice.toLocaleString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-2 text-xs">
                         <Truck className="h-3 w-3 text-secondary" />
                         <span>{exp.vendor}</span>
                       </div>
                    </TableCell>
                    <TableCell className="text-right font-black text-primary">
                      MMK {exp.totalAmount?.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] font-bold">
                        <CreditCard className="h-2 w-2 mr-1" /> {exp.paymentMethod}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(exp.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground italic">
                      No expense records found. Record a new procurement above.
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
