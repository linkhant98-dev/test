
"use client"

import { useState } from "react"
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  FileText, 
  Play, 
  CheckCircle, 
  AlertCircle,
  Sparkles,
  ArrowRight,
  ClipboardList
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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

const initialOrders = [
  { id: "PO-2024-001", product: "Classic Cheese Bites", date: "2024-05-10", quantity: 5000, status: "Completed", yield: 98.2, variance: -1.2 },
  { id: "PO-2024-002", product: "Smoked Gouda Cubes", date: "2024-05-11", quantity: 2000, status: "In Progress", yield: 0, variance: 0 },
  { id: "PO-2024-003", product: "Pepper Jack Strings", date: "2024-05-12", quantity: 3500, status: "Completed", yield: 91.5, variance: 4.8 },
  { id: "PO-2024-004", product: "Aged Cheddar Slices", date: "2024-05-13", quantity: 1500, status: "Draft", yield: 0, variance: 0 },
  { id: "PO-2024-005", product: "Mini Mozza Balls", date: "2024-05-14", quantity: 8000, status: "Completed", yield: 99.1, variance: 0.5 },
  { id: "PO-2024-006", product: "Brie Appetizers", date: "2024-05-15", quantity: 1200, status: "Completed", yield: 88.3, variance: 12.4 },
]

export default function ProductionOrdersPage() {
  const [orders, setOrders] = useState(initialOrders)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newOrder, setNewOrder] = useState({
    product: "Classic Cheese Bites",
    quantity: 1000,
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
          <h1 className="text-3xl font-bold font-headline text-foreground">Production Orders</h1>
          <p className="text-muted-foreground">Manage work orders and monitor real-time manufacturing output.</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Create Order
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="font-headline text-2xl">Create Production Order</DialogTitle>
              <DialogDescription>
                Initiate a new production run by selecting a finished good and target quantity.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="product">Finished Good</Label>
                <Select 
                  defaultValue={newOrder.product}
                  onValueChange={(v) => setNewOrder({...newOrder, product: v})}
                >
                  <SelectTrigger id="product">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Classic Cheese Bites">Classic Cheese Bites</SelectItem>
                    <SelectItem value="Mozza Strings">Mozza Strings</SelectItem>
                    <SelectItem value="Brie Appetizers">Brie Appetizers</SelectItem>
                    <SelectItem value="Aged Cheddar Slices">Aged Cheddar Slices</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="quantity">Planned Quantity (kg)</Label>
                <Input 
                  id="quantity" 
                  type="number" 
                  value={newOrder.quantity}
                  onChange={(e) => setNewOrder({...newOrder, quantity: Number(e.target.value)})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Scheduled Date</Label>
                <Input 
                  id="date" 
                  type="date" 
                  value={newOrder.date}
                  onChange={(e) => setNewOrder({...newOrder, date: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateOrder} className="w-full bg-secondary text-secondary-foreground">Start Production</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <div className="text-2xl font-bold">12,500 kg</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-destructive/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Yield Anomaly</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <div className="text-2xl font-bold text-destructive">2 Critical</div>
            <Badge variant="destructive" className="ml-auto">Needs AI Analysis</Badge>
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
          <Button variant="outline">
            Export CSV
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[120px]">Order ID</TableHead>
              <TableHead>Finished Good</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Qty (kg)</TableHead>
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
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href={`/production/record-consumption/${order.id}`} className="flex items-center text-primary font-bold">
                          <ClipboardList className="h-4 w-4 mr-2" /> Record Consumption
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/production/ai-insights?id=${order.id}`} className="flex items-center text-secondary font-bold">
                          <Sparkles className="h-4 w-4 mr-2" /> AI Analysis
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Production Logs</DropdownMenuItem>
                      <DropdownMenuItem>Print Labels</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
