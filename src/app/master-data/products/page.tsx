
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Search, MoreVertical, Edit2, Trash2, Loader2, Save, Hash, Calculator, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking, useUser } from "@/firebase"
import { collection, doc } from "firebase/firestore"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { useTranslation } from "@/context/language-context"

const CONSISTENT_PRODUCTS = [
  "Original Cheese Stick",
  "Long Potato",
  "Chicken PopCorn",
  "Sausage Cheese Stick"
];

export default function ProductsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const db = useFirestore()
  const { user, isUserLoading: isAuthLoading } = useUser()

  const productsRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, "finished_goods");
  }, [db, user]);

  const { data: products, isLoading: isDataLoading } = useCollection(productsRef)

  const [searchTerm, setSearchTerm] = useState("")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  
  const [newProduct, setNewProduct] = useState({
    code: "",
    name: "",
    category: "Finished Good",
    price: 0,
    stock: 0,
    laborCost: 0,
    overhead: 0
  })

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push("/login");
    }
  }, [user, isAuthLoading, router]);

  const handleAddProduct = () => {
    if (!newProduct.name || !productsRef) return
    addDocumentNonBlocking(productsRef, {
      ...newProduct,
      price: Number(newProduct.price),
      stock: Number(newProduct.stock),
      laborCost: Number(newProduct.laborCost),
      overhead: Number(newProduct.overhead),
      createdAt: new Date().toISOString()
    })
    setIsAddOpen(false)
    setNewProduct({ code: "", name: "", category: "Finished Good", price: 0, stock: 0, laborCost: 0, overhead: 0 })
  }

  const handleUpdateProduct = () => {
    if (!editingProduct || !db) return
    const docRef = doc(db, "finished_goods", editingProduct.id)
    updateDocumentNonBlocking(docRef, {
      code: editingProduct.code,
      category: editingProduct.category,
      price: Number(editingProduct.price),
      stock: Number(editingProduct.stock),
      laborCost: Number(editingProduct.laborCost),
      overhead: Number(editingProduct.overhead)
    })
    setIsEditOpen(false)
    setEditingProduct(null)
  }

  const handleDeleteProduct = (id: string) => {
    deleteDocumentNonBlocking(doc(db, "finished_goods", id))
  }

  const filteredProducts = products?.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.code && p.code.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || []

  if (isAuthLoading || !user) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline">{t("finishedGoods")}</h1>
          <p className="text-muted-foreground">Catalog of all produced snacks and standard costing (MMK).</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" /> {t("add")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Finished Good</DialogTitle>
              <DialogDescription>Define a new product and its standard operational costs.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="code">{t("code")}</Label>
                  <Input id="code" value={newProduct.code} onChange={(e) => setNewProduct({...newProduct, code: e.target.value.toUpperCase()})} placeholder="e.g. FG-1001" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="name">{t("name")}</Label>
                  <Select onValueChange={(v) => setNewProduct({...newProduct, name: v})} defaultValue={newProduct.name}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONSISTENT_PRODUCTS.map(prod => <SelectItem key={prod} value={prod}>{prod}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price">{t("sellingPrice")} (MMK)</Label>
                  <Input id="price" type="number" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: Number(e.target.value)})} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="stock">{t("stock")}</Label>
                  <Input id="stock" type="number" value={newProduct.stock} onChange={(e) => setNewProduct({...newProduct, stock: Number(e.target.value)})} />
                </div>
              </div>

              <div className="p-4 bg-muted/20 rounded-xl space-y-4 border border-dashed">
                <h4 className="text-xs font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                  <Calculator className="h-3 w-3" /> Standard Recipe Cost Components
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="labor">{t("laborCost")} (MMK/Unit)</Label>
                    <Input id="labor" type="number" value={newProduct.laborCost} onChange={(e) => setNewProduct({...newProduct, laborCost: Number(e.target.value)})} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="overhead">{t("overhead")} (MMK/Unit)</Label>
                    <Input id="overhead" type="number" value={newProduct.overhead} onChange={(e) => setNewProduct({...newProduct, overhead: Number(e.target.value)})} />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddProduct} className="w-full bg-secondary text-secondary-foreground font-bold h-12">Save Product & Costs</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="p-4 border-b bg-muted/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name or code..." className="pl-9 bg-background" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isDataLoading ? (
            <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>{t("code")}</TableHead>
                  <TableHead>{t("name")}</TableHead>
                  <TableHead className="text-right">{t("sellingPrice")}</TableHead>
                  <TableHead className="text-right">Op. Cost (L+O)</TableHead>
                  <TableHead className="text-right">{t("stock")}</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs font-bold text-primary">
                      {p.code || <span className="text-muted-foreground italic">N/A</span>}
                    </TableCell>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-right font-bold text-primary">MMK {(p.price || 0).toLocaleString()}</TableCell>
                    <TableCell className="text-right font-mono text-xs text-muted-foreground">
                      MMK {((p.laborCost || 0) + (p.overhead || 0)).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-bold">{(p.stock || 0).toLocaleString()}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setEditingProduct(p); setIsEditOpen(true); }}>
                            <Edit2 className="h-4 w-4 mr-2" /> Edit Info
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteProduct(p.id)}>
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredProducts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground italic">
                      No finished goods found. Register your first snack above.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl">Edit Finished Good</DialogTitle>
            <DialogDescription>Modify identification, pricing, and standard operational costs.</DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Product Code</Label>
                  <Input value={editingProduct.code} onChange={(e) => setEditingProduct({...editingProduct, code: e.target.value.toUpperCase()})} />
                </div>
                <div className="grid gap-2">
                  <Label>Product Name</Label>
                  <Input value={editingProduct.name} disabled />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Unit Price (MMK)</Label>
                  <Input type="number" value={editingProduct.price} onChange={(e) => setEditingProduct({...editingProduct, price: Number(e.target.value)})} />
                </div>
                <div className="grid gap-2">
                  <Label>Current Stock</Label>
                  <Input type="number" value={editingProduct.stock} onChange={(e) => setEditingProduct({...editingProduct, stock: Number(e.target.value)})} />
                </div>
              </div>

              <div className="p-4 bg-muted/20 rounded-xl space-y-4 border border-dashed">
                <h4 className="text-xs font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                  <Calculator className="h-3 w-3" /> Standard Recipe Cost Components
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>{t("laborCost")} (MMK/Unit)</Label>
                    <Input type="number" value={editingProduct.laborCost} onChange={(e) => setEditingProduct({...editingProduct, laborCost: Number(e.target.value)})} />
                  </div>
                  <div className="grid gap-2">
                    <Label>{t("overhead")} (MMK/Unit)</Label>
                    <Input type="number" value={editingProduct.overhead} onChange={(e) => setEditingProduct({...editingProduct, overhead: Number(e.target.value)})} />
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleUpdateProduct} className="w-full bg-secondary text-secondary-foreground font-bold h-12">
              <Save className="h-4 w-4 mr-2" /> Update Product & Costs
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
