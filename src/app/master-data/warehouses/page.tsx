
"use client"

import { useState } from "react"
import { Warehouse as WarehouseIcon, Plus, Search, MapPin, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, useUser } from "@/firebase"
import { collection } from "firebase/firestore"
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

export default function WarehousesPage() {
  const db = useFirestore()
  const { user } = useUser()
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newWarehouse, setNewWarehouse] = useState({
    name: "",
    location: "",
    capacity: "0%"
  })

  const warehousesRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, "warehouses");
  }, [db, user]);

  const { data: warehouses, isLoading } = useCollection(warehousesRef)

  const handleAddWarehouse = () => {
    if (!newWarehouse.name || !warehousesRef) return
    addDocumentNonBlocking(warehousesRef, {
      ...newWarehouse,
      status: "Active",
      createdAt: new Date().toISOString()
    })
    setIsAddOpen(false)
    setNewWarehouse({ name: "", location: "", capacity: "0%" })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline text-foreground">Warehouses</h1>
          <p className="text-muted-foreground">Manage physical storage locations and monitor their capacity.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" /> New Warehouse
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Warehouse</DialogTitle>
              <DialogDescription>Define a storage location.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Warehouse Name</Label>
                <Input id="name" value={newWarehouse.name} onChange={(e) => setNewWarehouse({...newWarehouse, name: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Location / Building</Label>
                <Input id="location" value={newWarehouse.location} onChange={(e) => setNewWarehouse({...newWarehouse, location: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="capacity">Current Capacity (%)</Label>
                <Input id="capacity" placeholder="e.g. 50%" value={newWarehouse.capacity} onChange={(e) => setNewWarehouse({...newWarehouse, capacity: e.target.value})} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddWarehouse}>Save Warehouse</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="p-12 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {warehouses?.map((wh) => (
            <Card key={wh.id} className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <WarehouseIcon className="h-5 w-5 text-primary" />
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
                      style={{ width: wh.capacity || '0%' }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {!isLoading && warehouses?.length === 0 && (
            <div className="col-span-full py-20 text-center border-2 border-dashed rounded-3xl text-muted-foreground">
              No warehouses found. Seed demo data from Dashboard.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
