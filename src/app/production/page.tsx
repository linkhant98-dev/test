
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
  ArrowRight
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
import Link from "next/link"

const orders = [
  { id: "PO-2024-001", product: "Classic Cheese Bites", date: "2024-05-10", quantity: 5000, status: "Completed", yield: 98.2, variance: -1.2 },
  { id: "PO-2024-002", product: "Smoked Gouda Cubes", date: "2024-05-11", quantity: 2000, status: "In Progress", yield: 0, variance: 0 },
  { id: "PO-2024-003", product: "Pepper Jack Strings", date: "2024-05-12", quantity: 3500, status: "Completed", yield: 91.5, variance: 4.8 },
  { id: "PO-2024-004", product: "Aged Cheddar Slices", date: "2024-05-13", quantity: 1500, status: "Draft", yield: 0, variance: 0 },
  { id: "PO-2024-005", product: "Mini Mozza Balls", date: "2024-05-14", quantity: 8000, status: "Completed", yield: 99.1, variance: 0.5 },
  { id: "PO-2024-006", product: "Brie Appetizers", date: "2024-05-15", quantity: 1200, status: "Completed", yield: 88.3, variance: 12.4 },
]

export default function ProductionOrdersPage() {
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-foreground">Production Orders</h1>
          <p className="text-muted-foreground">Manage work orders and monitor real-time manufacturing output.</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Create Order
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm bg-accent/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18 Orders</div>
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
            {orders.map((order) => (
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
