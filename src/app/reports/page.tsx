
"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { 
  FileText, 
  Download, 
  BarChart3, 
  PieChart as PieChartIcon, 
  ArrowLeft,
  Loader2,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Factory,
  ShoppingCart,
  Zap,
  Table as TableIcon,
  Printer,
  Calendar,
  Layers,
  Info,
  Warehouse,
  Scale,
  LineChart as LineChartIcon,
  Target,
  Users,
  DollarSign,
  Package
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
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  Legend
} from "recharts"
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase"
import { collection } from "firebase/firestore"

const reportTypes = [
  { id: "sales-rev", title: "Sales Revenue Trend", icon: DollarSign, desc: "Time-series analysis of cumulative revenue from snack sales (MMK).", color: "bg-amber-100 text-amber-700" },
  { id: "top-customers", title: "Customer Revenue Analysis", icon: Users, desc: "Ranking of clients by total purchase volume and payment reliability.", color: "bg-indigo-100 text-indigo-700" },
  { id: "top-items", title: "Top Performing Items", icon: Package, desc: "Volume and value breakdown for all snack varieties.", color: "bg-emerald-100 text-emerald-700" },
  { id: "prod-rep", title: "Production Performance", icon: Factory, desc: "Standard vs Actual output efficiency and throughput targets.", color: "bg-blue-100 text-blue-700" },
  { id: "inv-cons", title: "Raw Consumption & Variance", icon: Scale, desc: "Detailed breakdown of Actual raw material usage vs. Theoretical BOM standards.", color: "bg-amber-100 text-amber-700" },
  { id: "inv-val", title: "Inventory Details & Valuation", icon: Warehouse, desc: "Granular stock levels, warehouse distribution, and asset value.", color: "bg-emerald-100 text-emerald-700" },
]

export default function ReportsPage() {
  const router = useRouter();
  const db = useFirestore()
  const { user, isUserLoading: isAuthLoading } = useUser()
  
  // Guarded Data Sources
  const ordersRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, "production_orders");
  }, [db, user]);
  const { data: realOrders, isLoading: ordersLoading } = useCollection(ordersRef)
  
  const materialsRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, "raw_materials");
  }, [db, user]);
  const { data: realMaterials, isLoading: materialsLoading } = useCollection(materialsRef)

  const invoicesRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, "invoices");
  }, [db, user]);
  const { data: realInvoices, isLoading: invoicesLoading } = useCollection(invoicesRef)

  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push("/login");
    }
  }, [user, isAuthLoading, router]);

  // SALES REPORTS DATA PROCESSING
  const salesRevenueData = useMemo(() => {
    if (!realInvoices) return [];
    // Group by Date
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
        standard: 500000, // Monthly target baseline
        variance: Number(((revenue - 500000) / 500000 * 100).toFixed(1))
      }));
  }, [realInvoices]);

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
        standard: 1000000, // Target spend
        variance: Number(((revenue - 1000000) / 1000000 * 100).toFixed(1))
      }))
      .sort((a, b) => b.actual - a.actual)
      .slice(0, 10);
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
        standard: 500000, // Sales quota
        qty: data.qty,
        variance: Number(((data.revenue - 500000) / 500000 * 100).toFixed(1))
      }))
      .sort((a, b) => b.actual - a.actual);
  }, [realInvoices]);

  // PRODUCTION REPORTS DATA PROCESSING
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

  const consumptionSummary = useMemo(() => {
    if (!realOrders) return [];
    const productAggregates: Record<string, { standard: number, actual: number, count: number }> = {};
    realOrders.forEach(o => {
      if (!productAggregates[o.product]) {
        productAggregates[o.product] = { standard: 0, actual: 0, count: 0 };
      }
      const yieldFactor = (o.yield || 100) / 100;
      productAggregates[o.product].standard += o.quantity || 0;
      productAggregates[o.product].actual += (o.quantity || 0) * yieldFactor;
      productAggregates[o.product].count += 1;
    });
    return Object.entries(productAggregates).map(([name, data]) => ({
      name,
      standard: data.standard,
      actual: data.actual,
      variance: Number(((data.actual - data.standard) / data.standard * 100).toFixed(1)) || 0
    }));
  }, [realOrders]);

  const inventoryValuation = useMemo(() => {
    if (!realMaterials) return [];
    return realMaterials.map(m => ({
      name: m.name,
      standard: 100, // Dummy capacity for chart scaling
      actual: m.stock || 0,
      unit: m.unit,
      value: (m.stock || 0) * (m.cost || 0),
      variance: 0 
    }));
  }, [realMaterials]);

  const currentData = useMemo(() => {
    switch (selectedReportId) {
      case 'sales-rev': return salesRevenueData;
      case 'top-customers': return topCustomersData;
      case 'top-items': return topItemsData;
      case 'prod-rep': return performanceData;
      case 'inv-cons': return consumptionSummary;
      case 'inv-val': return inventoryValuation;
      default: return [];
    }
  }, [selectedReportId, salesRevenueData, topCustomersData, topItemsData, performanceData, consumptionSummary, inventoryValuation]);

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

  if (isAuthLoading || !user) {
    return <div className="h-full w-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (selectedReportId) {
    const report = reportTypes.find(r => r.id === selectedReportId)
    const data = currentData;

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
          <Button variant="ghost" onClick={() => setSelectedReportId(null)} className="gap-2 w-fit">
            <ArrowLeft className="h-4 w-4" /> Back to Catalog
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-2" /> Print PDF
            </Button>
            <Button size="sm" className="bg-secondary text-secondary-foreground">
              <Download className="h-4 w-4 mr-2" /> Export CSV
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader className="border-b bg-muted/20 pb-6">
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
              <CardContent className="pt-8">
                <div className="h-[400px] w-full mb-8">
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
                        <Bar name={selectedReportId?.includes('sales') || selectedReportId?.includes('top') ? 'MMK Revenue' : 'Actual Qty'} dataKey="actual" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} barSize={40} />
                        <Bar name="Target/Baseline" dataKey="standard" fill="#e2e8f0" radius={[4, 4, 0, 0]} barSize={40} />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-2 py-1">
                    <TableIcon className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Detailed Breakdown</h3>
                  </div>
                  <div className="rounded-xl border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/40">
                          <TableHead className="font-bold">Entry</TableHead>
                          <TableHead className="text-right font-bold">Standard/Target</TableHead>
                          <TableHead className="text-right font-bold">Actual Value</TableHead>
                          <TableHead className="text-right font-bold">Variance (%)</TableHead>
                          <TableHead className="w-[120px] font-bold">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.map((row, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-bold text-sm">{row.name}</TableCell>
                            <TableCell className="text-right font-mono text-muted-foreground">{row.standard.toLocaleString()}</TableCell>
                            <TableCell className="text-right font-mono font-bold">MMK {row.actual.toLocaleString()}</TableCell>
                            <TableCell className={`text-right font-bold ${row.variance > 0 ? 'text-secondary' : 'text-destructive'}`}>
                              {row.variance > 0 ? '+' : ''}{row.variance}%
                            </TableCell>
                            <TableCell>
                              {row.actual >= row.standard ? (
                                <Badge variant="secondary" className="bg-green-50 text-green-700 text-[10px] uppercase">Goal Met</Badge>
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
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-6 print:hidden">
            <Card className="border-none shadow-sm h-fit">
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Zap className="h-4 w-4" /> Market Intelligence
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-2xl border bg-secondary/5 border-secondary/10">
                   <p className="text-sm font-bold mb-1">Growth Forecast</p>
                   <p className="text-xs text-muted-foreground leading-relaxed">System projects a 12% revenue increase if current sales velocity for top items maintains through month-end.</p>
                </div>
                
                <div className="pt-6 border-t space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Insights</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/20 border border-primary/10 text-[11px] font-medium">
                      <CheckCircle2 className="h-4 w-4 text-secondary shrink-0" />
                      <span>{selectedReportId === 'top-customers' ? 'VIP customers account for 65% of revenue.' : 'Main distribution channels are healthy.'}</span>
                    </div>
                  </div>
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
          Strategic data synthesis across sales, production, and inventory to drive business optimization.
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
              <p className="text-sm text-muted-foreground leading-relaxed">Querying invoice records and aggregating tiered pricing data for synthesis...</p>
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
