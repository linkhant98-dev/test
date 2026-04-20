
"use client"

import { useState } from "react"
import { Plus, Search, Calendar, Store, DollarSign, Loader2, Download, Filter, Trash2, Sparkles, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

export default function OutletSalesPage() {
  const db = useFirestore()
  const { user } = useUser()
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isSeeding, setIsSeeding] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const [newSale, setNewOutletSale] = useState({
    outletId: "",
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    transactionsCount: 0
  })

  const outletsRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, "outlets");
  }, [db, user]);

  const salesRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, "outlet_sales");
  }, [db, user]);

  const { data: outlets } = useCollection(outletsRef)
  const { data: sales, isLoading } = useCollection(salesRef)

  const handleAddSale = () => {
    if (!newSale.outletId || !salesRef) return
    const outlet = outlets?.find(o => o.id === newSale.outletId)
    
    addDocumentNonBlocking(salesRef, {
      ...newSale,
      outletName: outlet?.name || "Unknown",
      amount: Number(newSale.amount),
      transactionsCount: Number(newSale.transactionsCount),
      recordedBy: user?.email || "System",
      createdAt: new Date().toISOString()
    })
    setIsAddOpen(false)
    setNewOutletSale({ outletId: "", date: new Date().toISOString().split('T')[0], amount: 0, transactionsCount: 0 })
  }

  const handleDelete = (id: string) => {
    deleteDocumentNonBlocking(doc(db, "outlet_sales", id))
  }

  const seedMockSales = async () => {
    if (!outlets || outlets.length === 0 || !salesRef) return
    setIsSeeding(true)
    
    const dates = [
      new Date(Date.now() - 86400000).toISOString().split('T')[0],
      new Date(Date.now() - 172800000).toISOString().split('T')[0],
      new Date(Date.now() - 259200000).toISOString().split('T')[0]
    ]

    for (const outlet of outlets) {
      for (const date of dates) {
        await addDocumentNonBlocking(salesRef, {
          outletId: outlet.id,
          outletName: outlet.name,
          date: date,
          amount: Math.floor(Math.random() * 500000) + 100000,
          transactionsCount: Math.floor(Math.random() * 50) + 10,
          recordedBy: "Import Utility",
          createdAt: new Date().toISOString()
        })
      }
    }
    setIsSeeding(false)
  }

  const filtered = sales?.filter(s => 
    s.outletName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.date.includes(searchTerm)
  ) || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Outlet Sales Entry</h1>
          <p className="text-muted-foreground">Record daily revenue summaries from retail locations (MMK).</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={seedMockSales} disabled={isSeeding || !outlets?.length}>
            {isSeeding ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Mock Import Data
          </Button>

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" /> Key-in Daily Sales
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-headline text-2xl">Daily Sales Entry</DialogTitle>
                <DialogDescription>Record total revenue for a specific branch and date.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Target Outlet</Label>
                  <Select onValueChange={(v) => setNewOutletSale({...newSale, outletId: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an outlet" />
                    </SelectTrigger>
                    <SelectContent>
                      {outlets?.map(o => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Transaction Date</Label>
                  <Input type="date" value={newSale.date} onChange={(e) => setNewOutletSale({...newSale, date: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Total Amount (MMK)</Label>
                    <Input type="number" value={newSale.amount} onChange={(e) => setNewOutletSale({...newSale, amount: Number(e.target.value)})} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Transactions Count</Label>
                    <Input type="number" value={newSale.transactionsCount} onChange={(e) => setNewOutletSale({...newSale, transactionsCount: Number(e.target.value)})} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddSale} className="w-full bg-secondary text-secondary-foreground font-bold">Post Daily Summary</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="p-4 border-b flex flex-row items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by outlet or date..." 
              className="pl-9 bg-muted/20" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
             <Button variant="ghost" size="icon"><Filter className="h-4 w-4" /></Button>
             <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Date</TableHead>
                  <TableHead>Outlet</TableHead>
                  <TableHead className="text-right">Total Amount</TableHead>
                  <TableHead className="text-center">Txns</TableHead>
                  <TableHead>Recorded By</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.sort((a,b) => b.date.localeCompare(a.date)).map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <Calendar className="h-3 w-3 text-primary" /> {s.date}
                      </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-2">
                         <Store className="h-3.5 w-3.5 text-secondary" />
                         <span className="font-bold text-sm">{s.outletName}</span>
                       </div>
                    </TableCell>
                    <TableCell className="text-right font-bold text-primary">
                      MMK {s.amount?.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="bg-muted/50">{s.transactionsCount}</Badge>
                    </TableCell>
                    <TableCell className="text-[10px] text-muted-foreground italic">
                      {s.recordedBy}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(s.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground italic">
                      No outlet sales records found. Add some outlets first, then record sales.
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
