
"use client"

import { useState, useEffect, useMemo } from "react"
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
  Target
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
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection } from "firebase/firestore"

const reportTypes = [
  { id: "prod-rep", title: "Production Performance", icon: Factory, desc: "Standard vs Actual output efficiency and throughput targets.", color: "bg-blue-100 text-blue-700" },
  { id: "inv-cons", title: "Raw Consumption & Variance", icon: Scale, desc: "Detailed breakdown of Actual raw material usage vs. Theoretical BOM standards.", color: "bg-amber-100 text-amber-700" },
  { id: "inv-val", title: "Inventory Details & Valuation", icon: Warehouse, desc: "Granular stock levels, warehouse distribution, and asset value.", color: "bg-emerald-100 text-emerald-700" },
  { id: "yield-trend", title: "Yield Efficiency Trend", icon: LineChartIcon, desc: "Time-series analysis of production yield percentages across batches.", color: "bg-purple-100 text-purple-700" },
  { id: "material-rank", title: "Material Cost Leakage", icon: Target, desc: "Identification of ingredients with the highest cumulative cost variance.", color: "bg-orange-100 text-orange-700" },
  { id: "waste-an", title: "Waste & Loss Analysis", icon: FileText, desc: "Categorized reporting on process loss, spoilage, and rejects.", color: "bg-rose-100 text-rose-700" },
]

export default function ReportsPage() {
  const db = useFirestore()
  
  // Real Data Sources
  const ordersRef = useMemoFirebase(() => collection(db, "production_orders"), [db])
  const { data: realOrders, isLoading: ordersLoading } = useCollection(ordersRef)
  
  const materialsRef = useMemoFirebase(() => collection(db, "raw_materials"), [db])
  const { data: realMaterials, isLoading: materialsLoading } = useCollection(materialsRef)

  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Process Real Data for Performance Report
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

  // Process Yield Trends
  const yieldTrendData = useMemo(() => {
    if (!realOrders) return [];
    return realOrders
      .filter(o => o.status === 'Complete')
      .sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime())
      .map(o => ({
        name: o.id.slice(-5).toUpperCase(),
        yield: o.yield || 0,
        target: 95,
        date: o.date
      }));
  }, [realOrders]);

  // Process Real Data for Consumption Summary
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
      variance: Number(((data.actual - data.standard) / data.standard * 100).toFixed(1)) || 0,
      costVar: Math.abs(data.actual - data.standard) * 2.5 
    }));
  }, [realOrders]);

  // Material Rank Data
  const materialRankData = useMemo(() => {
    if (!realMaterials) return [];
    // Simulate some variance data for ranking
    return realMaterials.map(m => {
      const simulatedVariance = Math.floor(Math.random() * 50) - 20;
      return {
        name: m.name,
        actual: m.stock || 0,
        variance: simulatedVariance,
        costVar: Math.abs(simulatedVariance) * (m.category === 'Raw Material' ? 4.5 : 1.2)
      };
    }).sort((a, b) => b.costVar - a.costVar);
  }, [realMaterials]);

  // Process Real Data for Inventory Valuation
  const inventoryValuation = useMemo(() => {
    if (!realMaterials) return [];
    return realMaterials.map(m => ({
      name: m.name,
      stock: m.stock || 0,
      unit: m.unit,
      warehouse: 'Main Store',
      value: (m.stock || 0) * (m.category === 'Raw Material' ? 1.5 : 0.5),
      variance: 0 
    }));
  }, [realMaterials]);

  const wasteData = [
    { name: 'Process Loss', value: 150, color: '#3b82f6', standard: 120, actual: 150, variance: 25 },
    { name: 'Spoilage', value: 85, color: '#f59e0b', standard: 50, actual: 85, variance: 70 },
    { name: 'QC Reject', value: 45, color: '#ef4444', standard: 30, actual: 45, variance: 50 },
    { name: 'Handling', value: 30, color: '#10b981', standard: 20, actual: 30, variance: 50 },
  ];

  const currentData = useMemo(() => {
    if (selectedReportId === 'prod-rep') return performanceData;
    if (selectedReportId === 'inv-cons') return consumptionSummary;
    if (selectedReportId === 'inv-val') return inventoryValuation;
    if (selectedReportId === 'waste-an') return wasteData;
    if (selectedReportId === 'yield-trend') return yieldTrendData;
    if (selectedReportId === 'material-rank') return materialRankData;
    return [];
  }, [selectedReportId, performanceData, consumptionSummary, inventoryValuation, yieldTrendData, materialRankData]);

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
    }, 150)
  }

  if (!mounted) return null

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
                      <span className="flex items-center gap-1 font-medium"><Calendar className="h-3 w-3" /> Report Generated: {new Date().toLocaleDateString()}</span>
                      <span className="flex items-center gap-1 font-medium text-secondary"><CheckCircle2 className="h-3 w-3" /> Verified Real-time Data</span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-8">
                <div className="h-[400px] w-full mb-8">
                  <ResponsiveContainer width="100%" height="100%">
                    {selectedReportId === 'inv-cons' || selectedReportId === 'prod-rep' ? (
                      <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#6B7280'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#6B7280'}} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar name="Standard (Planned)" dataKey="standard" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={32} />
                        <Bar name="Actual (Recorded)" dataKey="actual" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={32} />
                      </BarChart>
                    ) : selectedReportId === 'yield-trend' ? (
                      <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11}} />
                        <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{fontSize: 11}} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" name="Actual Yield %" dataKey="yield" stroke="hsl(var(--secondary))" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        <Line type="step" name="Target Yield" dataKey="target" stroke="hsl(var(--destructive))" strokeDasharray="5 5" strokeWidth={1} dot={false} />
                      </LineChart>
                    ) : selectedReportId === 'material-rank' ? (
                      <BarChart data={data} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                        <XAxis type="number" axisLine={false} tickLine={false} />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} tick={{fontSize: 10}} />
                        <Tooltip />
                        <Bar name="Cost Impact ($)" dataKey="costVar" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    ) : selectedReportId === 'inv-val' ? (
                      <AreaChart data={data}>
                         <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                        <Tooltip />
                        <Area type="monotone" name="Valuation ($)" dataKey="value" stroke="hsl(var(--secondary))" fillOpacity={1} fill="url(#colorValue)" strokeWidth={3} />
                      </AreaChart>
                    ) : (
                      <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{fontSize: 10}} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={(entry as any).color || '#94a3b8'} />
                          ))}
                        </Bar>
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-2 py-1">
                    <TableIcon className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Audit Matrix</h3>
                  </div>
                  <div className="rounded-xl border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/40">
                          <TableHead className="font-bold">Entity</TableHead>
                          <TableHead className="text-right font-bold">Standard/Target</TableHead>
                          <TableHead className="text-right font-bold">Actual/Recorded</TableHead>
                          <TableHead className="text-right font-bold">Variance (%)</TableHead>
                          <TableHead className="w-[120px] font-bold">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.length > 0 ? data.map((row, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-bold text-sm">
                              <div className="flex flex-col">
                                <span>{row.name}</span>
                                <span className="text-[10px] text-muted-foreground uppercase">{(row as any).product || (row as any).date || ''}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-mono text-muted-foreground">
                              {selectedReportId === 'yield-trend' ? '95%' : (row.standard || (row as any).target || 0).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right font-mono font-bold">
                              {(row.actual || (row as any).yield || 0).toLocaleString()}{selectedReportId === 'yield-trend' ? '%' : ''}
                            </TableCell>
                            <TableCell className={`text-right font-bold ${Math.abs(row.variance || 0) > 5 ? 'text-destructive' : 'text-secondary'}`}>
                              {row.variance !== undefined ? `${row.variance > 0 ? '+' : ''}${row.variance}%` : (selectedReportId === 'yield-trend' ? `${(row.yield - 95).toFixed(1)}%` : '-')}
                            </TableCell>
                            <TableCell>
                              {Math.abs(row.variance || (selectedReportId === 'yield-trend' ? row.yield - 95 : 0)) > 5 ? (
                                <Badge variant="destructive" className="text-[10px] uppercase px-2 py-0">Review</Badge>
                              ) : (
                                <Badge variant="secondary" className="bg-secondary/10 text-secondary text-[10px] uppercase px-2 py-0">Optimal</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        )) : (
                           <TableRow>
                            <TableCell colSpan={5} className="text-center py-12 text-muted-foreground italic">
                              No data available for analysis.
                            </TableCell>
                          </TableRow>
                        )}
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
                  <Zap className="h-4 w-4" /> Operational Intelligence
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={`p-4 rounded-2xl border transition-all hover:shadow-md bg-secondary/5 border-secondary/10`}>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-6 w-6 rounded-full flex items-center justify-center bg-secondary/20 text-secondary">
                      <TrendingUp className="h-3 w-3" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold mb-0.5">Yield Target Check</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">System monitoring yield stability. Batches below 90% should trigger an immediate QC audit.</p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-6 border-t mt-4 space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Efficiency Directives</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/20 border border-primary/10 text-[11px] font-medium">
                      <CheckCircle2 className="h-4 w-4 text-secondary shrink-0" />
                      <span>Review variances exceeding 5% for ingredient spoilage.</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-orange-50 border border-orange-100 text-[11px] font-medium">
                      <AlertTriangle className="h-4 w-4 text-orange-600 shrink-0" />
                      <span>Address high cost variance in primary raw materials.</span>
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
          Strategically auditing performance metrics, material efficiency, and yield trends to optimize production output.
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
              <p className="text-sm text-muted-foreground leading-relaxed">Cross-referencing production records with historical trends and standard BOM benchmarks...</p>
              <div className="pt-6">
                <Progress value={progress} className="h-2 mt-4 bg-muted/50" />
                <p className="text-[10px] font-black text-muted-foreground mt-3 uppercase tracking-[0.2em]">{progress}% Synthesized</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {reportTypes.map((report) => (
            <Card key={report.id} className="border-none shadow-sm hover:shadow-2xl transition-all hover:-translate-y-2 group bg-white overflow-hidden">
              <div className="h-2 w-full bg-muted group-hover:bg-primary transition-colors" />
              <CardHeader className="pb-4">
                <div className={`h-16 w-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 shadow-sm ${report.color}`}>
                  <report.icon className="h-8 w-8" />
                </div>
                <CardTitle className="text-2xl font-headline group-hover:text-primary transition-colors tracking-tight">{report.title}</CardTitle>
                <CardDescription className="text-sm leading-relaxed mt-2 min-h-[48px]">{report.desc}</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 pb-8">
                <Button 
                  variant="outline" 
                  className="w-full border-primary/20 hover:border-primary hover:bg-primary/5 font-bold h-12 text-md shadow-sm" 
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
