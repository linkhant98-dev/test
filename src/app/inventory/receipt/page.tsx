
"use client"

import { useState } from "react"
import { FileDown, Plus, Search, ArrowRightLeft, Calendar, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

export default function GoodsReceiptPage() {
  const db = useFirestore()
  const { user } = useUser()

  const warehousesRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, "warehouses");
  }, [db, user]);

  const { data: warehouses, isLoading: warehousesLoading } = useCollection(warehousesRef)
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(null)

  const transactionsRef = useMemoFirebase(() => {
    if (!user || !selectedWarehouseId) return null;
    return collection(db, "warehouses", selectedWarehouseId, "stock_transactions");
  }, [db, user, selectedWarehouseId]);

  const { data: transactions, isLoading: transactionsLoading } = useCollection(transactionsRef)

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newReceipt, setNewReceipt] = useState({
    vendor: "",
    material: "Mozzarella Cheese",
    quantity: 0,
    warehouseId: ""
  })

  const handleAddReceipt = () => {
    if (!newReceipt.warehouseId || !db) return
    const colRef = collection(db, "warehouses", newReceipt.warehouseId, "stock_transactions")
    addDocumentNonBlocking(colRef, {
      type: "RECEIPT",
      vendor: newReceipt.vendor,
      materialName: newReceipt.material,
      quantity: Number(newReceipt.quantity),
      status: "Verified",
      timestamp: new Date().toISOString()
    })
    setIsAddOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-foreground">Goods Receipt</h1>
          <p className="text-muted-foreground">Record incoming shipments and update material stock levels.</p>
        </div>
        
        <div className="flex gap-2">
          <Select onValueChange={setSelectedWarehouseId} value={selectedWarehouseId || undefined}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Warehouse" />
            </SelectTrigger>
            <SelectContent>
              {warehouses?.map(w => (
                <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">
                <Plus className="h-4 w-4 mr-2" /> New Receipt
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="font-headline text-2xl">New Goods Receipt</DialogTitle>
                <DialogDescription>Record materials received from a vendor.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Destination Warehouse</Label>
                  <Select onValueChange={(v) => setNewReceipt({...newReceipt, warehouseId: v})}>
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
                  <Label htmlFor="vendor">Vendor Name</Label>
                  <Input 
                    id="vendor" 
                    placeholder="e.g. Dairy Partners Ltd." 
                    value={newReceipt.vendor}
                    onChange={(e) => setNewReceipt({...newReceipt, vendor: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Material</Label>
                    <Select onValueChange={(v) => setNewReceipt({...newReceipt, material: v})} defaultValue={newReceipt.material}>
                      <SelectTrigger>
                        <SelectValue placeholder="Material" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mozzarella Cheese">Mozzarella Cheese</SelectItem>
                        <SelectItem value="Potato Starch">Potato Starch</SelectItem>
                        <SelectItem value="Premium Sausage">Premium Sausage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="qty">Quantity Received</Label>
                    <Input 
                      id="qty" 
                      type="number" 
                      value={newReceipt.quantity}
                      onChange={(e) => setNewReceipt({...newReceipt, quantity: Number(e.target.value)})}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddReceipt} className="w-full bg-secondary text-secondary-foreground">Post Receipt</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4">
        {!selectedWarehouseId ? (
          <Card className="p-12 text-center text-muted-foreground italic border-dashed">
            Please select a warehouse to view its receipt history.
          </Card>
        ) : transactionsLoading ? (
          <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          transactions?.filter(t => t.type === 'RECEIPT').map((receipt) => (
            <Card key={receipt.id} className="border-none shadow-sm hover:border-primary/20 border transition-all">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                      <ArrowRightLeft className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold font-headline text-lg">{receipt.id.slice(-8).toUpperCase()}</h3>
                      <p className="text-xs text-muted-foreground">{receipt.vendor} • {new Date(receipt.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Material</div>
                      <div className="font-bold">{receipt.materialName}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Quantity</div>
                      <div className="font-bold text-secondary">{receipt.quantity}</div>
                    </div>
                    <Badge variant="outline" className={receipt.status === 'Verified' ? 'bg-green-50 text-green-700 border-green-200' : ''}>
                      {receipt.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
        {selectedWarehouseId && !transactionsLoading && transactions?.filter(t => t.type === 'RECEIPT').length === 0 && (
           <div className="p-12 text-center text-muted-foreground italic border-dashed border rounded-3xl">
             No receipt transactions found for this warehouse.
           </div>
        )}
      </div>
    </div>
  )
}
