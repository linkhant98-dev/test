
"use client"

import { useState } from "react"
import { 
  ArrowRightLeft, 
  Plus, 
  Search, 
  Truck, 
  History, 
  CheckCircle2, 
  Loader2, 
  Minus, 
  Save,
  MapPin,
  Warehouse
} from "lucide-react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useFirestore, useCollection, useMemoFirebase, useUser, addDocumentNonBlocking } from "@/firebase"
import { collection } from "firebase/firestore"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function StockTransferPage() {
  const db = useFirestore()
  const { user } = useUser()
  const [isAddOpen, setIsAddOpen] = useState(false)

  // Data Subscriptions
  const warehousesRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, "warehouses");
  }, [db, user]);

  const outletsRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, "outlets");
  }, [db, user]);

  const productsRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, "finished_goods");
  }, [db, user]);

  const transfersRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, "stock_transfers");
  }, [db, user]);

  const { data: warehouses } = useCollection(warehousesRef)
  const { data: outlets } = useCollection(outletsRef)
  const { data: products } = useCollection(productsRef)
  const { data: transfers, isLoading: transfersLoading } = useCollection(transfersRef)

  const [formData, setFormData] = useState({
    sourceWarehouseId: "",
    destinationOutletId: "",
    notes: "",
    items: [{ productId: "", productName: "", quantity: 1 }]
  })

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productId: "", productName: "", quantity: 1 }]
    })
  }

  const handleRemoveItem = (index: number) => {
    if (formData.items.length <= 1) return
    const newItems = formData.items.filter((_, i) => i !== index)
    setFormData({ ...formData, items: newItems })
  }

  const handleProductSelect = (productId: string, index: number) => {
    const product = products?.find(p => p.id === productId)
    const newItems = [...formData.items]
    newItems[index] = { 
      ...newItems[index], 
      productId, 
      productName: product?.name || "" 
    }
    setFormData({ ...formData, items: newItems })
  }

  const handleQtyChange = (val: number, index: number) => {
    const newItems = [...formData.items]
    newItems[index] = { ...newItems[index], quantity: val }
    setFormData({ ...formData, items: newItems })
  }

  const handleProcessTransfer = () => {
    if (!formData.sourceWarehouseId || !formData.destinationOutletId || !transfersRef) return
    
    const source = warehouses?.find(w => w.id === formData.sourceWarehouseId)
    const dest = outlets?.find(o => o.id === formData.destinationOutletId)

    addDocumentNonBlocking(transfersRef, {
      ...formData,
      sourceName: source?.name || "Unknown Warehouse",
      destinationName: dest?.name || "Unknown Outlet",
      status: "Completed",
      recordedBy: user?.email || "System",
      timestamp: new Date().toISOString()
    })

    setIsAddOpen(false)
    setFormData({
      sourceWarehouseId: "",
      destinationOutletId: "",
      notes: "",
      items: [{ productId: "", productName: "", quantity: 1 }]
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-foreground">Stock Transfers</h1>
          <p className="text-muted-foreground">Distribute finished goods from main locations to retail outlets.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg">
              <ArrowRightLeft className="h-4 w-4 mr-2" /> New Transfer
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-headline text-2xl">Process Stock Transfer</DialogTitle>
              <DialogDescription>Record movement of snacks between business locations.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Source (Main Warehouse)</Label>
                  <Select onValueChange={(v) => setFormData({...formData, sourceWarehouseId: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select warehouse" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses?.map(w => (
                        <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Destination (Retail Outlet)</Label>
                  <Select onValueChange={(v) => setFormData({...formData, destinationOutletId: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select outlet" />
                    </SelectTrigger>
                    <SelectContent>
                      {outlets?.map(o => (
                        <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground">Transfer Items</Label>
                  <Button variant="outline" size="sm" onClick={handleAddItem}>
                    <Plus className="h-3 w-3 mr-1" /> Add Product
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {formData.items.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center bg-muted/20 p-2 rounded-lg group">
                      <div className="flex-1">
                        <Select onValueChange={(v) => handleProductSelect(v, idx)}>
                          <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                          <SelectContent>
                            {products?.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-32">
                        <Input 
                          type="number" 
                          placeholder="Qty" 
                          value={item.quantity} 
                          onChange={(e) => handleQtyChange(Number(e.target.value), idx)}
                        />
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveItem(idx)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Notes / Reference</Label>
                <Input placeholder="e.g. Delivery Truck #05, Weekly Restock" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleProcessTransfer} className="w-full bg-secondary text-secondary-foreground font-bold h-12">
                <CheckCircle2 className="h-4 w-4 mr-2" /> Complete Transfer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="border-b bg-muted/10">
              <CardTitle className="text-lg font-headline flex items-center gap-2">
                <History className="h-5 w-5 text-primary" /> Transfer Log
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {transfersLoading ? (
                <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Date / Reference</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transfers?.sort((a,b) => b.timestamp.localeCompare(a.timestamp)).map((t) => (
                      <TableRow key={t.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-xs font-mono font-bold">{new Date(t.timestamp).toLocaleString()}</span>
                            <span className="text-[10px] text-muted-foreground uppercase">{t.notes || 'No reference'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-xs font-medium">
                            <span className="flex items-center gap-1"><Warehouse className="h-3 w-3 text-primary" /> {t.sourceName}</span>
                            <ArrowRightLeft className="h-3 w-3 text-muted-foreground" />
                            <span className="flex items-center gap-1 text-secondary"><MapPin className="h-3 w-3" /> {t.destinationName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {t.items?.map((item: any, i: number) => (
                              <Badge key={i} variant="outline" className="text-[9px] bg-muted/50">
                                {item.productName} ({item.quantity})
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-50 text-green-700 border-green-200">
                            {t.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {transfers?.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-12 text-muted-foreground italic">
                          No stock transfers found. Start by processing a restock above.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-accent/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Logistics Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Monthly Runs</span>
                <span className="text-xl font-bold">{transfers?.length || 0}</span>
              </div>
              <div className="pt-4 border-t">
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Real-time stock movement tracking ensures retail branches maintain optimal snack availability.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-secondary/5 border-secondary/10">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Truck className="h-4 w-4 text-secondary" /> Fleet Status
              </CardTitle>
            </CardHeader>
            <CardContent>
               <div className="p-3 rounded-xl bg-white border shadow-sm">
                 <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Active Deliveries</div>
                 <div className="text-lg font-black text-secondary">0 In Transit</div>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
