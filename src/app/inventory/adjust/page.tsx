
"use client"

import { useState } from "react"
import { Scale, Plus, Search, History, AlertTriangle, Save } from "lucide-react"
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

const initialAdjustments = [
  { date: "May 15, 2024", item: "Raw Milk", change: "-50L", reason: "SPOIL", user: "John D." },
  { date: "May 14, 2024", item: "Sea Salt", change: "+5kg", reason: "AUDIT", user: "Sarah K." },
  { date: "May 12, 2024", item: "Rennet", change: "-1kg", reason: "DAMG", user: "John D." },
]

export default function InventoryAdjustmentsPage() {
  const [adjustments, setAdjustments] = useState(initialAdjustments)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [formData, setFormData] = useState({
    material: "Raw Milk",
    quantity: 0,
    reason: "AUDIT",
    type: "increase"
  })

  const handleAddAdjustment = () => {
    const changeStr = `${formData.type === 'increase' ? '+' : '-'}${formData.quantity}`
    const newAdj = {
      date: "Just Now",
      item: formData.material,
      change: changeStr,
      reason: formData.reason,
      user: "Admin User"
    }
    setAdjustments([newAdj, ...adjustments])
    setIsAddOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline text-foreground">Stock Adjustments</h1>
          <p className="text-muted-foreground">Manually adjust inventory levels for corrections or audit findings.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Scale className="h-4 w-4 mr-2" /> Create Adjustment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="font-headline text-2xl">New Stock Adjustment</DialogTitle>
              <DialogDescription>Apply manual correction to inventory quantities.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
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
                    <SelectItem value="Raw Milk">Raw Milk</SelectItem>
                    <SelectItem value="Sea Salt">Sea Salt</SelectItem>
                    <SelectItem value="Rennet Extract">Rennet Extract</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Adjustment Type</Label>
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
              <div className="grid gap-2">
                <Label>Reason Code</Label>
                <Select 
                  defaultValue={formData.reason}
                  onValueChange={(v) => setFormData({...formData, reason: v})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AUDIT">Inventory Audit</SelectItem>
                    <SelectItem value="SPOIL">Spoilage / Expiry</SelectItem>
                    <SelectItem value="DAMG">Physical Damage</SelectItem>
                    <SelectItem value="MISC">Miscellaneous</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/10 flex items-start gap-3 mt-2">
                <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                <p className="text-[10px] text-destructive leading-relaxed">
                  Adjustments will be logged in the audit trail. Use only for corrections that cannot be processed via standard goods movement.
                </p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-headline">Recent Adjustments</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y border-t">
              {adjustments.map((adj, i) => (
                <div key={i} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${adj.change.startsWith('+') ? 'bg-secondary/10 text-secondary' : 'bg-destructive/10 text-destructive'}`}>
                      <Scale className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold">{adj.item}</div>
                      <div className="text-xs text-muted-foreground">{adj.date} • {adj.user}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold ${adj.change.startsWith('+') ? 'text-secondary' : 'text-destructive'}`}>{adj.change}</div>
                    <Badge variant="outline" className="text-[10px] py-0">{adj.reason}</Badge>
                  </div>
                </div>
              ))}
            </div>
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
              <p className="text-[10px] text-muted-foreground mt-1">Pending: 12 SKUs</p>
            </div>
            <Button variant="outline" className="w-full">
              <History className="h-4 w-4 mr-2" /> View Audit Logs
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
