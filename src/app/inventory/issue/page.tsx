
"use client"

import { useState } from "react"
import { Send, Plus, Search, Factory, ClipboardCheck, AlertCircle, Loader2 } from "lucide-react"
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
import { useFirestore, useCollection, useMemoFirebase, useUser, updateDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"

export default function ProductionIssuePage() {
  const db = useFirestore()
  const { user } = useUser()

  const ordersRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, "production_orders");
  }, [db, user]);

  const { data: orders, isLoading: ordersLoading } = useCollection(ordersRef)

  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [isIssueOpen, setIsIssueOpen] = useState(false)

  const handleIssue = (orderId: string) => {
    const docRef = doc(db, "production_orders", orderId)
    updateDocumentNonBlocking(docRef, { status: "In Progress" })
    setIsIssueOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline text-foreground">Production Issues</h1>
          <p className="text-muted-foreground">Allocate materials to active production orders.</p>
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="bg-secondary/5 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold text-secondary flex items-center gap-2">
            <Factory className="h-4 w-4" /> Orders Requiring Material Allocation
          </CardTitle>
          <Badge className="bg-secondary">{orders?.filter(o => o.status === 'Planning').length || 0} Pending</Badge>
        </CardHeader>
        <CardContent className="p-0">
          {ordersLoading ? (
            <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <div className="divide-y">
              {orders?.filter(o => o.status !== 'Complete').map((order) => (
                <div key={order.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm font-headline">{order.id.slice(-8).toUpperCase()}</span>
                      <span className="text-sm">{order.product}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground">Target: {order.quantity} Units</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={order.status === 'Planning' ? 'outline' : 'default'} className={order.status === 'In Progress' ? 'bg-primary' : ''}>
                      {order.status}
                    </Badge>
                    {order.status === 'Planning' && (
                      <Button 
                        size="sm" 
                        className="bg-secondary/10 text-secondary hover:bg-secondary/20 border-none"
                        onClick={() => {
                          setSelectedOrder(order)
                          setIsIssueOpen(true)
                        }}
                      >
                        <Send className="h-3 w-3 mr-2" /> Issue Materials
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {orders?.length === 0 && (
                 <div className="p-12 text-center text-muted-foreground italic">No open orders. Seed demo data from Dashboard.</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isIssueOpen} onOpenChange={setIsIssueOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl">Confirm Material Issue</DialogTitle>
            <DialogDescription>
              Confirm quantities to be issued for Production Order <strong>{selectedOrder?.id?.slice(-8).toUpperCase()}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
             <div className="p-3 rounded-lg bg-muted/30 border">
                <span className="text-xs font-bold text-muted-foreground block uppercase">Production Run</span>
                <span className="text-sm font-bold">{selectedOrder?.product}</span>
             </div>
             <div className="p-3 rounded-lg bg-orange-50 border border-orange-200 flex items-start gap-3">
               <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
               <p className="text-[10px] text-orange-700 leading-relaxed">
                 By clicking confirm, the order status will move to 'In Progress' and warehouse stock levels will be reserved.
               </p>
             </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsIssueOpen(false)}>Cancel</Button>
            <Button onClick={() => handleIssue(selectedOrder?.id!)} className="bg-secondary text-secondary-foreground">
              <ClipboardCheck className="h-4 w-4 mr-2" /> Confirm & Start
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
