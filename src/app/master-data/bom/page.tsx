
"use client"

import { useState, useMemo } from "react"
import { 
  Plus, 
  Search, 
  ChevronRight, 
  DollarSign,
  Calendar,
  TrendingUp,
  Copy,
  Save,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { useFirestore, useCollection, useMemoFirebase, useUser, addDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"

const CONSISTENT_PRODUCTS = [
  "Original Cheese Stick",
  "Long Potato",
  "Chicken PopCorn",
  "Sausage Cheese Stick"
];

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

export default function BOMManagementPage() {
  const db = useFirestore()
  const { user } = useUser()

  const productsRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, "finished_goods");
  }, [db, user]);

  const { data: products, isLoading: productsLoading } = useCollection(productsRef)

  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [isAddComponentOpen, setIsAddComponentOpen] = useState(false)
  const [isNewBOMOpen, setIsNewBOMOpen] = useState(false)
  
  const bomsRef = useMemoFirebase(() => {
    if (!user || !selectedProductId) return null;
    return collection(db, "finished_goods", selectedProductId, "bom_versions");
  }, [db, user, selectedProductId]);

  const { data: boms, isLoading: bomsLoading } = useCollection(bomsRef)

  const selectedBOM = boms?.[0] || null

  const [newComponent, setNewComponent] = useState({
    name: "",
    qty: 0,
    unit: "kg",
    loss: 0
  })

  const [newBOMData, setNewBOMData] = useState({
    product: CONSISTENT_PRODUCTS[0],
    version: "v1.0",
    effDate: new Date().toISOString().split('T')[0]
  })

  const handleAddComponent = () => {
    if (!newComponent.name || !selectedBOM) return
    
    // Logic to update components in BOM (simplified for MVP: push to current BOM doc)
    // In a real app, this would be a more complex field update
    setIsAddComponentOpen(false)
  }

  const handleCreateNewBOM = () => {
    if (!selectedProductId || !bomsRef) return
    addDocumentNonBlocking(bomsRef, {
      version: newBOMData.version,
      status: "Active",
      effDate: newBOMData.effDate,
      finishedGoodId: selectedProductId,
      components: []
    })
    setIsNewBOMOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-foreground">BOM Management</h1>
          <p className="text-muted-foreground">Manage multi-version Bill of Materials and simulate production costs.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Copy className="h-4 w-4 mr-2" />
            Clone Version
          </Button>
          
          <Dialog open={isNewBOMOpen} onOpenChange={setIsNewBOMOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={!selectedProductId}>
                <Plus className="h-4 w-4 mr-2" />
                New BOM
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="font-headline text-xl">Create New BOM</DialogTitle>
                <DialogDescription>
                  Define a new version of Bill of Materials for the selected finished good.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Version Identifier</Label>
                  <Input 
                    value={newBOMData.version}
                    onChange={(e) => setNewBOMData({...newBOMData, version: e.target.value})}
                    placeholder="e.g. v1.2, Seasonal A"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Effective Start Date</Label>
                  <Input 
                    type="date"
                    value={newBOMData.effDate}
                    onChange={(e) => setNewBOMData({...newBOMData, effDate: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateNewBOM} className="w-full bg-secondary text-secondary-foreground">
                  <Plus className="h-4 w-4 mr-2" /> Create BOM Version
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-4 border-none shadow-sm h-fit">
          <CardHeader className="pb-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search products..." className="pl-9 bg-muted/30" />
            </div>
          </CardHeader>
          <div className="divide-y max-h-[600px] overflow-y-auto">
            {productsLoading ? (
               <div className="p-8 flex justify-center"><Loader2 className="h-4 w-4 animate-spin" /></div>
            ) : products?.map((prod) => (
              <div 
                key={prod.id} 
                className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors flex items-center justify-between ${selectedProductId === prod.id ? 'bg-accent/40 border-l-4 border-primary' : ''}`}
                onClick={() => setSelectedProductId(prod.id)}
              >
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold">{prod.name}</span>
                  <span className="text-[10px] text-muted-foreground uppercase">{prod.id.slice(-5)}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </Card>

        <div className="lg:col-span-8 space-y-6">
          {!selectedProductId ? (
            <Card className="border-none shadow-sm h-64 flex flex-col items-center justify-center text-muted-foreground italic bg-muted/20">
              Select a finished good from the list to manage its BOM.
            </Card>
          ) : bomsLoading ? (
            <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <Card className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                <div className="flex flex-col gap-1">
                  <CardTitle className="font-headline text-2xl">{products?.find(p => p.id === selectedProductId)?.name}</CardTitle>
                  {selectedBOM ? (
                    <div className="flex items-center gap-4">
                      <Badge className={selectedBOM.status === 'Active' ? 'bg-secondary' : 'bg-muted'}>{selectedBOM.status}</Badge>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        Effective: {selectedBOM.effDate}
                      </div>
                      <div className="font-mono text-xs font-bold bg-muted px-2 py-1 rounded">Version: {selectedBOM.version}</div>
                    </div>
                  ) : <span className="text-xs text-muted-foreground">No active BOM version found.</span>}
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {selectedBOM ? (
                  <Tabs defaultValue="components">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="components">Components</TabsTrigger>
                      <TabsTrigger value="simulation">Cost Simulation</TabsTrigger>
                    </TabsList>
                    <TabsContent value="components" className="space-y-4">
                      <div className="rounded-lg border overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/50 border-b">
                            <tr>
                              <th className="text-left p-3 font-semibold">Material</th>
                              <th className="text-right p-3 font-semibold">Quantity</th>
                              <th className="text-left p-3 font-semibold">Unit</th>
                              <th className="text-right p-3 font-semibold">Loss %</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {selectedBOM.components?.length > 0 ? (
                              selectedBOM.components.map((comp: any, i: number) => (
                                <tr key={i} className="hover:bg-muted/20">
                                  <td className="p-3 font-medium">{comp.name}</td>
                                  <td className="p-3 text-right">{comp.qty}</td>
                                  <td className="p-3">{comp.unit}</td>
                                  <td className="p-3 text-right text-muted-foreground">{comp.loss}%</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={4} className="p-8 text-center text-muted-foreground italic">
                                  No components defined for this BOM version yet.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </TabsContent>
                    <TabsContent value="simulation">
                       <div className="bg-accent/20 rounded-xl p-6 border border-primary/20">
                         <h4 className="font-headline font-bold mb-4 flex items-center gap-2 text-secondary">
                           <TrendingUp className="h-4 w-4" />
                           Market Price Fluctuation Simulation
                         </h4>
                         <p className="text-xs text-muted-foreground mb-6">
                           Simulate how changes in raw material costs impact the final snack cost roll-up.
                         </p>
                         <div className="mt-8 pt-6 border-t border-primary/10 flex items-center justify-between">
                           <span className="text-sm font-bold text-muted-foreground uppercase">Projected Unit Cost</span>
                           <span className="text-2xl font-bold text-foreground">$1.45</span>
                         </div>
                       </div>
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="py-12 text-center text-muted-foreground italic">
                    Use the button above to create the first BOM version for this product.
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
