
"use client"

import { Database, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const materials = [
  { id: "MAT-001", name: "Raw Milk (Full Cream)", unit: "Liters", category: "Raw Material", stock: 2500 },
  { id: "MAT-002", name: "Sea Salt", unit: "kg", category: "Ingredient", stock: 120 },
  { id: "MAT-003", name: "Rennet Extract", unit: "kg", category: "Ingredient", stock: 15 },
  { id: "MAT-004", name: "Culture Starter", unit: "kg", category: "Ingredient", stock: 8 },
]

export default function MaterialsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline">Raw Materials</h1>
          <p className="text-muted-foreground">Manage your base ingredients and raw materials.</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" /> Add Material
        </Button>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search materials..." className="pl-9" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Current Stock</TableHead>
                <TableHead>Unit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materials.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-mono text-xs">{m.id}</TableCell>
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell>{m.category}</TableCell>
                  <TableCell className="text-right">{m.stock.toLocaleString()}</TableCell>
                  <TableCell>{m.unit}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
