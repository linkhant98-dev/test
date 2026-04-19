
"use client"

import { useState } from "react"
import { Send, Plus, Search, Factory, ClipboardCheck, AlertCircle } from "lucide-react"
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

const pendingOrders = [
  { id: "PO-24-055", product: "Cheddar Bites", progress: "Not Started", items: [{ name: "Milk", qty: 500, unit: "L" }, { name: "Salt", qty: 5, unit: "kg" }] },
  { id: "PO-24-056", product: "Mozza Strings", progress: "Partial Issue", items: [{ name: "Milk", qty: 300, unit: "L" }, { name: "Culture", qty: 2, unit: "kg" }] },
  { id: "PO-24-057", product: "Brie Pops", progress: "Not Started", items: [{ name: "Brie Base", qty: 100, unit: "kg" }, { name: "Packaging", qty: 50, unit: "sqm" }] },
]

export default function ProductionIssuePage() {
  const [orders, setOrders] = useState(pendingOrders)
  const [selectedOrder, setSelectedOrder] = useState<typeof pendingOrders[0] | null>(null)
  const [isIssueOpen, setIsIssueOpen] = useState(false)

  const handleIssue = (orderId: string) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, progress: "Completed" } : o))
    setIsIssueOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline text-foreground">Production Issues</h1>
          <p className="text-muted-foreground">Allocate materials to active production orders.</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => {
          setSelectedOrder(orders[0])
          setIsIssueOpen(true)
        }}>
          <Plus className="h-4 w-4 mr-2" /> Issue Materials
        </Button>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="bg-secondary/5 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold text-secondary flex items-center gap-2">
            <Factory className="h-4 w-4" /> Open Orders Requiring Materials
          </CardTitle>
          <Badge className="bg-secondary">{orders.filter(o => o.progress !== 'Completed').length} Pending</Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {orders.map((order) => (
              <div key={order.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm font-headline">{order.id}</span>
                    <span className="text-sm">{order.product}</span>
                  </div>
                  <div className="flex gap-2">
                    {order.items.map(item => (
                      <span key={item.name} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                        {item.name}: {item.qty}{item.unit}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={order.progress === 'Completed' ? 'default' : 'outline'} className={order.progress === 'Completed' ? 'bg-secondary' : 'text-[10px]'}>
                    {order.progress}
                  </Badge>
                  {order.progress !== 'Completed' && (
                    <Button 
                      size="sm" 
                      className="bg-secondary/10 text-secondary hover:bg-secondary/20 border-none"
                      onClick={() => {
                        setSelectedOrder(order)
                        setIsIssueOpen(true)
                      }}
                    >
                      <Send className="h-3 w-3 mr-2" /> Issue Now
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isIssueOpen} onOpenChange={setIsIssueOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl">Confirm Material Issue</DialogTitle>
            <DialogDescription>
              Confirm quantities to be issued from warehouse to Production Order <strong>{selectedOrder?.id}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
             {selectedOrder?.items.map((item, idx) => (
               <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border">
                 <div>
                   <span className="text-xs font-bold text-muted-foreground block uppercase">Material</span>
                   <span className="text-sm font-bold">{item.name}</span>
                 </div>
                 <div className="text-right">
                   <span className="text-xs font-bold text-muted-foreground block uppercase">Qty</span>
                   <span className="text-sm font-bold text-secondary">{item.qty} {item.unit}</span>
                 </div>
               </div>
             ))}
             <div className="p-3 rounded-lg bg-orange-50 border border-orange-200 flex items-start gap-3">
               <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
               <p className="text-[10px] text-orange-700 leading-relaxed">
                 By clicking confirm, stock levels in the warehouse will be immediately reduced and assigned to this work order.
               </p>
             </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsIssueOpen(false)}>Cancel</Button>
            <Button onClick={() => handleIssue(selectedOrder?.id!)} className="bg-secondary text-secondary-foreground">
              <ClipboardCheck className="h-4 w-4 mr-2" /> Confirm Issue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
