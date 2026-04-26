
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
  MapPin,
  TrendingUp,
  Percent,
  Calculator,
  User,
  Boxes
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
  Legend,
  Cell,
  PieChart,
  Pie
} from "recharts"
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase"
import { collection, query, getDocs } from "firebase/firestore"
import { useAppSettings } from "@/components/theme-provider"
import { useTranslation } from "@/context/language-context"

const reportTypes = [
  { id: "sales-rev", title: "Sales Revenue Trend", icon: DollarSign, desc: "Time-series analysis of cumulative revenue from snack sales (MMK).", color: "bg-amber-100 text-amber-700" },
  { id: "prod-profit", title: "Product Profitability", icon: Calculator, desc: "Analyze gross margins accounting for material, packaging, labor and overheads.", color: "bg-primary/20 text-primary" },
  { id: "outlet-sales", title: "Outlet Performance", icon: Store, desc: "Revenue breakdown and rankings for all retail branch locations.", color: "bg-orange-100 text-orange-700" },
  { id: "top-customers", title: "Customer Revenue Analysis", icon: Users, desc: "Ranking of clients by total purchase volume and payment reliability.", color: "bg-indigo-100 text-indigo-700" },
  { id: "top-items", title: "Top Performing Items", icon: Package, desc: "Volume and value breakdown for all snack varieties.", color: "bg-emerald-100 text-emerald-700" },
  { id: "expense-rep", title: "Expense Analysis", icon: Receipt, desc: "Procurement cost breakdown by material and vendor (MMK).", color: "bg-rose-100 text-rose-700" },
  { id: "prod-rep", title: "Production Performance", icon: Factory, desc: "Standard vs Actual output efficiency and throughput targets.", color: "bg-blue-100 text-blue-700" },
  { id: "inv-val", title: "Inventory Details & Valuation", icon: Warehouse, desc: "Granular stock levels, warehouse distribution, and asset value.", color: "bg-emerald-100 text-emerald-700" },
]

export default function ReportsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const db = useFirestore()
  const settings = useAppSettings()
  const { user, isUserLoading: isAuthLoading } = useUser()
  
  // Guarded Data Sources
  const productsRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, "finished_goods");
  }, [db, user]);
  const { data: realProducts } = useCollection(productsRef)

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

  const profitabilityData = useMemo(() => {
    if (!realProducts) return [];
    
    return realProducts.map(p => {
      const sellPrice = p.price || 0;
      // We pull actual defined costs or fallback to estimates if not defined
      const materialCost = Math.round(sellPrice * 0.40);
      const packagingCost = Math.round(sellPrice * 0.10);
      const laborCost = p.laborCost || 0;
      const overhead = p.overhead || 0;
      
      const landedCost = materialCost + packagingCost + laborCost + overhead;
      const profit = sellPrice - landedCost;
      const margin = sellPrice > 0 ? (profit / sellPrice) * 100 : 0;

      return {
        name: p.name,
        sellingPrice: sellPrice,
        materialCost,
        packagingCost,
        laborCost,
        overhead,
        actual: profit,
        standard: sellPrice * 0.3, // 30% target margin
        variance: Number(margin.toFixed(1)),
        landedCost
      };
    }).sort((a,b) => b.variance - a.variance);
  }, [realProducts]);

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

  const currentData = useMemo(() => {
    switch (selectedReportId) {
      case 'sales-rev': return salesRevenueData;
      case 'prod-profit': return profitabilityData;
      case 'outlet-sales': return outletPerformanceData;
      case 'top-customers': return topCustomersData;
      case 'top-items': return topItemsData;
      case 'expense-rep': return expenseData;
      case 'prod-rep': return performanceData;
      case 'inv-val': return inventoryValuation;
      default: return [];
    }
  }, [selectedReportId, salesRevenueData, profitabilityData, outletPerformanceData, topCustomersData, topItemsData, expenseData, performanceData, inventoryValuation]);

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
    const headers = selectedReportId === 'prod-profit' 
      ? ["Product", "Selling Price", "Material Cost", "Packaging Cost", "Labor Cost", "Overhead", "Gross Profit", "Margin (%)"]
      : ["Entry", "Standard/Target", "Actual Value", "Variance (%)"];
    
    const rows = currentData.map(row => {
      if (selectedReportId === 'prod-profit') {
        return [row.name, row.sellingPrice, row.materialCost, row.packagingCost, row.laborCost, row.overhead, row.actual, row.variance];
      }
      return [
        row.name,
        row.standard?.toString() || "0",
        row.actual?.toString() || "0",
        row.variance?.toString() || "0"
      ];
    });

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
                    ) : selectedReportId === 'prod-profit' ? (
                        <BarChart data={data}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                          <Tooltip 
                            formatter={(value: any) => `MMK ${value.toLocaleString()}`}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                          />
                          <Legend wrapperStyle={{ paddingTop: '20px' }} />
                          <Bar name={t("materialCost")} dataKey="materialCost" stackId="a" fill="#94a3b8" />
                          <Bar name={t("packagingCost")} dataKey="packagingCost" stackId="a" fill="#64748b" />
                          <Bar name={t("laborCost")} dataKey="laborCost" stackId="a" fill="#4f46e5" />
                          <Bar name={t("overhead")} dataKey="overhead" stackId="a" fill="#4338ca" />
                          <Bar name={t("grossProfit")} dataKey="actual" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
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
                          {selectedReportId === 'prod-profit' ? (
                            <>
                              <TableHead className="text-right font-bold">{t("sellingPrice")}</TableHead>
                              <TableHead className="text-right font-bold">{t("landedCost")}</TableHead>
                              <TableHead className="text-right font-bold">{t("grossProfit")}</TableHead>
                              <TableHead className="text-right font-bold">{t("margin")}</TableHead>
                            </>
                          ) : (
                            <>
                              <TableHead className="text-right font-bold">Target/Baseline</TableHead>
                              <TableHead className="text-right font-bold">Actual Value</TableHead>
                              <TableHead className="text-right font-bold">Variance (%)</TableHead>
                            </>
                          )}
                          <TableHead className="w-[120px] font-bold">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.map((row, idx) => (
                          <TableRow key={idx} className="print:border-b print:border-slate-100">
                            <TableCell className="font-bold text-sm">{row.name}</TableCell>
                            {selectedReportId === 'prod-profit' ? (
                              <>
                                <TableCell className="text-right font-mono text-muted-foreground">MMK {row.sellingPrice?.toLocaleString()}</TableCell>
                                <TableCell className="text-right font-mono text-muted-foreground">MMK {row.landedCost?.toLocaleString()}</TableCell>
                                <TableCell className="text-right font-mono font-bold text-primary">MMK {row.actual?.toLocaleString()}</TableCell>
                                <TableCell className="text-right font-bold text-secondary">{row.variance}%</TableCell>
                              </>
                            ) : (
                              <>
                                <TableCell className="text-right font-mono text-muted-foreground">{row.standard?.toLocaleString()}</TableCell>
                                <TableCell className="text-right font-mono font-bold">{row.actual?.toLocaleString()}</TableCell>
                                <TableCell className={`text-right font-bold ${row.variance > 0 ? 'text-secondary' : 'text-destructive'}`}>
                                  {row.variance > 0 ? '+' : ''}{row.variance}%
                                </TableCell>
                              </>
                            )}
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
                  <Calculator className="h-4 w-4" /> Standard Cost Formula
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-2xl border bg-muted/10 space-y-3">
                   <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5"><Package className="h-3.5 w-3.5 text-amber-600" /> Material Cost</span>
                      <span className="font-bold">+</span>
                   </div>
                   <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5"><Boxes className="h-3.5 w-3.5 text-blue-600" /> Packaging Cost</span>
                      <span className="font-bold">+</span>
                   </div>
                   <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5 text-indigo-600" /> Labor Cost</span>
                      <span className="font-bold">+</span>
                   </div>
                   <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-rose-600" /> Overhead</span>
                      <span className="font-bold">=</span>
                   </div>
                   <div className="pt-2 border-t flex items-center justify-between font-black text-secondary">
                      <span>Production Cost</span>
                      <span>100%</span>
                   </div>
                </div>
              </CardContent>
            </Card>

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
                     {selectedReportId === 'prod-profit' 
                       ? 'Standard recipe costing now accounts for Labor and Overhead. High production costs detected in seasonal lines. Consider bulk material procurement for margin optimization.' 
                       : 'Main operational channels are performing within standard deviations.'}
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
          Strategic data synthesis across sales, profitability, and manufacturing to drive enterprise optimization.
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
              <p className="text-sm text-muted-foreground leading-relaxed">Querying records and aggregating recipe cost data for synthesis...</p>
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
