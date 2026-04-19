
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Database, Plus, Search, Trash2, Edit2, MoreVertical, Archive, Loader2 } from "lucide-react"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking, useUser } from "@/firebase"
import { collection, doc } from "firebase/firestore"

export default function MaterialsPage() {
  const router = useRouter();
  const db = useFirestore()
  const { user, isUserLoading: isAuthLoading } = useUser()
  
  const materialsRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, "raw_materials");
  }, [db, user]);
  
  const { data: materials, isLoading: isDataLoading } = useCollection(materialsRef)

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [newMaterial, setNewMaterial] = useState({
    name: "",
    unit: "kg",
    category: "Raw Material",
    stock: 0
  })

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push("/login");
    }
  }, [user, isAuthLoading, router]);

  const handleAddMaterial = () => {
    if (!newMaterial.name || !materialsRef) return
    addDocumentNonBlocking(materialsRef, {
      ...newMaterial,
      stock: Number(newMaterial.stock),
      createdAt: new Date().toISOString()
    })
    setIsAddOpen(false)
    setNewMaterial({ name: "", unit: "kg", category: "Raw Material", stock: 0 })
  }

  const handleDeleteMaterial = (id: string) => {
    const docRef = doc(db, "raw_materials", id)
    deleteDocumentNonBlocking(docRef)
  }

  const filteredMaterials = materials?.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.category.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold font-headline text-foreground">Raw Materials</h1>
          <p className="text-muted-foreground">Manage ingredients and base materials for snacks.</p>
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
                <Select 
                  onValueChange={(v) => setNewMaterial({...newMaterial, name: v})}
                  defaultValue={newMaterial.name}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select or type material" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mozzarella Cheese">Mozzarella Cheese</SelectItem>
                    <SelectItem value="Potato Starch">Potato Starch</SelectItem>
                    <SelectItem value="Chicken Breast (Minced)">Chicken Breast (Minced)</SelectItem>
                    <SelectItem value="Premium Sausage">Premium Sausage</SelectItem>
                    <SelectItem value="Batter Mix">Batter Mix</SelectItem>
                    <SelectItem value="Breadcrumbs">Breadcrumbs</SelectItem>
                    <SelectItem value="Frying Oil">Frying Oil</SelectItem>
                    <SelectItem value="Seasoning Powder">Seasoning Powder</SelectItem>
                    <SelectItem value="Sea Salt">Sea Salt</SelectItem>
                  </SelectContent>
                </Select>
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
            <Input 
              placeholder="Search materials..." 
              className="pl-9 bg-muted/20" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isDataLoading ? (
            <div className="p-12 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Current Stock</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMaterials.map((m) => (
                  <TableRow key={m.id} className="group transition-colors">
                    <TableCell className="font-mono text-xs font-bold text-muted-foreground">{m.id.slice(-5)}</TableCell>
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent text-accent-foreground">
                        {m.category}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-bold">{m.stock.toLocaleString()}</TableCell>
                    <TableCell className="text-muted-foreground">{m.unit}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Edit2 className="h-4 w-4 mr-2" /> Edit Info
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Archive className="h-4 w-4 mr-2" /> Archive
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeleteMaterial(m.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {!isDataLoading && filteredMaterials.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground italic">
                      No materials found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
