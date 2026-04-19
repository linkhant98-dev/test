
"use client"

import { useState } from "react"
import { 
  Tag, 
  Search, 
  Edit2, 
  Loader2, 
  Save, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Plus,
  Trash2,
  CalendarRange,
  Users
} from "lucide-react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useFirestore, useCollection, useMemoFirebase, useUser, updateDocumentNonBlocking, addDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"

const CUSTOMER_TYPES = ["Retailer", "Wholesaler", "Distributor", "Corporate"];

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

  // Sub-collection for price rules
  const priceRulesRef = useMemoFirebase(() => {
    if (!user || !editingItem || editingItem.type !== 'product') return null;
    return collection(db, "finished_goods", editingItem.id, "price_rules");
  }, [db, user, editingItem]);

  const { data: priceRules, isLoading: rulesLoading } = useCollection(priceRulesRef)

  const [newRule, setNewRule] = useState({
    customerType: "Retailer",
    price: 0,
    validFrom: new Date().toISOString().split('T')[0],
    validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  })

  const handleUpdateBasePrice = () => {
    if (!editingItem || !db) return
    const collectionName = editingItem.type === 'product' ? 'finished_goods' : 'raw_materials'
    const docRef = doc(db, collectionName, editingItem.id)
    
    const updateData = editingItem.type === 'product' 
      ? { price: Number(editingItem.newValue) } 
      : { cost: Number(editingItem.newValue) }
    
    updateDocumentNonBlocking(docRef, updateData)
    if (editingItem.type === 'material') {
      setIsEditOpen(false)
      setEditingItem(null)
    }
  }

  const handleAddRule = () => {
    if (!priceRulesRef || !newRule.price) return
    addDocumentNonBlocking(priceRulesRef, {
      ...newRule,
      price: Number(newRule.price),
      createdAt: new Date().toISOString()
    })
    setNewRule({
      customerType: "Retailer",
      price: 0,
      validFrom: new Date().toISOString().split('T')[0],
      validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    })
  }

  const handleDeleteRule = (ruleId: string) => {
    if (!priceRulesRef) return
    const ruleDocRef = doc(db, "finished_goods", editingItem.id, "price_rules", ruleId)
    deleteDocumentNonBlocking(ruleDocRef)
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
          <h1 className="text-3xl font-bold font-headline tracking-tight">Price Master</h1>
          <p className="text-muted-foreground">Manage multi-tier selling prices and standard material costs (MMK).</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Pricing Tiers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <div className="text-2xl font-bold">4 Active Classes</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-secondary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Market Fluctuations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-secondary">
              <TrendingUp className="h-5 w-5" />
              <div className="text-2xl font-bold">Stable (0.0%)</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-accent/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Global Margin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-primary">
              <div className="text-2xl font-bold">32.8%</div>
              <Badge variant="outline" className="text-[10px]">Estimated</Badge>
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
              <TabsTrigger value="products" className="flex-1 rounded-none data-[state=active]:bg-muted/50 data-[state=active]:border-b-2 data-[state=active]:border-primary">Finished Goods Pricing</TabsTrigger>
              <TabsTrigger value="materials" className="flex-1 rounded-none data-[state=active]:bg-muted/50 data-[state=active]:border-b-2 data-[state=active]:border-primary">Raw Material Costs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="products" className="m-0">
              {productsLoading ? (
                <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Product Name</TableHead>
                      <TableHead>Base Price</TableHead>
                      <TableHead>Pricing Tiers</TableHead>
                      <TableHead className="w-[120px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-bold">{p.name}</TableCell>
                        <TableCell className="font-mono font-bold text-primary">
                          MMK {(p.price || 0).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-muted/50 text-[10px]">Active Rules</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="h-8 gap-2"
                            onClick={() => {
                              setEditingItem({ ...p, type: 'product', newValue: p.price || 0 })
                              setIsEditOpen(true)
                            }}
                          >
                            <Edit2 className="h-3.5 w-3.5" /> Manage
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
                          MMK {(m.cost || 0).toLocaleString()}
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
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">Manage Pricing: {editingItem?.name}</DialogTitle>
            <DialogDescription>Configure base prices and customer-specific price rules with validity dates.</DialogDescription>
          </DialogHeader>
          
          {editingItem && (
            <div className="space-y-8 py-4">
              <div className="p-4 bg-muted/30 rounded-xl border space-y-4">
                <Label className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground">Standard Base Price (Default)</Label>
                <div className="flex gap-4 items-end">
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">MMK</span>
                    <Input 
                      type="number"
                      className="pl-12 font-mono font-bold"
                      value={editingItem.newValue}
                      onChange={(e) => setEditingItem({ ...editingItem, newValue: e.target.value })}
                    />
                  </div>
                  <Button onClick={handleUpdateBasePrice} className="bg-secondary text-secondary-foreground">
                    Update Base
                  </Button>
                </div>
              </div>

              {editingItem.type === 'product' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                      <CalendarRange className="h-4 w-4" /> Customer Type Exceptions
                    </h3>
                  </div>

                  <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs">Customer Classification</Label>
                        <Select onValueChange={(v) => setNewRule({...newRule, customerType: v})} value={newRule.customerType}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {CUSTOMER_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Special Price (MMK)</Label>
                        <Input 
                          type="number" 
                          value={newRule.price} 
                          onChange={(e) => setNewRule({...newRule, price: Number(e.target.value)})}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs flex items-center gap-1.5"><Calendar className="h-3 w-3" /> Valid From</Label>
                        <Input 
                          type="date" 
                          value={newRule.validFrom} 
                          onChange={(e) => setNewRule({...newRule, validFrom: e.target.value})} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs flex items-center gap-1.5"><Calendar className="h-3 w-3" /> Valid To</Label>
                        <Input 
                          type="date" 
                          value={newRule.validTo} 
                          onChange={(e) => setNewRule({...newRule, validTo: e.target.value})} 
                        />
                      </div>
                    </div>
                    <Button onClick={handleAddRule} className="w-full" variant="outline">
                      <Plus className="h-4 w-4 mr-2" /> Add Pricing Rule
                    </Button>
                  </div>

                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="text-[10px] font-black uppercase">Tier</TableHead>
                          <TableHead className="text-[10px] font-black uppercase">Price</TableHead>
                          <TableHead className="text-[10px] font-black uppercase">Validity Period</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rulesLoading ? (
                          <TableRow><TableCell colSpan={4} className="text-center py-4"><Loader2 className="h-4 w-4 animate-spin mx-auto" /></TableCell></TableRow>
                        ) : priceRules?.map((rule) => (
                          <TableRow key={rule.id}>
                            <TableCell><Badge variant="outline" className="text-[10px]">{rule.customerType}</Badge></TableCell>
                            <TableCell className="font-mono font-bold text-primary">MMK {rule.price.toLocaleString()}</TableCell>
                            <TableCell className="text-[10px] text-muted-foreground font-medium">
                              {rule.validFrom} <span className="mx-1">→</span> {rule.validTo}
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 text-destructive"
                                onClick={() => handleDeleteRule(rule.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {priceRules?.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground italic text-xs">
                              No specific tier prices defined for this product.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="pt-4 border-t">
            <Button variant="outline" onClick={() => setIsEditOpen(false)} className="w-full">Close Manager</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
