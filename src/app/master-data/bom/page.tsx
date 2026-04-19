
"use client"

import { useState } from "react"
import { 
  Plus, 
  Search, 
  ChevronRight, 
  DollarSign,
  Calendar,
  TrendingUp,
  Copy
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const boms = [
  { 
    id: "BOM-OCS-01", 
    product: "Original Cheese Stick", 
    version: "v1.0", 
    status: "Active", 
    effDate: "2024-01-01", 
    cost: 1.20,
    components: [
      { name: 'Mozzarella Cheese', qty: 0.05, unit: 'kg', loss: 2.0 },
      { name: 'Batter Mix', qty: 0.02, unit: 'kg', loss: 5.0 },
      { name: 'Breadcrumbs', qty: 0.02, unit: 'kg', loss: 5.0 },
      { name: 'Frying Oil', qty: 0.01, unit: 'L', loss: 10.0 },
    ]
  },
  { 
    id: "BOM-LP-01", 
    product: "Long Potato", 
    version: "v1.1", 
    status: "Active", 
    effDate: "2024-02-15", 
    cost: 0.85,
    components: [
      { name: 'Potato Starch', qty: 0.08, unit: 'kg', loss: 3.0 },
      { name: 'Seasoning Powder', qty: 0.005, unit: 'kg', loss: 1.0 },
      { name: 'Frying Oil', qty: 0.015, unit: 'L', loss: 10.0 },
    ]
  },
  { 
    id: "BOM-CPC-01", 
    product: "Chicken PopCorn", 
    version: "v1.0", 
    status: "Active", 
    effDate: "2024-03-01", 
    cost: 1.50,
    components: [
      { name: 'Chicken Breast (Minced)', qty: 0.1, unit: 'kg', loss: 2.0 },
      { name: 'Seasoning Powder', qty: 0.01, unit: 'kg', loss: 2.0 },
      { name: 'Breadcrumbs', qty: 0.03, unit: 'kg', loss: 5.0 },
      { name: 'Frying Oil', qty: 0.02, unit: 'L', loss: 12.0 },
    ]
  },
]

export default function BOMManagementPage() {
  const [selectedBOM, setSelectedBOM] = useState(boms[0])

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
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            New BOM
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-4 border-none shadow-sm h-fit">
          <CardHeader className="pb-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search BOMs..." className="pl-9 bg-muted/30" />
            </div>
          </CardHeader>
          <div className="divide-y">
            {boms.map((bom) => (
              <div 
                key={bom.id} 
                className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors flex items-center justify-between ${selectedBOM.id === bom.id ? 'bg-accent/40 border-l-4 border-primary' : ''}`}
                onClick={() => setSelectedBOM(bom)}
              >
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold">{bom.product}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded">{bom.version}</span>
                    <span className="text-[10px] text-muted-foreground">{bom.id}</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </Card>

        <div className="lg:col-span-8 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <div className="flex flex-col gap-1">
                <CardTitle className="font-headline text-2xl">{selectedBOM.product}</CardTitle>
                <div className="flex items-center gap-4">
                  <Badge className={selectedBOM.status === 'Active' ? 'bg-secondary' : 'bg-muted'}>{selectedBOM.status}</Badge>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    Effective: {selectedBOM.effDate}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground font-medium mb-1">Estimated Unit Cost</div>
                <div className="text-2xl font-bold text-secondary flex items-center justify-end">
                  <DollarSign className="h-5 w-5" />
                  {selectedBOM.cost.toFixed(2)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <Tabs defaultValue="components">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="components">Components</TabsTrigger>
                  <TabsTrigger value="simulation">Cost Simulation</TabsTrigger>
                  <TabsTrigger value="history">Version History</TabsTrigger>
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
                        {selectedBOM.components.map((comp, i) => (
                          <tr key={i} className="hover:bg-muted/20">
                            <td className="p-3 font-medium">{comp.name}</td>
                            <td className="p-3 text-right">{comp.qty}</td>
                            <td className="p-3">{comp.unit}</td>
                            <td className="p-3 text-right text-muted-foreground">{comp.loss}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm">
                      <Plus className="h-3 w-3 mr-2" /> Add Component
                    </Button>
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
                     <div className="space-y-4">
                       {selectedBOM.components.slice(0, 2).map((item, i) => (
                         <div key={i} className="flex items-center justify-between gap-4">
                           <span className="text-sm flex-1">{item.name}</span>
                           <div className="flex items-center gap-2">
                             <div className="flex items-center gap-1 text-secondary font-bold">
                               <Plus className="h-3 w-3" />
                               <Input defaultValue="10" className="w-12 h-8 py-0 px-2 text-center" />
                               <span className="text-xs">%</span>
                             </div>
                           </div>
                         </div>
                       ))}
                     </div>
                     <div className="mt-8 pt-6 border-t border-primary/10 flex items-center justify-between">
                       <span className="text-sm font-bold text-muted-foreground uppercase">Projected Unit Cost</span>
                       <span className="text-2xl font-bold text-foreground">${(selectedBOM.cost * 1.1).toFixed(2)}</span>
                     </div>
                   </div>
                </TabsContent>
                <TabsContent value="history">
                  <div className="space-y-4">
                    <div className="flex gap-4 p-3 rounded-lg border border-dashed hover:border-solid hover:bg-muted/10 transition-all">
                      <div className="font-mono text-xs font-bold bg-muted px-2 py-1 rounded h-fit">{selectedBOM.version}</div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground">{selectedBOM.effDate}</span>
                        <span className="text-sm">Initial BOM setup for {selectedBOM.product}.</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
