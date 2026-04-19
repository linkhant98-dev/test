
"use client"

import { useState } from "react"
import { FileDown, Plus, Search, ArrowRightLeft, Calendar } from "lucide-react"
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

const initialReceipts = [
  { id: "GR-2024-102", vendor: "Dairy Partners Ltd.", date: "2024-05-15 10:45 AM", items: 3, value: "$1,450.00", status: "Verified" },
  { id: "GR-2024-101", vendor: "Spice World Inc.", date: "2024-05-14 02:30 PM", items: 12, value: "$890.50", status: "Completed" },
  { id: "GR-2024-100", vendor: "EcoPack Solutions", date: "2024-05-12 09:15 AM", items: 5, value: "$2,100.00", status: "Verified" },
]

export default function GoodsReceiptPage() {
  const [receipts, setReceipts] = useState(initialReceipts)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newReceipt, setNewReceipt] = useState({
    vendor: "",
    material: "",
    quantity: 0,
    warehouse: "Main Cold Storage"
  })

  const handleAddReceipt = () => {
    const id = `GR-2024-${String(receipts.length + 103)}`
    const date = new Date().toLocaleString()
    const receipt = {
      id,
      vendor: newReceipt.vendor,
      date,
      items: 1,
      value: "$0.00 (Draft)",
      status: "Verified"
    }
    setReceipts([receipt, ...receipts])
    setIsAddOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline text-foreground">Goods Receipt</h1>
          <p className="text-muted-foreground">Record incoming shipments and update material stock levels.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">
              <Plus className="h-4 w-4 mr-2" /> New Receipt
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="font-headline text-2xl">New Goods Receipt</DialogTitle>
              <DialogDescription>Record materials received from a vendor to update inventory.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
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
                  <Select onValueChange={(v) => setNewReceipt({...newReceipt, material: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select material" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Raw Milk">Raw Milk</SelectItem>
                      <SelectItem value="Sea Salt">Sea Salt</SelectItem>
                      <SelectItem value="Packaging">Packaging</SelectItem>
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
              <div className="grid gap-2">
                <Label>Destination Warehouse</Label>
                <Select 
                  defaultValue={newReceipt.warehouse}
                  onValueChange={(v) => setNewReceipt({...newReceipt, warehouse: v})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Main Cold Storage">Main Cold Storage</SelectItem>
                    <SelectItem value="Raw Material Depot">Raw Material Depot</SelectItem>
                    <SelectItem value="Packaging Warehouse">Packaging Warehouse</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddReceipt} className="w-full bg-secondary text-secondary-foreground">Post Receipt</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {receipts.map((receipt) => (
          <Card key={receipt.id} className="border-none shadow-sm hover:border-primary/20 border transition-all">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                    <ArrowRightLeft className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold font-headline text-lg">{receipt.id}</h3>
                    <p className="text-xs text-muted-foreground">{receipt.vendor} • {receipt.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Items</div>
                    <div className="font-bold">{receipt.items}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Total Value</div>
                    <div className="font-bold text-secondary">{receipt.value}</div>
                  </div>
                  <Badge variant="outline" className={receipt.status === 'Verified' ? 'bg-green-50 text-green-700 border-green-200' : ''}>
                    {receipt.status}
                  </Badge>
                  <Button variant="ghost" size="icon">
                    <FileDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
