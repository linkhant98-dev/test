
"use client"

import { useState } from "react"
import { Database, Plus, Search, Trash2, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const initialMaterials = [
  { id: "MAT-001", name: "Raw Milk (Full Cream)", unit: "Liters", category: "Raw Material", stock: 2500 },
  { id: "MAT-002", name: "Sea Salt", unit: "kg", category: "Ingredient", stock: 120 },
  { id: "MAT-003", name: "Rennet Extract", unit: "kg", category: "Ingredient", stock: 15 },
  { id: "MAT-004", name: "Culture Starter", unit: "kg", category: "Ingredient", stock: 8 },
]

export default function MaterialsPage() {
  const [materials, setMaterials] = useState(initialMaterials)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newMaterial, setNewMaterial] = useState({
    name: "",
    unit: "kg",
    category: "Raw Material",
    stock: 0
  })

  const handleAddMaterial = () => {
    const id = `MAT-${String(materials.length + 1).padStart(3, '0')}`
    setMaterials([...materials, { ...newMaterial, id, stock: Number(newMaterial.stock) }])
    setIsAddOpen(false)
    setNewMaterial({ name: "", unit: "kg", category: "Raw Material", stock: 0 })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline text-foreground">Raw Materials</h1>
          <p className="text-muted-foreground">Manage your base ingredients and raw materials.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">
              <Plus className="h-4 w-4 mr-2" /> Add Material
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="font-headline text-xl">Add New Material</DialogTitle>
              <DialogDescription>
                Define a new raw material or ingredient for inventory tracking.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input 
                  id="name" 
                  value={newMaterial.name} 
                  onChange={(e) => setNewMaterial({...newMaterial, name: e.target.value})}
                  className="col-span-3" 
                  placeholder="e.g. Organic Whey"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">Category</Label>
                <Select 
                  onValueChange={(v) => setNewMaterial({...newMaterial, category: v})}
                  defaultValue={newMaterial.category}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Raw Material">Raw Material</SelectItem>
                    <SelectItem value="Ingredient">Ingredient</SelectItem>
                    <SelectItem value="Packaging">Packaging</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="unit" className="text-right">Unit</Label>
                <Select 
                  onValueChange={(v) => setNewMaterial({...newMaterial, unit: v})}
                  defaultValue={newMaterial.unit}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="Liters">Liters</SelectItem>
                    <SelectItem value="units">units</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="stock" className="text-right">Stock</Label>
                <Input 
                  id="stock" 
                  type="number"
                  value={newMaterial.stock} 
                  onChange={(e) => setNewMaterial({...newMaterial, stock: Number(e.target.value)})}
                  className="col-span-3" 
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddMaterial} className="bg-secondary text-secondary-foreground hover:bg-secondary/90">Save Material</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search materials..." className="pl-9 bg-muted/20" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Current Stock</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materials.map((m) => (
                <TableRow key={m.id} className="group transition-colors">
                  <TableCell className="font-mono text-xs font-bold text-muted-foreground">{m.id}</TableCell>
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent text-accent-foreground">
                      {m.category}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-bold">{m.stock.toLocaleString()}</TableCell>
                  <TableCell className="text-muted-foreground">{m.unit}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive/80">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
