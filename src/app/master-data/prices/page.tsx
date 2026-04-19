
"use client"

import { useState } from "react"
import { Tag, Search, Edit2, Loader2, Save, TrendingUp, TrendingDown, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useFirestore, useCollection, useMemoFirebase, useUser, updateDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"

export default function PriceMasterPage() {
  const db = useFirestore()
  const { user } = useUser()
  
  const productsRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, "finished_goods");
  }, [db, user]);

  const materialsRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, "raw_materials");
  }, [db, user]);

  const { data: products, isLoading: productsLoading } = useCollection(productsRef)
  const { data: materials, isLoading: materialsLoading } = useCollection(materialsRef)

  const [searchTerm, setSearchTerm] = useState("")
  const [editingItem, setEditingItem] = useState<any>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const handleUpdatePrice = () => {
    if (!editingItem || !db) return
    const collectionName = editingItem.type === 'product' ? 'finished_goods' : 'raw_materials'
    const docRef = doc(db, collectionName, editingItem.id)
    
    // Update either 'price' (for FG) or 'cost' (for RM)
    const updateData = editingItem.type === 'product' 
      ? { price: Number(editingItem.newValue) } 
      : { cost: Number(editingItem.newValue) }
    
    updateDocumentNonBlocking(docRef, updateData)
    setIsEditOpen(false)
    setEditingItem(null)
  }

  const filteredProducts = products?.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const filteredMaterials = materials?.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Price Master</h1>
          <p className="text-muted-foreground">Manage selling prices and standard material costs.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Price Indices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">Stable</div>
              <Badge variant="outline" className="text-secondary border-secondary/20">Optimal</Badge>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-secondary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cost Variability</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-secondary">
              <TrendingDown className="h-5 w-5" />
              <div className="text-2xl font-bold">-2.4%</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-accent/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sales Margin Est.</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-primary">
              <TrendingUp className="h-5 w-5" />
              <div className="text-2xl font-bold">32.8%</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search items by name..." 
              className="pl-9 bg-muted/20" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="products">
            <TabsList className="w-full flex rounded-none border-b h-12 bg-transparent">
              <TabsTrigger value="products" className="flex-1 rounded-none data-[state=active]:bg-muted/50 data-[state=active]:border-b-2 data-[state=active]:border-primary">Finished Goods</TabsTrigger>
              <TabsTrigger value="materials" className="flex-1 rounded-none data-[state=active]:bg-muted/50 data-[state=active]:border-b-2 data-[state=active]:border-primary">Raw Materials</TabsTrigger>
            </TabsList>
            
            <TabsContent value="products" className="m-0">
              {productsLoading ? (
                <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Product Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Selling Price</TableHead>
                      <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-bold">{p.name}</TableCell>
                        <TableCell><Badge variant="outline">{p.category}</Badge></TableCell>
                        <TableCell className="text-right font-mono font-bold text-primary">
                          ${(p.price || 0).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              setEditingItem({ ...p, type: 'product', newValue: p.price || 0 })
                              setIsEditOpen(true)
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="materials" className="m-0">
              {materialsLoading ? (
                <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Material Name</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead className="text-right">Standard Cost</TableHead>
                      <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMaterials.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell className="font-bold">{m.name}</TableCell>
                        <TableCell className="text-xs uppercase font-bold text-muted-foreground">{m.unit}</TableCell>
                        <TableCell className="text-right font-mono font-bold text-secondary">
                          ${(m.cost || 0).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              setEditingItem({ ...m, type: 'material', newValue: m.cost || 0 })
                              setIsEditOpen(true)
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">Modify Price Master</DialogTitle>
            <DialogDescription>Update the master value for this item. Changes apply globally.</DialogDescription>
          </DialogHeader>
          {editingItem && (
            <div className="grid gap-6 py-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase text-muted-foreground">Item Name</span>
                <span className="font-black text-lg">{editingItem.name}</span>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price-input" className="font-bold">
                  {editingItem.type === 'product' ? 'New Selling Price ($)' : 'New Standard Cost ($)'}
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="price-input"
                    type="number"
                    step="0.01"
                    className="pl-9 font-mono text-lg font-bold"
                    value={editingItem.newValue}
                    onChange={(e) => setEditingItem({ ...editingItem, newValue: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleUpdatePrice} className="w-full bg-secondary text-secondary-foreground font-bold h-12 shadow-lg">
              <Save className="h-4 w-4 mr-2" /> Update Master Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
