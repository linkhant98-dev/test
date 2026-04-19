
"use client"

import { 
  ArrowLeft, 
  TrendingDown, 
  AlertCircle, 
  History,
  CheckCircle2,
  FileText
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

const MOCK_ORDER_DATA = {
  id: "PO-2024-006",
  product: "Brie Appetizers",
  planned: 1200,
  actual: 1060,
  yield: 88.3,
  materials: [
    { name: "Creamy Brie Base", planned: 1000, actual: 1150, variance: 150, costVar: 450 },
    { name: "Crackers (Salted)", planned: 500, actual: 480, variance: -20, costVar: -10 },
    { name: "Honey Glaze", planned: 50, actual: 85, variance: 35, costVar: 105 },
  ],
  waste: [
    { reason: "Over-baking", qty: 45 },
    { reason: "Dropped items", qty: 25 },
    { reason: "Quality Reject", qty: 70 },
  ]
}

export default function OrderDiagnosticPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <Link href="/production" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Orders
        </Link>
        <Badge variant="outline" className="px-3 py-1 bg-accent text-secondary border-secondary/20 font-bold">
          Manual Diagnostic View
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-secondary text-secondary-foreground pb-6">
              <CardTitle className="font-headline text-lg">Order Summary</CardTitle>
              <CardDescription className="text-secondary-foreground/70">Raw Performance Data</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-xs text-muted-foreground">Order ID</span>
                <span className="text-sm font-bold">{MOCK_ORDER_DATA.id}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-xs text-muted-foreground">Product</span>
                <span className="text-sm font-bold">{MOCK_ORDER_DATA.product}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-xs text-muted-foreground">Actual Yield</span>
                <span className="text-sm font-bold text-destructive">{MOCK_ORDER_DATA.yield}%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold">Historical Context</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <History className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs font-medium">Yield is 7% lower than the 30-day average.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-secondary mt-0.5" />
                  <div>
                    <p className="text-xs font-medium">Previous batch logs were optimal.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card className="border-none shadow-lg">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="font-headline text-xl">Detailed Variance Report</CardTitle>
              <CardDescription>Manual review of material consumption and waste</CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/5 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                    <div>
                      <h5 className="text-sm font-bold text-destructive">Material Alert</h5>
                      <p className="text-xs mt-1">High over-consumption of 'Creamy Brie Base' noted.</p>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border border-secondary/20 bg-secondary/5 flex items-start gap-3">
                    <TrendingDown className="h-5 w-5 text-secondary mt-0.5" />
                    <div>
                      <h5 className="text-sm font-bold text-secondary">Efficiency Note</h5>
                      <p className="text-xs mt-1">Monitor glaze temperature to minimize runoff waste.</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-muted/10 rounded-xl p-4 border border-dashed">
                  <div className="flex items-center gap-2 mb-4 font-bold text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>Audit Breakdown</span>
                  </div>
                  <div className="space-y-3">
                    {MOCK_ORDER_DATA.materials.map(m => (
                      <div key={m.name} className="flex justify-between items-center text-sm">
                        <span>{m.name}</span>
                        <span className={m.variance > 0 ? 'text-destructive font-bold' : 'text-secondary font-bold'}>
                          {m.variance > 0 ? '+' : ''}{m.variance} kg
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="outline">Print Audit Report</Button>
            <Button className="bg-secondary text-secondary-foreground">Acknowledge Findings</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
