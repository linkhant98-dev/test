
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
  Loader2,
  Trash2,
  Calculator,
  Hash,
  Package,
  Boxes,
  User,
  Zap
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
import { useFirestore, useCollection, useMemoFirebase, useUser, addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"
import { useTranslation } from "@/context/language-context"

export default function BOMManagementPage() {
  const { t } = useTranslation();
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
  const { data: rawMaterials } = useCollection(materialsRef)

  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [isAddComponentOpen, setIsAddComponentOpen] = useState(false)
  const [isNewBOMOpen, setIsNewBOMOpen] = useState(false)
  
  const bomsRef = useMemoFirebase(() => {
    if (!user || !selectedProductId) return null;
    return collection(db, "finished_goods", selectedProductId, "bom_versions");
  }, [db, user, selectedProductId]);

  const { data: boms, isLoading: bomsLoading } = useCollection(bomsRef)

  const selectedBOM = boms?.[0] || null
  const selectedProduct = products?.find(p => p.id === selectedProductId)

  // Cost Simulation State (initialized with material standard costs)
  const [simulatedPrices, setSimulatedPrices] = useState<Record<string, number>>({})

  const [newComponent, setNewComponent] = useState({
    name: "",
    code: "",
    qty: 0,
    unit: "kg",
    loss: 0,
    category: "Raw Material"
  })

  const [newBOMData, setNewBOMData] = useState({
    version: "v1.0",
    effDate: new Date().toISOString().split('T')[0]
  })

  const handleAddComponent = () => {
    if (!newComponent.name || !selectedBOM || !selectedProductId || !db) return
    
    const bomDocRef = doc(db, "finished_goods", selectedProductId, "bom_versions", selectedBOM.id)
    const updatedComponents = [...(selectedBOM.components || []), newComponent]
    
    updateDocumentNonBlocking(bomDocRef, {
      components: updatedComponents
    })
    
    setIsAddComponentOpen(false)
    setNewComponent({ name: "", code: "", qty: 0, unit: "kg", loss: 0, category: "Raw Material" })
  }

  const handleDeleteComponent = (index: number) => {
    if (!selectedBOM || !selectedProductId || !db) return
    
    const bomDocRef = doc(db, "finished_goods", selectedProductId, "bom_versions", selectedBOM.id)
    const updatedComponents = selectedBOM.components.filter((_: any, i: number) => i !== index)
    
    updateDocumentNonBlocking(bomDocRef, {
      components: updatedComponents
    })
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

  const simulationResults = useMemo(() => {
    if (!selectedBOM?.components) return { details: [], total: 0, materialTotal: 0, packagingTotal: 0 };

    let materialTotal = 0;
    let packagingTotal = 0;

    const details = selectedBOM.components.map((comp: any) => {
      // Pull price from simulation state OR from the raw materials master data
      const masterMaterial = rawMaterials?.find(m => m.name === comp.name || m.code === comp.code);
      const price = simulatedPrices[comp.name] !== undefined ? simulatedPrices[comp.name] : (masterMaterial?.cost || 0);
      
      const qtyWithLoss = comp.qty * (1 + (comp.loss || 0) / 100);
      const subtotal = qtyWithLoss * price;
      
      if (comp.category === 'Packaging') {
        packagingTotal += subtotal;
      } else {
        materialTotal += subtotal;
      }

      return {
        ...comp,
        price,
        subtotal
      };
    });

    const labor = selectedProduct?.laborCost || 0;
    const overhead = selectedProduct?.overhead || 0;
    const productionTotal = materialTotal + packagingTotal + labor + overhead;

    return { details, total: productionTotal, materialTotal, packagingTotal, labor, overhead };
  }, [selectedBOM, simulatedPrices, selectedProduct, rawMaterials]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-foreground">{t("bomManagement")}</h1>
          <p className="text-muted-foreground">Manage multi-version Bill of Materials and calculate Standard Recipe Cost.</p>
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
                  <span className="text-xs font-bold text-primary uppercase tracking-tighter">
                    {prod.code || 'NO CODE'}
                  </span>
                  <span className="text-sm font-bold">{prod.name}</span>
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
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20">
                      {products?.find(p => p.id === selectedProductId)?.code || 'UNCODED'}
                    </span>
                    <CardTitle className="font-headline text-2xl">{products?.find(p => p.id === selectedProductId)?.name}</CardTitle>
                  </div>
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
                      <TabsTrigger value="components">Recipe Components</TabsTrigger>
                      <TabsTrigger value="simulation">Production Cost Synthesis</TabsTrigger>
                    </TabsList>
                    <TabsContent value="components" className="space-y-6">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">BOM Components</h3>
                        <Dialog open={isAddComponentOpen} onOpenChange={setIsAddComponentOpen}>
                          <DialogTrigger asChild>
                            <Button size="sm" className="bg-secondary text-secondary-foreground">
                              <Plus className="h-4 w-4 mr-2" /> Add Component
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle className="font-headline text-xl">Add BOM Component</DialogTitle>
                              <DialogDescription>Add a raw material or ingredient to this BOM version.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label>Material</Label>
                                <Select onValueChange={(v) => {
                                  const mat = rawMaterials?.find(m => m.id === v);
                                  setNewComponent({...newComponent, name: mat?.name || "", code: mat?.code || "", category: mat?.category === 'Packaging' ? 'Packaging' : 'Raw Material'});
                                }}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select material" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {rawMaterials?.map(mat => (
                                      <SelectItem key={mat.id} value={mat.id}>
                                        <span className="font-mono font-bold mr-2">[{mat.code || 'N/A'}]</span>
                                        {mat.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                  <Label>Standard Quantity</Label>
                                  <Input 
                                    type="number" 
                                    step="0.001"
                                    value={newComponent.qty}
                                    onChange={(e) => setNewComponent({...newComponent, qty: Number(e.target.value)})}
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label>Unit</Label>
                                  <Select onValueChange={(v) => setNewComponent({...newComponent, unit: v})} defaultValue={newComponent.unit}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="kg">kg</SelectItem>
                                      <SelectItem value="L">L</SelectItem>
                                      <SelectItem value="units">units</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div className="grid gap-2">
                                <Label>Expected Loss (%)</Label>
                                <Input 
                                  type="number" 
                                  value={newComponent.loss}
                                  onChange={(e) => setNewComponent({...newComponent, loss: Number(e.target.value)})}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button onClick={handleAddComponent} className="w-full bg-primary text-primary-foreground font-bold h-12">Save Component</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>

                      <div className="rounded-xl border overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/50 border-b">
                            <tr>
                              <th className="text-left p-3 font-bold uppercase text-[10px] tracking-widest text-muted-foreground">Type</th>
                              <th className="text-left p-3 font-bold uppercase text-[10px] tracking-widest text-muted-foreground">Material Name</th>
                              <th className="text-right p-3 font-bold uppercase text-[10px] tracking-widest text-muted-foreground">Qty (Gross)</th>
                              <th className="text-right p-3 font-bold uppercase text-[10px] tracking-widest text-muted-foreground">Unit Cost</th>
                              <th className="text-right p-3 font-bold uppercase text-[10px] tracking-widest text-muted-foreground">Line Total</th>
                              <th className="w-[50px]"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {simulationResults.details?.length > 0 ? (
                              simulationResults.details.map((comp: any, i: number) => (
                                <tr key={i} className="hover:bg-muted/20 group">
                                  <td className="p-3">
                                    <Badge variant="outline" className={`text-[9px] ${comp.category === 'Packaging' ? 'text-blue-600 bg-blue-50' : 'text-amber-600 bg-amber-50'}`}>
                                      {comp.category === 'Packaging' ? <Boxes className="h-2 w-2 mr-1" /> : <Package className="h-2 w-2 mr-1" />}
                                      {comp.category}
                                    </Badge>
                                  </td>
                                  <td className="p-3">
                                    <span className="font-medium block">{comp.name}</span>
                                    <span className="text-[10px] text-muted-foreground font-mono">{comp.code || 'N/A'}</span>
                                  </td>
                                  <td className="p-3 text-right">
                                    <div className="flex flex-col items-end">
                                      <span className="font-bold">{comp.qty} {comp.unit}</span>
                                      {comp.loss > 0 && <span className="text-[8px] text-muted-foreground">+{comp.loss}% loss</span>}
                                    </div>
                                  </td>
                                  <td className="p-3 text-right font-mono text-xs text-muted-foreground">
                                    MMK {comp.price.toLocaleString()}
                                  </td>
                                  <td className="p-3 text-right font-black font-mono text-primary">
                                    MMK {comp.subtotal.toLocaleString()}
                                  </td>
                                  <td className="p-3">
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => handleDeleteComponent(i)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={6} className="p-8 text-center text-muted-foreground italic">
                                  No components defined for this BOM version yet.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {simulationResults.details.length > 0 && (
                        <div className="flex justify-end p-6 bg-secondary/5 rounded-2xl border-2 border-dashed border-secondary/10">
                          <div className="text-right">
                            <span className="text-[10px] font-black uppercase text-secondary tracking-[0.2em] block mb-1">Total Raw Material Cost</span>
                            <div className="flex items-baseline justify-end gap-2">
                               <span className="text-[10px] font-bold text-muted-foreground uppercase">MMK</span>
                               <span className="text-3xl font-black font-headline text-secondary tracking-tighter">
                                 {(simulationResults.materialTotal + simulationResults.packagingTotal).toLocaleString()}
                               </span>
                            </div>
                            <p className="text-[9px] text-muted-foreground mt-2 font-medium italic">
                              * Sum of all material and packaging components adjusted for yield loss.
                            </p>
                          </div>
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="simulation" className="space-y-6">
                       <div className="bg-accent/10 rounded-2xl p-8 border border-primary/20">
                         <div className="flex justify-between items-start mb-8">
                            <div className="space-y-1">
                              <h4 className="font-headline text-2xl font-bold flex items-center gap-3 text-secondary">
                                <Calculator className="h-6 w-6" />
                                Production Cost Synthesis
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Full landed cost breakdown for <strong>1 unit</strong> of {selectedProduct?.name}.
                              </p>
                            </div>
                            <div className="text-right">
                               <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">Selling Price</span>
                               <span className="text-xl font-black text-primary">MMK {(selectedProduct?.price || 0).toLocaleString()}</span>
                            </div>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                            <div className="space-y-4">
                               <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
                                  <span>Material Component Cost</span>
                                  <span>Price / Unit</span>
                               </div>
                               <div className="space-y-3">
                                {simulationResults.details?.map((comp: any, i: number) => (
                                  <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl border shadow-sm group hover:border-primary/50 transition-colors">
                                    <div className="flex-1">
                                      <span className="text-xs font-bold block">{comp.name}</span>
                                      <span className="text-[9px] text-muted-foreground font-mono">[{comp.code}] Qty: {comp.qty} {comp.unit}</span>
                                    </div>
                                    <div className="flex items-center gap-2 w-36">
                                      <div className="relative">
                                         <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[8px] font-black text-muted-foreground">MMK</span>
                                         <Input 
                                          type="number"
                                          className="h-8 pl-8 text-right font-mono text-xs border-none bg-muted/30 focus:bg-white"
                                          value={comp.price || ""}
                                          onChange={(e) => setSimulatedPrices({
                                            ...simulatedPrices,
                                            [comp.name]: Number(e.target.value)
                                          })}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                               </div>
                            </div>

                            <div className="space-y-6">
                               <div className="grid grid-cols-2 gap-4">
                                  <Card className="bg-white border-none shadow-sm p-4">
                                     <div className="flex items-center gap-2 text-[10px] font-black uppercase text-amber-600 mb-2">
                                        <Package className="h-3 w-3" /> Raw Material
                                     </div>
                                     <div className="text-lg font-black font-mono">MMK {simulationResults.materialTotal.toLocaleString()}</div>
                                  </Card>
                                  <Card className="bg-white border-none shadow-sm p-4">
                                     <div className="flex items-center gap-2 text-[10px] font-black uppercase text-blue-600 mb-2">
                                        <Boxes className="h-3 w-3" /> Packaging
                                     </div>
                                     <div className="text-lg font-black font-mono">MMK {simulationResults.packagingTotal.toLocaleString()}</div>
                                  </Card>
                                  <Card className="bg-white border-none shadow-sm p-4 ring-2 ring-primary/20">
                                     <div className="flex items-center gap-2 text-[10px] font-black uppercase text-indigo-600 mb-2">
                                        <User className="h-3 w-3" /> Labor Cost
                                     </div>
                                     <div className="text-lg font-black font-mono">MMK {(selectedProduct?.laborCost || 0).toLocaleString()}</div>
                                     <p className="text-[8px] text-muted-foreground mt-1">* Persisted in Product Master</p>
                                  </Card>
                                  <Card className="bg-white border-none shadow-sm p-4 ring-2 ring-primary/20">
                                     <div className="flex items-center gap-2 text-[10px] font-black uppercase text-rose-600 mb-2">
                                        <Zap className="h-3 w-3" /> Overhead
                                     </div>
                                     <div className="text-lg font-black font-mono">MMK {(selectedProduct?.overhead || 0).toLocaleString()}</div>
                                     <p className="text-[8px] text-muted-foreground mt-1">* Persisted in Product Master</p>
                                  </Card>
                               </div>

                               <div className="pt-8 border-t-2 border-primary/20 space-y-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                      <span className="text-xs font-black uppercase text-secondary tracking-[0.2em]">{t("productionCost")}</span>
                                      <span className="text-[10px] text-muted-foreground uppercase font-bold">Standard Recipe Synthesis</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                       <span className="text-4xl font-black font-headline text-secondary tracking-tighter">
                                         MMK {simulationResults.total.toLocaleString()}
                                       </span>
                                       <Badge className="bg-primary/20 text-primary text-[10px] font-black mt-1">
                                          {selectedProduct?.price > 0 ? `${((simulationResults.total / selectedProduct.price) * 100).toFixed(1)}% of SRP` : '0%'}
                                       </Badge>
                                    </div>
                                  </div>
                               </div>
                               <p className="text-[10px] text-muted-foreground bg-white/50 p-3 rounded-lg border border-dashed text-center">
                                  Landed cost is dynamically calculated based on current material costs + defined labor and overhead components.
                               </p>
                            </div>
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
