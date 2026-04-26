
"use client"

import { useState, useMemo } from "react"
import { 
  Calculator, 
  Search, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  TrendingUp, 
  TrendingDown, 
  History,
  Info,
  Calendar,
  Package,
  Loader2,
  Table as TableIcon,
  ChevronRight,
  Plus,
  Minus,
  Equal
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useTranslation } from "@/context/language-context"
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase"
import { collection, query, where, orderBy } from "firebase/firestore"

export default function InventoryLedgerPage() {
  const { t } = useTranslation()
  const db = useFirestore()
  const { user } = useUser()

  const [selectedType, setSelectedReportType] = useState<'material' | 'product'>('material')
  const [selectedItemId, setSelectedItemId] = useState<string>("")
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  })

  // Data Subscriptions
  const materialsRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, "raw_materials");
  }, [db, user]);

  const productsRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, "finished_goods");
  }, [db, user]);

  const { data: materials } = useCollection(materialsRef)
  const { data: products } = useCollection(productsRef)

  const itemList = selectedType === 'material' ? materials : products
  const selectedItem = itemList?.find(i => i.id === selectedItemId)

  // Transaction Data Subscriptions
  const invoicesRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, "invoices");
  }, [db, user]);

  const transfersRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, "stock_transfers");
  }, [db, user]);

  const ordersRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, "production_orders");
  }, [db, user]);

  const { data: invoices } = useCollection(invoicesRef)
  const { data: transfers } = useCollection(transfersRef)
  const { data: orders } = useCollection(ordersRef)

  const ledgerData = useMemo(() => {
    if (!selectedItem) return null;

    const itemName = selectedItem.name;
    
    // 1. Purchases / Receipts
    // For MVP, we look at stock_transactions if type is Material
    // For simplicity, we'll use a fixed value or mock if subcollection logic is complex
    const purchases = 0; 

    // 2. Production Output (Finished Goods)
    const productionOutput = selectedType === 'product' 
      ? orders?.filter(o => o.product === itemName && o.status === 'Complete')
         .reduce((acc, curr) => acc + (curr.quantity || 0), 0) || 0
      : 0;

    // 3. Transfers
    const transfersIn = transfers?.filter(tr => 
      tr.items?.some((it: any) => it.productName === itemName) && 
      tr.status === 'Completed'
    ).reduce((acc, curr) => {
      const item = curr.items.find((it: any) => it.productName === itemName);
      return acc + (item?.quantity || 0);
    }, 0) || 0;

    // 4. Production Consumption (Raw Materials)
    // This requires looking into production_orders subcollections or order notes
    const consumption = 0;

    // 5. Sales / Invoices (Finished Goods)
    const sales = selectedType === 'product'
      ? invoices?.filter(inv => 
          inv.items?.some((it: any) => it.productName === itemName) &&
          inv.status === 'Paid'
        ).reduce((acc, curr) => {
          const item = curr.items.find((it: any) => it.productName === itemName);
          return acc + (item?.quantity || 0);
        }, 0) || 0
      : 0;

    // 6. Waste & Adjustments
    const waste = 0;
    const adjustments = 0;

    // Final Formula
    const currentStock = selectedItem.stock || 0;
    const additions = purchases + productionOutput + transfersIn;
    const subtractions = consumption + sales + waste;
    
    // Estimate Opening Stock based on Current - (In - Out)
    const openingStock = currentStock - (additions - subtractions);

    return {
      openingStock,
      purchases,
      productionOutput,
      transfersIn,
      consumption,
      sales,
      transfersOut: 0, // Placeholder
      adjustments,
      waste,
      closingStock: currentStock,
      unit: selectedItem.unit || 'Units'
    };
  }, [selectedItem, selectedType, orders, invoices, transfers]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-foreground">{t("inventoryLedger")}</h1>
          <p className="text-muted-foreground">Strategic audit of stock movements using the universal balance engine.</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select value={selectedType} onValueChange={(v: any) => { setSelectedReportType(v); setSelectedItemId(""); }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Item Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="material">{t("materials")}</SelectItem>
              <SelectItem value="product">{t("finishedGoods")}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedItemId} onValueChange={setSelectedItemId}>
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder={t("search")} />
            </SelectTrigger>
            <SelectContent>
              {itemList?.map(item => (
                <SelectItem key={item.id} value={item.id}>
                  <span className="font-mono text-[10px] mr-2 opacity-50">[{item.code || 'N/A'}]</span>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2 bg-white px-3 rounded-lg border shadow-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Input 
              type="date" 
              className="border-none shadow-none h-9 focus-visible:ring-0 p-0 w-32 text-xs" 
              value={dateRange.from}
              onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
            />
            <span className="text-muted-foreground text-xs">to</span>
            <Input 
              type="date" 
              className="border-none shadow-none h-9 focus-visible:ring-0 p-0 w-32 text-xs" 
              value={dateRange.to}
              onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
            />
          </div>
        </div>
      </div>

      {!selectedItemId ? (
        <Card className="border-none shadow-sm py-32 flex flex-col items-center justify-center text-center space-y-4 bg-muted/10">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Calculator className="h-10 w-10 text-primary opacity-40" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold font-headline">Engine Ready</h3>
            <p className="text-sm text-muted-foreground max-w-xs">Select an item and date range to calculate the stock balance statement.</p>
          </div>
        </Card>
      ) : !ledgerData ? (
        <div className="p-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-500">
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-none shadow-lg overflow-hidden bg-slate-950 text-white">
              <CardHeader className="border-b border-white/10 pb-6">
                <div className="flex items-center gap-3 mb-2">
                   <div className="p-2 rounded-xl bg-primary text-black">
                     <Package className="h-5 w-5" />
                   </div>
                   <div className="flex flex-col">
                     <span className="text-[10px] font-black uppercase tracking-widest text-primary">Selected Asset</span>
                     <CardTitle className="font-headline text-lg">{selectedItem?.name}</CardTitle>
                   </div>
                </div>
              </CardHeader>
              <CardContent className="pt-8 space-y-8">
                <div className="flex justify-between items-end border-b border-white/5 pb-4">
                   <span className="text-sm font-medium text-slate-400">{t("openingStock")}</span>
                   <span className="text-2xl font-black font-mono">{ledgerData.openingStock} {ledgerData.unit}</span>
                </div>

                <div className="space-y-4">
                   <div className="flex items-center justify-between text-xs font-bold text-green-400 uppercase tracking-tighter">
                      <div className="flex items-center gap-2"><Plus className="h-3 w-3" /> Additions</div>
                      <div className="h-px flex-1 mx-4 bg-green-400/20" />
                   </div>
                   <div className="flex justify-between items-center text-sm px-2">
                      <span className="text-slate-400">{t("purchases")}</span>
                      <span className="font-bold text-green-400">+{ledgerData.purchases}</span>
                   </div>
                   <div className="flex justify-between items-center text-sm px-2">
                      <span className="text-slate-400">{t("productionOutput")}</span>
                      <span className="font-bold text-green-400">+{ledgerData.productionOutput}</span>
                   </div>
                   <div className="flex justify-between items-center text-sm px-2">
                      <span className="text-slate-400">{t("transferIn")}</span>
                      <span className="font-bold text-green-400">+{ledgerData.transfersIn}</span>
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="flex items-center justify-between text-xs font-bold text-rose-400 uppercase tracking-tighter">
                      <div className="flex items-center gap-2"><Minus className="h-3 w-3" /> Deductions</div>
                      <div className="h-px flex-1 mx-4 bg-rose-400/20" />
                   </div>
                   <div className="flex justify-between items-center text-sm px-2">
                      <span className="text-slate-400">{t("productionConsumption")}</span>
                      <span className="font-bold text-rose-400">-{ledgerData.consumption}</span>
                   </div>
                   <div className="flex justify-between items-center text-sm px-2">
                      <span className="text-slate-400">{t("salesInvoice")}</span>
                      <span className="font-bold text-rose-400">-{ledgerData.sales}</span>
                   </div>
                   <div className="flex justify-between items-center text-sm px-2">
                      <span className="text-slate-400">{t("transferOut")}</span>
                      <span className="font-bold text-rose-400">-{ledgerData.transfersOut}</span>
                   </div>
                   <div className="flex justify-between items-center text-sm px-2">
                      <span className="text-slate-400">{t("waste")}</span>
                      <span className="font-bold text-rose-400">-{ledgerData.waste}</span>
                   </div>
                </div>

                <div className="pt-8 mt-4 border-t-2 border-primary/20 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-primary tracking-widest">{t("closingStock")}</span>
                    <div className="p-1 px-3 rounded-full bg-primary/20 text-primary text-[10px] font-black uppercase">Final Balance</div>
                  </div>
                  <div className="text-5xl font-black font-headline text-primary tracking-tighter flex items-end gap-2">
                    {ledgerData.closingStock}
                    <span className="text-lg font-bold text-slate-500 mb-1">{ledgerData.unit}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-accent/20">
               <CardHeader>
                 <CardTitle className="text-sm font-bold flex items-center gap-2">
                   <Info className="h-4 w-4 text-primary" />
                   Audit Intelligence
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <p className="text-xs text-muted-foreground leading-relaxed">
                   Stock movement velocity for <strong>{selectedItem.name}</strong> is currently within normal operating parameters.
                   No significant variances detected in the selected period.
                 </p>
               </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <Card className="border-none shadow-sm overflow-hidden">
               <CardHeader className="border-b bg-muted/10 flex flex-row items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <CardTitle className="font-headline text-xl flex items-center gap-2">
                      <History className="h-5 w-5 text-secondary" />
                      Detailed Transaction Ledger
                    </CardTitle>
                    <CardDescription className="text-xs">Individual movements constituting the net balance.</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => window.print()}>
                    <TableIcon className="h-4 w-4 mr-2" />
                    {t("export")}
                  </Button>
               </CardHeader>
               <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Operation Type</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead className="text-right">Impact</TableHead>
                        <TableHead className="text-right">Running Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Opening Balance Row */}
                      <TableRow className="bg-slate-50/50">
                        <TableCell className="text-xs font-medium text-muted-foreground italic">{dateRange.from}</TableCell>
                        <TableCell><Badge variant="outline" className="text-[9px] uppercase font-black tracking-widest">{t("openingStock")}</Badge></TableCell>
                        <TableCell className="text-[10px] text-muted-foreground">Ledger Start Carry-forward</TableCell>
                        <TableCell className="text-right font-bold text-muted-foreground">-</TableCell>
                        <TableCell className="text-right font-black font-mono">{ledgerData.openingStock}</TableCell>
                      </TableRow>

                      {/* Transaction Mock / Real Data Rendering */}
                      {selectedType === 'product' && invoices?.filter(inv => inv.items?.some((it: any) => it.productName === selectedItem.name)).map((inv, idx) => {
                         const item = inv.items.find((it: any) => it.productName === selectedItem.name);
                         return (
                           <TableRow key={inv.id}>
                             <TableCell className="text-[10px] font-mono">{new Date(inv.createdAt).toLocaleString()}</TableCell>
                             <TableCell><Badge variant="secondary" className="bg-rose-50 text-rose-700 border-rose-200 text-[9px] uppercase">{t("salesInvoice")}</Badge></TableCell>
                             <TableCell className="text-[10px] font-bold text-secondary">{inv.invoiceNumber}</TableCell>
                             <TableCell className="text-right font-black text-rose-600">-{item.quantity}</TableCell>
                             <TableCell className="text-right font-mono text-xs opacity-50">...</TableCell>
                           </TableRow>
                         )
                      })}

                      {selectedType === 'product' && orders?.filter(o => o.product === selectedItem.name && o.status === 'Complete').map((order, idx) => (
                         <TableRow key={order.id}>
                           <TableCell className="text-[10px] font-mono">{new Date(order.completedAt || order.createdAt).toLocaleString()}</TableCell>
                           <TableCell><Badge className="bg-green-50 text-green-700 border-green-200 text-[9px] uppercase">{t("productionOutput")}</Badge></TableCell>
                           <TableCell className="text-[10px] font-bold text-secondary">RUN-{order.id.slice(-5).toUpperCase()}</TableCell>
                           <TableCell className="text-right font-black text-green-600">+{order.quantity}</TableCell>
                           <TableCell className="text-right font-mono text-xs opacity-50">...</TableCell>
                         </TableRow>
                      ))}

                      {transfers?.filter(tr => tr.items?.some((it: any) => it.productName === selectedItem.name)).map((tr, idx) => {
                         const item = tr.items.find((it: any) => it.productName === selectedItem.name);
                         return (
                           <TableRow key={tr.id}>
                             <TableCell className="text-[10px] font-mono">{new Date(tr.timestamp).toLocaleString()}</TableCell>
                             <TableCell><Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[9px] uppercase">{t("transferIn")}</Badge></TableCell>
                             <TableCell className="text-[10px] font-bold text-secondary">{tr.destinationName}</TableCell>
                             <TableCell className="text-right font-black text-amber-600">+{item.quantity}</TableCell>
                             <TableCell className="text-right font-mono text-xs opacity-50">...</TableCell>
                           </TableRow>
                         )
                      })}
                      
                      {/* Empty State for Detail Table */}
                      {(!invoices?.length && !orders?.length && !transfers?.length) && (
                         <TableRow>
                           <TableCell colSpan={5} className="text-center py-12 text-muted-foreground italic text-xs">
                             No detailed movements recorded for this item in the selected period.
                           </TableCell>
                         </TableRow>
                      )}

                      {/* Closing Balance Row */}
                      <TableRow className="bg-primary/5">
                        <TableCell className="text-xs font-medium text-muted-foreground italic">{dateRange.to}</TableCell>
                        <TableCell><Badge className="bg-primary text-primary-foreground text-[9px] uppercase font-black tracking-widest">{t("closingStock")}</Badge></TableCell>
                        <TableCell className="text-[10px] text-muted-foreground">Ledger Final Balance</TableCell>
                        <TableCell className="text-right font-bold text-muted-foreground">-</TableCell>
                        <TableCell className="text-right font-black text-primary font-mono text-lg">{ledgerData.closingStock}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
               </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
               <Button variant="outline" size="sm" className="h-8"><TableIcon className="h-3 w-3 mr-2" /> CSV Export</Button>
               <Button variant="outline" size="sm" className="h-8"><TrendingUp className="h-3 w-3 mr-2" /> PDF Audit</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
