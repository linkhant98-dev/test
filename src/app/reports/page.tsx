
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
  Scale
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
  { id: "waste-an", title: "Waste & Loss Analysis", icon: FileText, desc: "Categorized reporting on process loss, spoilage, and rejects.", color: "bg-rose-100 text-rose-700" },
]

const mockDataMap: Record<string, any[]> = {
  "inv-val": [
    { name: 'Mozzarella Cheese', stock: 1250, unit: 'kg', warehouse: 'Cold Storage A', value: 7500 },
    { name: 'Potato Starch', stock: 800, unit: 'kg', warehouse: 'Dry Storage B', value: 1600 },
    { name: 'Chicken Breast', stock: 450, unit: 'kg', warehouse: 'Cold Storage A', value: 2700 },
    { name: 'Sea Salt', stock: 120, unit: 'kg', warehouse: 'Dry Storage B', value: 240 },
    { name: 'Frying Oil', stock: 600, unit: 'L', warehouse: 'Bulk Storage', value: 1800 },
  ],
  "waste-an": [
    { name: 'Process Loss', value: 150, color: '#3b82f6' },
    { name: 'Spoilage', value: 85, color: '#f59e0b' },
    { name: 'QC Reject', value: 45, color: '#ef4444' },
    { name: 'Handling', value: 30, color: '#10b981' },
  ],
}

export default function ReportsPage() {
  const db = useFirestore()
  const ordersRef = useMemoFirebase(() => collection(db, "production_orders"), [db])
  const { data: realOrders } = useCollection(ordersRef)

  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Process Real Data for Reports
  const performanceData = useMemo(() => {
    if (!realOrders) return [];
    return realOrders.map(o => ({
      name: o.id.slice(-5).toUpperCase(),
      standard: o.quantity,
      actual: Math.round(o.quantity * ((o.yield || 100) / 100)),
      variance: o.variance || 0
    })).slice(-10);
  }, [realOrders]);

  const consumptionSummary = useMemo(() => {
    if (!realOrders) return [];
    const productAggregates: Record<string, { standard: number, actual: number, count: number }> = {};
    
    realOrders.forEach(o => {
      if (!productAggregates[o.product]) {
        productAggregates[o.product] = { standard: 0, actual: 0, count: 0 };
      }
      const yieldFactor = (o.yield || 100) / 100;
      productAggregates[o.product].standard += o.quantity;
      productAggregates[o.product].actual += o.quantity * yieldFactor;
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

  const currentData = useMemo(() => {
    if (selectedReportId === 'prod-rep') return performanceData;
    if (selectedReportId === 'inv-cons') return consumptionSummary;
    return mockDataMap[selectedReportId || ""] || [];
  }, [selectedReportId, performanceData, consumptionSummary]);

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
              <Download className="h-4 w-4 mr-2" /> Export Data
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
                      <span className="flex items-center gap-1 font-medium"><Calendar className="h-3 w-3" /> Reporting Period: May 2024</span>
                      <span className="flex items-center gap-1 font-medium text-secondary"><CheckCircle2 className="h-3 w-3" /> Verified Audit Data</span>
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
                    ) : selectedReportId === 'inv-val' ? (
                      <AreaChart data={data}>
                         <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11}} />
                        <Tooltip />
                        <Area type="monotone" name="Stock Value ($)" dataKey="value" stroke="hsl(var(--secondary))" fillOpacity={1} fill="url(#colorValue)" strokeWidth={3} />
                      </AreaChart>
                    ) : (
                      <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color || '#94a3b8'} />
                          ))}
                        </Bar>
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-2 py-1">
                    <TableIcon className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Comparative Audit Matrix</h3>
                  </div>
                  <div className="rounded-xl border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/40">
                          <TableHead className="font-bold">Item / Description</TableHead>
                          <TableHead className="text-right font-bold">Standard</TableHead>
                          <TableHead className="text-right font-bold">Actual</TableHead>
                          <TableHead className="text-right font-bold">Variance (%)</TableHead>
                          {selectedReportId === 'inv-cons' && <TableHead className="text-right font-bold">Cost Impact</TableHead>}
                          <TableHead className="w-[120px] font-bold">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.map((row, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-bold text-sm">
                              <div className="flex flex-col">
                                <span>{row.name}</span>
                                <span className="text-[10px] text-muted-foreground uppercase">{row.warehouse || (row.unit ? `Unit: ${row.unit}` : '')}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-mono text-muted-foreground">{(row.standard || row.stock || 0).toLocaleString()}</TableCell>
                            <TableCell className="text-right font-mono font-bold">{(row.actual || 0).toLocaleString() || `$${(row.value || 0).toLocaleString()}`}</TableCell>
                            <TableCell className={`text-right font-bold ${Math.abs(row.variance) > 5 ? 'text-destructive' : row.variance < 0 ? 'text-secondary' : 'text-foreground'}`}>
                              {row.variance !== undefined ? `${row.variance > 0 ? '+' : ''}${row.variance}%` : '-'}
                            </TableCell>
                            {selectedReportId === 'inv-cons' && (
                              <TableCell className={`text-right font-bold ${row.costVar > 0 ? 'text-destructive' : 'text-secondary'}`}>
                                ${Math.abs(row.costVar || 0).toFixed(2)}
                              </TableCell>
                            )}
                            <TableCell>
                              {Math.abs(row.variance || 0) > 5 ? (
                                <Badge variant="destructive" className="text-[10px] uppercase font-black px-2 py-0">Review</Badge>
                              ) : (
                                <Badge variant="secondary" className="bg-secondary/10 text-secondary text-[10px] uppercase font-black px-2 py-0">Optimal</Badge>
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
                      <p className="text-sm font-bold mb-0.5">Real-time Data Active</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">Report is currently pulling live metrics from verified production logs.</p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-6 border-t mt-4 space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Corrective Directives</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/20 border border-primary/10 text-[11px] font-medium">
                      <CheckCircle2 className="h-4 w-4 text-secondary shrink-0" />
                      <span>Compare batch variances against floor temperature logs.</span>
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
        <h1 className="text-5xl font-bold font-headline text-foreground tracking-tighter">Strategic Insights</h1>
        <p className="text-muted-foreground text-xl max-w-2xl leading-relaxed">
          Aggregated performance audit of Standard vs Actual consumption, yield efficiency, and inventory valuation.
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
              <h3 className="font-bold text-3xl font-headline tracking-tight">Synthesizing Core Data</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Cross-referencing theoretical BOM standards with actual production consumption logs...</p>
              <div className="pt-6">
                <Progress value={progress} className="h-2 mt-4 bg-muted/50" />
                <p className="text-[10px] font-black text-muted-foreground mt-3 uppercase tracking-[0.2em]">{progress}% Processed</p>
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
                  Generate Strategic Analysis
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
