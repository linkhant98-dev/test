
"use client"

import { useState } from "react"
import { Scale, Plus, Search, History, AlertTriangle, Save, Loader2 } from "lucide-react"
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

export default function InventoryAdjustmentsPage() {
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
  const [formData, setFormData] = useState({
    material: "Raw Milk",
    quantity: 0,
    reason: "AUDIT",
    type: "increase",
    warehouseId: ""
  })

  const handleAddAdjustment = () => {
    if (!formData.warehouseId || !db) return
    const colRef = collection(db, "warehouses", formData.warehouseId, "stock_transactions")
    const change = formData.type === 'increase' ? formData.quantity : -formData.quantity
    
    addDocumentNonBlocking(colRef, {
      type: "ADJUSTMENT",
      materialName: formData.material,
      quantity: change,
      reason: formData.reason,
      timestamp: new Date().toISOString(),
      user: "Demo Admin"
    })
    setIsAddOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-foreground">Stock Adjustments</h1>
          <p className="text-muted-foreground">Manually adjust inventory levels for corrections.</p>
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
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Scale className="h-4 w-4 mr-2" /> Create Adjustment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="font-headline text-2xl">New Stock Adjustment</DialogTitle>
                <DialogDescription>Apply manual correction to inventory.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Warehouse</Label>
                  <Select onValueChange={(v) => setFormData({...formData, warehouseId: v})}>
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
                  <Label>Target Material</Label>
                  <Select 
                    defaultValue={formData.material}
                    onValueChange={(v) => setFormData({...formData, material: v})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select material" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mozzarella Cheese">Mozzarella Cheese</SelectItem>
                      <SelectItem value="Potato Starch">Potato Starch</SelectItem>
                      <SelectItem value="Premium Sausage">Premium Sausage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Type</Label>
                    <Select 
                      defaultValue={formData.type}
                      onValueChange={(v) => setFormData({...formData, type: v})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="increase">Increase (+)</SelectItem>
                        <SelectItem value="decrease">Decrease (-)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Quantity</Label>
                    <Input 
                      type="number" 
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: Number(e.target.value)})}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddAdjustment} className="w-full bg-secondary text-secondary-foreground">
                  <Save className="h-4 w-4 mr-2" /> Apply Adjustment
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-headline">Recent Adjustments</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {!selectedWarehouseId ? (
              <div className="p-12 text-center text-muted-foreground italic">Select a warehouse to view history.</div>
            ) : transactionsLoading ? (
              <div className="p-8 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : (
              <div className="divide-y border-t">
                {transactions?.filter(t => t.type === 'ADJUSTMENT').map((adj) => (
                  <div key={adj.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${adj.quantity >= 0 ? 'bg-secondary/10 text-secondary' : 'bg-destructive/10 text-destructive'}`}>
                        <Scale className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold">{adj.materialName}</div>
                        <div className="text-xs text-muted-foreground">{new Date(adj.timestamp).toLocaleDateString()} • {adj.user}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold ${adj.quantity >= 0 ? 'text-secondary' : 'text-destructive'}`}>
                        {adj.quantity > 0 ? '+' : ''}{adj.quantity}
                      </div>
                      <Badge variant="outline" className="text-[10px] py-0">{adj.reason}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm h-fit">
          <CardHeader>
            <CardTitle className="text-sm font-bold">Audit Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-accent/20 border border-primary/10">
              <p className="text-xs text-muted-foreground mb-2">Cycle Count Completion</p>
              <div className="text-lg font-bold font-headline">88.5%</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
