
"use client"

import { Warehouse, AlertTriangle, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase"
import { collection } from "firebase/firestore"

export default function InventoryOverviewPage() {
  const db = useFirestore()
  const { user } = useUser()

  const materialsRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, "raw_materials");
  }, [db, user]);

  const { data: materials, isLoading: materialsLoading } = useCollection(materialsRef)

  const lowStockItems = materials?.filter(item => (item.stock || 0) <= 50) || [] // Using 50 as default threshold

  if (materialsLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline text-foreground">Stock Overview</h1>
        <p className="text-muted-foreground">Monitor real-time ingredient levels for snack production.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-secondary/10 border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Stock Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">85.4%</div>
            <p className="text-xs text-muted-foreground mt-1">Average availability across ingredients</p>
          </CardContent>
        </Card>
        <Card className="bg-accent/30 border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Warehouse Load</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">42.2%</div>
            <p className="text-xs text-muted-foreground mt-1">Total occupancy across facilities</p>
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
            <CardDescription>Current availability of raw materials and ingredients.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Material</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">On Hand</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materials?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">{item.name}</span>
                        <span className="text-[10px] text-muted-foreground uppercase">{item.id.slice(-5)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">{item.category}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-bold">{(item.stock || 0).toLocaleString()} {item.unit}</span>
                        <span className="text-[10px] text-muted-foreground">Min: 50</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {(item.stock || 0) <= 50 ? (
                        <Badge variant="destructive" className="text-[10px] py-0">Critical</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-secondary/10 text-secondary text-[10px] py-0">Healthy</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {!materialsLoading && materials?.length === 0 && (
                   <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-muted-foreground italic">
                      No materials found. Seed demo data from Dashboard.
                    </TableCell>
                  </TableRow>
                )}
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
                    <span className="text-destructive font-bold">{Math.round(((item.stock || 0) / 50) * 100)}%</span>
                  </div>
                  <Progress value={((item.stock || 0) / 50) * 100} className="h-1 bg-muted [&>div]:bg-destructive" />
                </div>
              ))}
              {lowStockItems.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">All stock levels healthy.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
