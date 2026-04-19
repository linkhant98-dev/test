
"use client"

import { Package, ArrowDownUp, AlertTriangle, Warehouse, Info } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const stockLevels = [
  { id: "MAT-001", name: "Raw Milk (Full Cream)", category: "Raw Material", stock: 2500, unit: "L", min: 1000, warehouse: "Main Cold Storage" },
  { id: "MAT-002", name: "Sea Salt", category: "Ingredient", stock: 120, unit: "kg", min: 50, warehouse: "Raw Material Depot" },
  { id: "MAT-003", name: "Rennet Extract", category: "Ingredient", stock: 15, unit: "kg", min: 20, warehouse: "Raw Material Depot" },
  { id: "MAT-004", name: "Culture Starter", category: "Ingredient", stock: 8, unit: "kg", min: 10, warehouse: "Raw Material Depot" },
  { id: "MAT-005", name: "Packaging Wrap", category: "Packaging", stock: 450, unit: "sqm", min: 200, warehouse: "Packaging Warehouse" },
]

export default function InventoryOverviewPage() {
  const lowStockItems = stockLevels.filter(item => item.stock <= item.min)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline text-foreground">Stock Overview</h1>
        <p className="text-muted-foreground">Monitor real-time inventory levels and warehouse distributions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-secondary/10 border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Stock Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">92.4%</div>
            <p className="text-xs text-muted-foreground mt-1">Average availability across all SKUs</p>
          </CardContent>
        </Card>
        <Card className="bg-accent/30 border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Warehouse Capacity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">68.2%</div>
            <p className="text-xs text-muted-foreground mt-1">Occupancy across 4 active facilities</p>
          </CardContent>
        </Card>
        <Card className="bg-destructive/5 border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <div className="text-3xl font-bold text-destructive">{lowStockItems.length} items</div>
            <Badge variant="destructive" className="ml-auto">Action Required</Badge>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="font-headline">Live Inventory Ledger</CardTitle>
            <CardDescription>Detailed stock levels for all materials and ingredients.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Material</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead className="text-right">On Hand</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stockLevels.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">{item.name}</span>
                        <span className="text-[10px] text-muted-foreground uppercase">{item.category}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">{item.warehouse}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-bold">{item.stock.toLocaleString()} {item.unit}</span>
                        <span className="text-[10px] text-muted-foreground">Min: {item.min}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.stock <= item.min ? (
                        <Badge variant="destructive" className="text-[10px] py-0">Critical</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-secondary/10 text-secondary text-[10px] py-0">Healthy</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                Critical Stock
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {lowStockItems.map(item => (
                <div key={item.id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-destructive font-bold">{Math.round((item.stock / item.min) * 100)}%</span>
                  </div>
                  <Progress value={(item.stock / item.min) * 100} className="h-1 bg-muted [&>div]:bg-destructive" />
                </div>
              ))}
              {lowStockItems.length === 0 && (
                <p className="text-xs text-muted-foreground">No critical stock levels detected.</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-slate-900 text-slate-50">
            <CardHeader>
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-primary">Warehouse Load</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: "Main Cold Storage", load: 85 },
                { name: "Raw Material Depot", load: 40 },
                { name: "Finished Bay", load: 92 },
              ].map(wh => (
                <div key={wh.name} className="flex items-center gap-3">
                  <Warehouse className="h-4 w-4 text-slate-500" />
                  <div className="flex-1">
                    <div className="flex justify-between text-[10px] mb-1">
                      <span>{wh.name}</span>
                      <span>{wh.load}%</span>
                    </div>
                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${wh.load}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
