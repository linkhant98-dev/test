
"use client"

import { Package, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const products = [
  { id: "PRD-001", name: "Original Cheese Stick", category: "Finished Good", price: 5.50, stock: 450 },
  { id: "PRD-002", name: "Long Potato", category: "Finished Good", price: 4.50, stock: 890 },
  { id: "PRD-003", name: "Chicken PopCorn", category: "Finished Good", price: 6.00, stock: 120 },
  { id: "PRD-004", name: "Sausage Cheese Stick", category: "Finished Good", price: 6.50, stock: 340 },
]

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline">Finished Goods</h1>
          <p className="text-muted-foreground">Catalog of all produced snacks and products.</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" /> Add Product
        </Button>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search products..." className="pl-9 bg-muted/20" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>ID</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Stock Level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground font-bold">{p.id}</TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.category}</TableCell>
                  <TableCell className="text-right">${p.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right font-bold">{p.stock}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
