
"use client"

import { Scale, Plus, Search, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function InventoryAdjustmentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline text-foreground">Stock Adjustments</h1>
          <p className="text-muted-foreground">Manually adjust inventory levels for corrections or audit findings.</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Scale className="h-4 w-4 mr-2" /> Create Adjustment
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-headline">Recent Adjustments</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y border-t">
              {[
                { date: "May 15, 2024", item: "Raw Milk", change: "-50L", reason: "SPOIL", user: "John D." },
                { date: "May 14, 2024", item: "Sea Salt", change: "+5kg", reason: "AUDIT", user: "Sarah K." },
                { date: "May 12, 2024", item: "Rennet", change: "-1kg", reason: "DAMG", user: "John D." },
              ].map((adj, i) => (
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
            <CardTitle className="text-sm font-bold">Audit History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-accent/20 border border-primary/10">
              <p className="text-xs text-muted-foreground mb-2">Last Full Audit</p>
              <div className="text-lg font-bold font-headline">April 30, 2024</div>
              <p className="text-[10px] text-muted-foreground mt-1">Accuracy: 99.8%</p>
            </div>
            <Button variant="outline" className="w-full">
              <History className="h-4 w-4 mr-2" /> View Full Log
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
