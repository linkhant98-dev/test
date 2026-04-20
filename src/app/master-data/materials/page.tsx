"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Search, Trash2, Edit2, MoreVertical, Archive, Loader2, Save, Hash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
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
import { useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking, useUser } from "@/firebase"
import { collection, doc } from "firebase/firestore"

const CONSISTENT_MATERIALS = [
  "Mozzarella Cheese",
  "Potato Starch",
  "Chicken Breast (Minced)",
  "Premium Sausage",
  "Batter Mix",
  "Breadcrumbs",
  "Frying Oil",
  "Seasoning Powder",
  "Sea Salt"
];

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
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [newMaterial, setNewMaterial] = useState({
    code: "",
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
      code: newMaterial.code.toUpperCase(),
      stock: Number(newMaterial.stock),
      createdAt: new Date().toISOString()
    })
    setIsAddOpen(false)
    setNewMaterial({ code: "", name: "", unit: "kg", category: "Raw Material", stock: 0 })
  }

  const handleUpdateMaterial = () => {
    if (!editingMaterial || !db) return
    const docRef = doc(db, "raw_materials", editingMaterial.id)
    updateDocumentNonBlocking(docRef, {
      code: editingMaterial.code.toUpperCase(),
      name: editingMaterial.name,
      unit: editingMaterial.unit,
      category: editingMaterial.category,
      stock: Number(editingMaterial.stock)
    })
    setIsEditOpen(false)
    setEditingMaterial(null)
  }

  const handleDeleteMaterial = (id: string) => {
    const docRef = doc(db, "raw_materials", id)
    deleteDocumentNonBlocking(docRef)
  }

  const filteredMaterials = materials?.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (m.code && m.code.toLowerCase().includes(searchTerm.toLowerCase()))
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
              <DialogDescription>Define a new raw material or ingredient.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Material Code</Label>
                <Input value={newMaterial.code} onChange={(e) => setNewMaterial({...newMaterial, code: e.target.value})} placeholder="e.g. MAT-MOZ-01" />
              </div>
              <div className="grid gap-2">
                <Label>Name</Label>
                <Select onValueChange={(v) => setNewMaterial({...newMaterial, name: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select material" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONSISTENT_MATERIALS.map(mat => <SelectItem key={mat} value={mat}>{mat}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Category</Label>
                  <Select onValueChange={(v) => setNewMaterial({...newMaterial, category: v})} defaultValue={newMaterial.category}>
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Raw Material">Raw Material</SelectItem>
                      <SelectItem value="Ingredient">Ingredient</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Unit</Label>
                  <Select onValueChange={(v) => setNewMaterial({...newMaterial, unit: v})} defaultValue={newMaterial.unit}>
                    <SelectTrigger>
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="L">Liters</SelectItem>
                      <SelectItem value="units">units</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Initial Stock</Label>
                <Input type="number" value={newMaterial.stock} onChange={(e) => setNewMaterial({...newMaterial, stock: Number(e.target.value)})} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddMaterial} className="w-full bg-secondary text-secondary-foreground">Save Material</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search materials by name or code..." className="pl-9 bg-muted/20" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isDataLoading ? (
            <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMaterials.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-mono text-xs font-bold text-secondary">{m.code || 'N/A'}</TableCell>
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{m.category}</Badge></TableCell>
                    <TableCell className="text-right font-bold">{(m.stock || 0).toLocaleString()}</TableCell>
                    <TableCell className="text-muted-foreground">{m.unit}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setEditingMaterial(m); setIsEditOpen(true); }}>
                            <Edit2 className="h-4 w-4 mr-2" /> Edit Info
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteMaterial(m.id)}>
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl">Edit Material</DialogTitle>
            <DialogDescription>Modify raw material details and stock levels.</DialogDescription>
          </DialogHeader>
          {editingMaterial && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Material Code</Label>
                <Input value={editingMaterial.code} onChange={(e) => setEditingMaterial({...editingMaterial, code: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label>Name</Label>
                <Input value={editingMaterial.name} disabled />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Category</Label>
                  <Select value={editingMaterial.category} onValueChange={(v) => setEditingMaterial({...editingMaterial, category: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Raw Material">Raw Material</SelectItem>
                      <SelectItem value="Ingredient">Ingredient</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Unit</Label>
                  <Select value={editingMaterial.unit} onValueChange={(v) => setEditingMaterial({...editingMaterial, unit: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="L">Liters</SelectItem>
                      <SelectItem value="units">units</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Current Stock</Label>
                <Input type="number" value={editingMaterial.stock} onChange={(e) => setEditingMaterial({...editingMaterial, stock: Number(e.target.value)})} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleUpdateMaterial} className="w-full bg-secondary text-secondary-foreground">
              <Save className="h-4 w-4 mr-2" /> Update Material
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
