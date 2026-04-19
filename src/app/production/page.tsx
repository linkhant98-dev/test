
"use client"

import { useState } from "react"
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  ClipboardList,
  Eye,
  History,
  Printer,
  Info,
  CheckCircle2,
  Factory
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

const initialOrders = [
  { id: "PO-2024-001", product: "Original Cheese Stick", date: "2024-05-10", quantity: 500, status: "Completed", yield: 98.2, variance: -1.2 },
  { id: "PO-2024-002", product: "Long Potato", date: "2024-05-11", quantity: 800, status: "In Progress", yield: 0, variance: 0 },
  { id: "PO-2024-003", product: "Chicken PopCorn", date: "2024-05-12", quantity: 300, status: "Completed", yield: 91.5, variance: 4.8 },
  { id: "PO-2024-004", product: "Sausage Cheese Stick", date: "2024-05-13", quantity: 450, status: "Draft", yield: 0, variance: 0 },
]

export default function ProductionOrdersPage() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState(initialOrders)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<typeof initialOrders[0] | null>(null)
  const [activeDialog, setActiveDialog] = useState<'details' | 'logs' | 'print' | null>(null)
  
  const [newOrder, setNewOrder] = useState({
    product: "Original Cheese Stick",
    quantity: 100,
    date: new Date().toISOString().split('T')[0]
  })

  const handleCreateOrder = () => {
    const id = `PO-2024-${String(orders.length + 1).padStart(3, '0')}`
    const order = {
      id,
      product: newOrder.product,
      date: newOrder.date,
      quantity: Number(newOrder.quantity),
      status: "In Progress",
      yield: 0,
      variance: 0
    }
    setOrders([order, ...orders])
    setIsCreateOpen(false)
  }

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.product.toLowerCase().includes(searchTerm.toLowerCase())
  )

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-none shadow-sm bg-accent/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.filter(o => o.status !== 'Completed').length} Orders</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-secondary/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Target</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,500 Units</div>
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
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id} className="group transition-colors">
                <TableCell className="font-bold font-headline">{order.id}</TableCell>
                <TableCell>{order.product}</TableCell>
                <TableCell className="text-muted-foreground">{order.date}</TableCell>
                <TableCell className="text-right font-medium">{order.quantity.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      order.status === 'Completed' ? 'default' : 
                      order.status === 'In Progress' ? 'secondary' : 'outline'
                    }
                    className={
                      order.status === 'Completed' ? 'bg-secondary text-secondary-foreground' : 
                      order.status === 'In Progress' ? 'bg-primary text-primary-foreground' : ''
                    }
                  >
                    {order.status}
                  </Badge>
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
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href={`/production/record-consumption/${order.id}`} className="w-full flex items-center text-primary font-bold">
                          <ClipboardList className="h-4 w-4 mr-2" /> {t("recordConsumption")}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => { setSelectedOrder(order); setActiveDialog('details'); }}>
                        <Eye className="h-4 w-4 mr-2" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setSelectedOrder(order); setActiveDialog('logs'); }}>
                        <History className="h-4 w-4 mr-2" /> Production Logs
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setSelectedOrder(order); setActiveDialog('print'); }}>
                        <Printer className="h-4 w-4 mr-2" /> Print Labels
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
          </div>
          <DialogFooter>
            <Button onClick={handleCreateOrder} className="w-full bg-secondary text-secondary-foreground">Start Production</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={activeDialog === 'details'} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">Order Details</DialogTitle>
            <DialogDescription>Full specification for production run {selectedOrder?.id}</DialogDescription>
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
                  <Badge className={selectedOrder.status === 'Completed' ? 'bg-secondary' : 'bg-primary'}>{selectedOrder.status}</Badge>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" className="w-full" onClick={() => setActiveDialog(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Logs and Print dialogs omitted for brevity but they follow the same pattern */}
    </div>
  )
}
