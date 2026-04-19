
"use client"

import { Send, Plus, Search, Factory } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function ProductionIssuePage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline text-foreground">Production Issues</h1>
          <p className="text-muted-foreground">Allocate materials to active production orders.</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" /> Issue Materials
        </Button>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="bg-secondary/5 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold text-secondary flex items-center gap-2">
            <Factory className="h-4 w-4" /> Open Orders Requiring Materials
          </CardTitle>
          <Badge className="bg-secondary">4 Pending</Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {[
              { id: "PO-24-055", product: "Cheddar Bites", progress: "Not Started", items: ["Milk", "Salt", "Rennet"] },
              { id: "PO-24-056", product: "Mozza Strings", progress: "Partial Issue", items: ["Milk", "Culture"] },
              { id: "PO-24-057", product: "Brie Pops", progress: "Not Started", items: ["Brie Base", "Packaging"] },
            ].map((order) => (
              <div key={order.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm font-headline">{order.id}</span>
                    <span className="text-sm">{order.product}</span>
                  </div>
                  <div className="flex gap-2">
                    {order.items.map(item => (
                      <span key={item} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{item}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="text-[10px]">{order.progress}</Badge>
                  <Button size="sm" className="bg-secondary/10 text-secondary hover:bg-secondary/20 border-none">
                    <Send className="h-3 w-3 mr-2" /> Issue Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
