
"use client"

import { useState } from "react"
import { 
  Plus, 
  Search, 
  Filter, 
  ChevronDown, 
  ClipboardList,
  Eye,
  History,
  Printer,
  Info,
  CheckCircle2,
  Factory,
  Loader2,
  Trash2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useTranslation } from "@/context/language-context"
import { useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking, useUser } from "@/firebase"
import { collection, doc } from "firebase/firestore"

export default function ProductionOrdersPage() {
  const { t } = useTranslation();
  const db = useFirestore()
  const { user } = useUser()
  const ordersRef = useMemoFirebase(() => collection(db, "production_orders"), [db])
  const { data: orders, isLoading } = useCollection(ordersRef)

  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [activeDialog, setActiveDialog] = useState<'details' | 'logs' | 'print' | null>(null)
  
  const [newOrder, setNewOrder] = useState({
    product: "Original Cheese Stick",
    quantity: 100,
    date: new Date().toISOString().split('T')[0],
    status: "Planning"
  })

  const handleCreateOrder = () => {
    if (!user) return
    addDocumentNonBlocking(ordersRef, {
      product: newOrder.product,
      date: newOrder.date,
      quantity: Number(newOrder.quantity),
      status: newOrder.status,
      yield: 0,
      variance: 0,
      createdByUserId: user.uid,
      createdAt: new Date().toISOString()
    })
    setIsCreateOpen(false)
  }

  const handleDeleteOrder = (id: string) => {
    const docRef = doc(db, "production_orders", id)
    deleteDocumentNonBlocking(docRef)
  }

  const filteredOrders = orders?.filter(o => 
    (o.id && o.id.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (o.product && o.product.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || []

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Planning':
        return <Badge variant="outline" className="bg-muted/50">Planning</Badge>
      case 'In Progress':
        return <Badge variant="default" className="bg-primary text-primary-foreground">In Progress</Badge>
      case 'Complete':
        return <Badge variant="secondary" className="bg-secondary text-secondary-foreground">Complete</Badge>
      case 'Closed':
        return <Badge variant="outline" className="opacity-50">Closed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-foreground">{t("productionOrders")}</h1>
          <p className="text-muted-foreground">Manage work orders and monitor snack manufacturing output.</p>
        </div>
        
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t("createOrder")}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm bg-accent/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Planning</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : orders?.filter(o => o.status === 'Planning').length}
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-primary/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {isLoading ? "..." : orders?.filter(o => o.status === 'In Progress').length}
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-secondary/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Complete</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">
              {isLoading ? "..." : orders?.filter(o => o.status === 'Complete').length}
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-muted/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Closed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold opacity-50">
              {isLoading ? "..." : orders?.filter(o => o.status === 'Closed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <div className="p-4 border-b flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by order ID or product..." 
              className="pl-9 bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[120px]">Order ID</TableHead>
                <TableHead>Finished Good</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Qty (Units)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Yield %</TableHead>
                <TableHead className="text-right">Var. %</TableHead>
                <TableHead className="w-[120px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id} className="group transition-colors">
                  <TableCell>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto font-bold font-headline text-primary"
                      onClick={() => { setSelectedOrder(order); setActiveDialog('details'); }}
                    >
                      {order.id.slice(-5).toUpperCase()}
                    </Button>
                  </TableCell>
                  <TableCell>{order.product}</TableCell>
                  <TableCell className="text-muted-foreground">{order.date}</TableCell>
                  <TableCell className="text-right font-medium">{order.quantity?.toLocaleString()}</TableCell>
                  <TableCell>
                    {getStatusBadge(order.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    {order.yield > 0 ? (
                      <span className={order.yield < 90 ? 'text-destructive font-bold' : 'text-foreground'}>
                        {order.yield}%
                      </span>
                    ) : '-'}
                  </TableCell>
                  <TableCell className={`text-right font-medium ${order.variance > 5 ? 'text-destructive' : order.variance < 0 ? 'text-secondary' : ''}`}>
                    {order.variance !== 0 ? `${order.variance > 0 ? '+' : ''}${order.variance}%` : '-'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                          Actions <ChevronDown className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        {(order.status === 'Planning' || order.status === 'In Progress') && (
                          <DropdownMenuItem asChild>
                            <Link href={`/production/record-consumption/${order.id}`} className="w-full flex items-center text-primary font-bold cursor-pointer">
                              <ClipboardList className="h-4 w-4 mr-2" /> {t("recordConsumption")}
                            </Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer" onClick={() => { setSelectedOrder(order); setActiveDialog('details'); }}>
                          <Eye className="h-4 w-4 mr-2" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer" onClick={() => { setSelectedOrder(order); setActiveDialog('logs'); }}>
                          <History className="h-4 w-4 mr-2" /> Production Logs
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer" onClick={() => { setSelectedOrder(order); setActiveDialog('print'); }}>
                          <Printer className="h-4 w-4 mr-2" /> Print Labels
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive cursor-pointer" onClick={() => handleDeleteOrder(order.id)}>
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground italic">
                    No production orders found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Create Order Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">Create Production Order</DialogTitle>
            <DialogDescription>Initiate a new production run by selecting a snack and target quantity.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="product">Finished Good</Label>
              <Select defaultValue={newOrder.product} onValueChange={(v) => setNewOrder({...newOrder, product: v})}>
                <SelectTrigger id="product">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Original Cheese Stick">Original Cheese Stick</SelectItem>
                  <SelectItem value="Long Potato">Long Potato</SelectItem>
                  <SelectItem value="Chicken PopCorn">Chicken PopCorn</SelectItem>
                  <SelectItem value="Sausage Cheese Stick">Sausage Cheese Stick</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="quantity">Planned Quantity (Units)</Label>
              <Input id="quantity" type="number" value={newOrder.quantity} onChange={(e) => setNewOrder({...newOrder, quantity: Number(e.target.value)})} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Scheduled Date</Label>
              <Input id="date" type="date" value={newOrder.date} onChange={(e) => setNewOrder({...newOrder, date: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Initial Status</Label>
              <Select defaultValue={newOrder.status} onValueChange={(v) => setNewOrder({...newOrder, status: v})}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Planning">Planning</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateOrder} className="w-full bg-secondary text-secondary-foreground">Create Order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={activeDialog === 'details'} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">Order Details</DialogTitle>
            <DialogDescription>Full specification for production run {selectedOrder?.id?.slice(-5).toUpperCase()}</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/30 border">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">Product</span>
                  <span className="text-sm font-bold">{selectedOrder.product}</span>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">Target Qty</span>
                  <span className="text-sm font-bold">{selectedOrder.quantity} Units</span>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">Scheduled Date</span>
                  <span className="text-sm font-bold">{selectedOrder.date}</span>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">Status</span>
                  <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" className="w-full" onClick={() => setActiveDialog(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
