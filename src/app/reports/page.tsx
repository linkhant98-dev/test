
"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { 
  FileText, 
  Download, 
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Factory,
  Printer,
  Calendar,
  Layers,
  Warehouse,
  Users,
  DollarSign,
  Package,
  Store,
  Receipt,
  Zap,
  Table as TableIcon,
  ArrowRightLeft,
  MapPin
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend
} from "recharts"
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase"
import { collection } from "firebase/firestore"
import { useAppSettings } from "@/components/theme-provider"

const reportTypes = [
  { id: "sales-rev", title: "Sales Revenue Trend", icon: DollarSign, desc: "Time-series analysis of cumulative revenue from snack sales (MMK).", color: "bg-amber-100 text-amber-700" },
  { id: "outlet-sales", title: "Outlet Performance", icon: Store, desc: "Revenue breakdown and rankings for all retail branch locations.", color: "bg-orange-100 text-orange-700" },
  { id: "top-customers", title: "Customer Revenue Analysis", icon: Users, desc: "Ranking of clients by total purchase volume and payment reliability.", color: "bg-indigo-100 text-indigo-700" },
  { id: "top-items", title: "Top Performing Items", icon: Package, desc: "Volume and value breakdown for all snack varieties.", color: "bg-emerald-100 text-emerald-700" },
  { id: "expense-rep", title: "Expense Analysis", icon: Receipt, desc: "Procurement cost breakdown by material and vendor (MMK).", color: "bg-rose-100 text-rose-700" },
  { id: "prod-rep", title: "Production Performance", icon: Factory, desc: "Standard vs Actual output efficiency and throughput targets.", color: "bg-blue-100 text-blue-700" },
  { id: "inv-val", title: "Inventory Details & Valuation", icon: Warehouse, desc: "Granular stock levels, warehouse distribution, and asset value.", color: "bg-emerald-100 text-emerald-700" },
  { id: "stock-mov", title: "Stock Movement Report", icon: ArrowRightLeft, desc: "Tracking distribution from warehouses to outlets.", color: "bg-purple-100 text-purple-700" },
]

export default function ReportsPage() {
  const router = useRouter();
  const db = useFirestore()
  const settings = useAppSettings()
  const { user, isUserLoading: isAuthLoading } = useUser()
  
  // Guarded Data Sources
  const ordersRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, "production_orders");
  }, [db, user]);
  const { data: realOrders } = useCollection(ordersRef)
  
  const materialsRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, "raw_materials");
  }, [db, user]);
  const { data: realMaterials } = useCollection(materialsRef)

  const invoicesRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, "invoices");
  }, [db, user]);
  const { data: realInvoices } = useCollection(invoicesRef)

  const outletSalesRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, "outlet_sales");
  }, [db, user]);
  const { data: realOutletSales } = useCollection(outletSalesRef)

  const expensesRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, "expenses");
  }, [db, user]);
  const { data: realExpenses } = useCollection(expensesRef)

  const transfersRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, "stock_transfers");
  }, [db, user]);
  const { data: realTransfers } = useCollection(transfersRef)

  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push("/login");
    }
  }, [user, isAuthLoading, router]);

  // DATA PROCESSING
  const salesRevenueData = useMemo(() => {
    if (!realInvoices) return [];
    const grouped: Record<string, number> = {};
    realInvoices.forEach(inv => {
      const date = inv.createdAt?.split('T')[0] || 'Unknown';
      grouped[date] = (grouped[date] || 0) + (inv.totalAmount || 0);
    });
    return Object.entries(grouped)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, revenue]) => ({
        name: date,
        actual: revenue,
        standard: 500000, 
        variance: Number(((revenue - 500000) / 500000 * 100).toFixed(1))
      }));
  }, [realInvoices]);

  const outletPerformanceData = useMemo(() => {
    if (!realOutletSales) return [];
    const agg: Record<string, number> = {};
    realOutletSales.forEach(s => {
      agg[s.outletName] = (agg[s.outletName] || 0) + (s.amount || 0);
    });
    return Object.entries(agg)
      .map(([name, revenue]) => ({
        name,
        actual: revenue,
        standard: 300000, 
        variance: Number(((revenue - 300000) / 300000 * 100).toFixed(1))
      }))
      .sort((a, b) => b.actual - a.actual);
  }, [realOutletSales]);

  const topCustomersData = useMemo(() => {
    if (!realInvoices) return [];
    const customerAgg: Record<string, number> = {};
    realInvoices.forEach(inv => {
      const name = inv.customerName || 'Unknown';
      customerAgg[name] = (customerAgg[name] || 0) + (inv.totalAmount || 0);
    });
    return Object.entries(customerAgg)
      .map(([name, revenue]) => ({
        name,
        actual: revenue,
        standard: 1000000, 
        variance: Number(((revenue - 1000000) / 1000000 * 100).toFixed(1))
      }))
      .sort((a, b) => b.actual - a.actual);
  }, [realInvoices]);

  const topItemsData = useMemo(() => {
    if (!realInvoices) return [];
    const itemAgg: Record<string, { revenue: number, qty: number }> = {};
    realInvoices.forEach(inv => {
      inv.items?.forEach((item: any) => {
        if (!itemAgg[item.productName]) {
          itemAgg[item.productName] = { revenue: 0, qty: 0 };
        }
        itemAgg[item.productName].revenue += (item.total || 0);
        itemAgg[item.productName].qty += (item.quantity || 0);
      });
    });
    return Object.entries(itemAgg)
      .map(([name, data]) => ({
        name,
        actual: data.revenue,
        standard: 500000, 
        qty: data.qty,
        variance: Number(((data.revenue - 500000) / 500000 * 100).toFixed(1))
      }))
      .sort((a, b) => b.actual - a.actual);
  }, [realInvoices]);

  const expenseData = useMemo(() => {
    if (!realExpenses) return [];
    const materialAgg: Record<string, number> = {};
    realExpenses.forEach(exp => {
      materialAgg[exp.materialName] = (materialAgg[exp.materialName] || 0) + (exp.totalAmount || 0);
    });
    return Object.entries(materialAgg)
      .map(([name, revenue]) => ({
        name,
        actual: revenue,
        standard: 200000, 
        variance: Number(((revenue - 200000) / 200000 * 100).toFixed(1))
      }))
      .sort((a, b) => b.actual - a.actual);
  }, [realExpenses]);

  const performanceData = useMemo(() => {
    if (!realOrders) return [];
    return realOrders
      .filter(o => o.status === 'Complete')
      .map(o => ({
        name: o.id.slice(-5).toUpperCase(),
        standard: o.quantity || 0,
        actual: Math.round((o.quantity || 0) * ((o.yield || 100) / 100)),
        variance: o.variance || 0,
        product: o.product
      })).slice(-8);
  }, [realOrders]);

  const inventoryValuation = useMemo(() => {
    if (!realMaterials) return [];
    return realMaterials.map(m => ({
      name: m.name,
      standard: 100, 
      actual: m.stock || 0,
      unit: m.unit,
      value: (m.stock || 0) * (m.cost || 0),
      variance: 0 
    }));
  }, [realMaterials]);

  const stockMovementData = useMemo(() => {
    if (!realTransfers) return [];
    const destAgg: Record<string, number> = {};
    realTransfers.forEach(t => {
      const itemsCount = t.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;
      destAgg[t.destinationName] = (destAgg[t.destinationName] || 0) + itemsCount;
    });
    return Object.entries(destAgg).map(([name, qty]) => ({
      name,
      actual: qty,
      standard: 100, 
      variance: 0
    })).sort((a,b) => b.actual - a.actual);
  }, [realTransfers]);

  const currentData = useMemo(() => {
    switch (selectedReportId) {
      case 'sales-rev': return salesRevenueData;
      case 'outlet-sales': return outletPerformanceData;
      case 'top-customers': return topCustomersData;
      case 'top-items': return topItemsData;
      case 'expense-rep': return expenseData;
      case 'prod-rep': return performanceData;
      case 'inv-val': return inventoryValuation;
      case 'stock-mov': return stockMovementData;
      default: return [];
    }
  }, [selectedReportId, salesRevenueData, outletPerformanceData, topCustomersData, topItemsData, expenseData, performanceData, inventoryValuation, stockMovementData]);

  const handleGenerate = (id: string) => {
    setIsGenerating(true)
    setProgress(0)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsGenerating(false)
          setSelectedReportId(id)
          return 100
        }
        return prev + 10
      })
    }, 100)
  }

  const exportToExcel = () => {
    if (!currentData.length) return;
    const reportName = reportTypes.find(r => r.id === selectedReportId)?.title || "Report";
    const headers = ["Entry", "Standard/Target", "Actual Value", "Variance (%)"];
    const rows = currentData.map(row => [
      row.name,
      row.standard?.toString() || "0",
      row.actual?.toString() || "0",
      row.variance?.toString() || "0"
    ]);

    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${reportName.replace(/\s+/g, '_')}_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  if (isAuthLoading || !user) {
    return <div className="h-full w-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (selectedReportId) {
    const report = reportTypes.find(r => r.id === selectedReportId)
    const data = currentData;

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 bg-white min-h-screen p-0 md:p-4 rounded-3xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden px-4 pt-4">
          <Button variant="ghost" onClick={() => setSelectedReportId(null)} className="gap-2 w-fit">
            <ArrowLeft className="h-4 w-4" /> Back to Catalog
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-2" /> Print PDF
            </Button>
            <Button size="sm" className="bg-secondary text-secondary-foreground" onClick={exportToExcel}>
              <Download className="h-4 w-4 mr-2" /> Export Excel (CSV)
            </Button>
          </div>
        </div>

        {/* PRINT BRANDING HEADER */}
        <div className="hidden print:flex justify-between items-end border-b-4 border-primary pb-8 mb-8">
           <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="h-16 w-16 bg-primary rounded-2xl flex items-center justify-center overflow-hidden p-1 shadow-lg">
                   {settings?.companyLogoUrl ? (
                     <img src={settings.companyLogoUrl} alt="Logo" className="object-contain h-full w-full" />
                   ) : <span className="font-black text-2xl text-primary-foreground">CB</span>}
                </div>
                <div>
                   <h1 className="text-4xl font-black font-headline tracking-tighter uppercase leading-none">Cheesy Bites Co.</h1>
                   <p className="text-xs font-bold text-muted-foreground tracking-[0.2em] uppercase mt-1">Operational Intelligence Unit</p>
                </div>
              </div>
              <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest space-y-1">
                <p className="flex items-center gap-2"><MapPin className="h-2.5 w-2.5" /> Industrial Zone 4, Yangon, Myanmar</p>
                <p>System Audit Document - {new Date().toLocaleDateString()}</p>
              </div>
           </div>
           <div className="text-right">
              <h2 className="text-4xl font-black font-headline text-secondary uppercase tracking-tight">{report?.title}</h2>
              <Badge variant="outline" className="mt-2 font-mono text-[10px] border-primary text-primary">REF: {selectedReportId?.toUpperCase()}</Badge>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 px-4 pb-8">
          <div className="lg:col-span-8 space-y-6">
            <Card className="border-none shadow-sm overflow-hidden print:shadow-none print:border-none">
              <CardHeader className="border-b bg-muted/20 pb-6 print:hidden">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-2xl ${report?.color} shadow-sm`}>
                    {report && <report.icon className="h-8 w-8" />}
                  </div>
                  <div>
                    <CardTitle className="font-headline text-3xl mb-1">{report?.title}</CardTitle>
                    <CardDescription className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 font-medium"><Calendar className="h-3 w-3" /> Updated: {new Date().toLocaleDateString()}</span>
                      <span className="flex items-center gap-1 font-medium text-secondary"><CheckCircle2 className="h-3 w-3" /> Live Transaction Data</span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-8 print:pt-0">
                <div className="h-[400px] w-full mb-8 print:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    {selectedReportId === 'sales-rev' ? (
                      <AreaChart data={data}>
                        <defs>
                          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                        <Tooltip />
                        <Area type="monotone" name="Revenue (MMK)" dataKey="actual" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorSales)" strokeWidth={3} />
                      </AreaChart>
                    ) : (
                      <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar name="Actual Value" dataKey="actual" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} barSize={40} />
                        <Bar name="Target/Baseline" dataKey="standard" fill="#e2e8f0" radius={[4, 4, 0, 0]} barSize={40} />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-2 py-1 print:mb-4">
                    <TableIcon className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Detailed Breakdown</h3>
                  </div>
                  <div className="rounded-xl border overflow-hidden print:border-slate-200">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/40 print:bg-slate-50">
                          <TableHead className="font-bold">Entry</TableHead>
                          <TableHead className="text-right font-bold">Target/Baseline</TableHead>
                          <TableHead className="text-right font-bold">Actual Value</TableHead>
                          <TableHead className="text-right font-bold">Variance (%)</TableHead>
                          <TableHead className="w-[120px] font-bold">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.map((row, idx) => (
                          <TableRow key={idx} className="print:border-b print:border-slate-100">
                            <TableCell className="font-bold text-sm">{row.name}</TableCell>
                            <TableCell className="text-right font-mono text-muted-foreground">{row.standard?.toLocaleString()}</TableCell>
                            <TableCell className="text-right font-mono font-bold">{row.actual?.toLocaleString()}</TableCell>
                            <TableCell className={`text-right font-bold ${row.variance > 0 ? 'text-secondary' : 'text-destructive'}`}>
                              {row.variance > 0 ? '+' : ''}{row.variance}%
                            </TableCell>
                            <TableCell>
                              {(row.actual || 0) >= (row.standard || 0) ? (
                                <Badge variant="secondary" className="bg-green-50 text-green-700 text-[10px] uppercase">Healthy</Badge>
                              ) : (
                                <Badge variant="outline" className="text-orange-600 border-orange-200 text-[10px] uppercase">Under</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="hidden print:block mt-20 pt-12 border-t text-[9px] text-muted-foreground text-center font-bold uppercase tracking-[0.3em]">
                   <p>Authorized operational summary - Cheesy Bites Enterprise Control</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-6 print:hidden">
            <Card className="border-none shadow-sm h-fit">
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Zap className="h-4 w-4" /> Strategic Intelligence
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-2xl border bg-secondary/5 border-secondary/10">
                   <p className="text-sm font-bold mb-1">Observation</p>
                   <p className="text-xs text-muted-foreground leading-relaxed">
                     {selectedReportId === 'stock-mov' ? 'Distribution velocity indicates seasonal restock patterns.' : 'Main operational channels are performing within standard deviations.'}
                   </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col gap-3">
        <h1 className="text-5xl font-bold font-headline text-foreground tracking-tighter">Operational Intelligence</h1>
        <p className="text-muted-foreground text-xl max-w-2xl leading-relaxed">
          Strategic data synthesis across sales, outlets, and inventory to drive business optimization.
        </p>
      </div>

      {isGenerating ? (
        <Card className="border-none shadow-xl bg-white/50 backdrop-blur-sm py-32">
          <CardContent className="flex flex-col items-center justify-center max-w-md mx-auto text-center space-y-8">
            <div className="relative h-24 w-24">
              <Loader2 className="h-24 w-24 text-primary animate-spin stroke-[1.5]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Layers className="h-10 w-10 text-primary/40" />
              </div>
            </div>
            <div className="space-y-4 w-full">
              <h3 className="font-bold text-3xl font-headline tracking-tight">Processing Analytics</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Querying records and aggregating tiered pricing data for synthesis...</p>
              <div className="pt-6">
                <Progress value={progress} className="h-2 mt-4 bg-muted/50" />
                <p className="text-[10px] font-black text-muted-foreground mt-3 uppercase tracking-[0.2em]">{progress}% Synthesized</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reportTypes.map((report) => (
            <Card key={report.id} className="border-none shadow-sm hover:shadow-2xl transition-all hover:-translate-y-2 group bg-white overflow-hidden">
              <div className="h-2 w-full bg-muted group-hover:bg-primary transition-colors" />
              <CardHeader className="pb-4">
                <div className={`h-16 w-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 shadow-sm ${report.color}`}>
                  <report.icon className="h-8 w-8" />
                </div>
                <CardTitle className="text-xl font-headline group-hover:text-primary transition-colors tracking-tight">{report.title}</CardTitle>
                <CardDescription className="text-xs leading-relaxed mt-2 min-h-[40px]">{report.desc}</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 pb-6">
                <Button 
                  variant="outline" 
                  className="w-full border-primary/20 hover:border-primary hover:bg-primary/5 font-bold h-10 text-sm shadow-sm" 
                  onClick={() => handleGenerate(report.id)}
                >
                  Generate Audit Report
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
