
"use client"

import { Package, ArrowDownUp, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function InventoryOverviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Stock Overview</h1>
        <p className="text-muted-foreground">Monitor real-time inventory levels across all categories.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-secondary/10 border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total SKU Count</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">142</div>
            <p className="text-xs text-muted-foreground mt-1">85 Raw Materials, 57 Products</p>
          </CardContent>
        </Card>
        <Card className="bg-accent/30 border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Inbound (Next 24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">4 Shipments</div>
            <p className="text-xs text-muted-foreground mt-1">Expected: 12:00 PM - 4:00 PM</p>
          </CardContent>
        </Card>
        <Card className="bg-destructive/5 border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <div className="text-3xl font-bold text-destructive">5 items</div>
            <Badge variant="destructive" className="ml-auto">Action Required</Badge>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="font-headline">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { type: 'Inbound', item: 'Raw Milk', qty: '+500L', date: '10 mins ago', status: 'Verified' },
              { type: 'Outbound', item: 'Cheddar Bites', qty: '-120 units', date: '1h ago', status: 'Completed' },
              { type: 'Adjustment', item: 'Sea Salt', qty: '-2kg', date: '3h ago', status: 'Manual Entry' },
            ].map((t, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-muted/30">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${t.type === 'Inbound' ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'}`}>
                    <ArrowDownUp className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">{t.item}</div>
                    <div className="text-xs text-muted-foreground">{t.date}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-bold ${t.qty.startsWith('+') ? 'text-secondary' : 'text-foreground'}`}>{t.qty}</div>
                  <div className="text-[10px] text-muted-foreground">{t.status}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
