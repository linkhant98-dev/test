
"use client"

import { Warehouse, Plus, Search, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const warehouses = [
  { id: "WH-01", name: "Main Cold Storage", location: "Building A, West Wing", status: "Active", capacity: "85%" },
  { id: "WH-02", name: "Raw Material Depot", location: "Building B, South Gate", status: "Active", capacity: "40%" },
  { id: "WH-03", name: "Packaging Warehouse", location: "Building A, Floor 2", status: "Active", capacity: "65%" },
  { id: "WH-04", name: "Finished Goods Bay", location: "Logistics Hub, Dock 4", status: "Active", capacity: "92%" },
]

export default function WarehousesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline text-foreground">Warehouses</h1>
          <p className="text-muted-foreground">Manage physical storage locations and monitor their capacity.</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" /> New Warehouse
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {warehouses.map((wh) => (
          <Card key={wh.id} className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Warehouse className="h-5 w-5 text-primary" />
              <Badge variant="secondary" className="bg-secondary/10 text-secondary border-none">{wh.status}</Badge>
            </CardHeader>
            <CardContent>
              <h3 className="text-lg font-bold font-headline mb-1">{wh.name}</h3>
              <div className="flex items-center text-xs text-muted-foreground mb-4">
                <MapPin className="h-3 w-3 mr-1" /> {wh.location}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase text-muted-foreground">
                  <span>Capacity Used</span>
                  <span>{wh.capacity}</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary" 
                    style={{ width: wh.capacity }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
