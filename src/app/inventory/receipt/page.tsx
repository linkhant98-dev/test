
"use client"

import { FileDown, Plus, Search, ArrowRightLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function GoodsReceiptPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline text-foreground">Goods Receipt</h1>
          <p className="text-muted-foreground">Record incoming shipments and update material stock levels.</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">
          <Plus className="h-4 w-4 mr-2" /> New Receipt
        </Button>
      </div>

      <div className="grid gap-6">
        {[
          { id: "GR-2024-102", vendor: "Dairy Partners Ltd.", date: "Today, 10:45 AM", items: 3, value: "$1,450.00", status: "Verified" },
          { id: "GR-2024-101", vendor: "Spice World Inc.", date: "Yesterday, 2:30 PM", items: 12, value: "$890.50", status: "Completed" },
          { id: "GR-2024-100", vendor: "EcoPack Solutions", date: "May 12, 2024", items: 5, value: "$2,100.00", status: "Pending Audit" },
        ].map((receipt) => (
          <Card key={receipt.id} className="border-none shadow-sm hover:border-primary/20 border transition-all">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                    <ArrowRightLeft className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold font-headline text-lg">{receipt.id}</h3>
                    <p className="text-xs text-muted-foreground">{receipt.vendor} • {receipt.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Items</div>
                    <div className="font-bold">{receipt.items}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Total Value</div>
                    <div className="font-bold text-secondary">{receipt.value}</div>
                  </div>
                  <Badge variant="outline" className={receipt.status === 'Verified' ? 'bg-green-50 text-green-700 border-green-200' : ''}>
                    {receipt.status}
                  </Badge>
                  <Button variant="ghost" size="icon">
                    <FileDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
