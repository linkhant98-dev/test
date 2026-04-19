
"use client"

import { useState, useEffect } from "react"
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
  "prod-rep": [
    { name: 'Batch 001', actual: 1200, standard: 1100, variance: 9.1 },
    { name: 'Batch 002', actual: 1150, standard: 1100, variance: 4.5 },
    { name: 'Batch 003', actual: 980, standard: 1100, variance: -10.9 },
    { name: 'Batch 004', actual: 1300, standard: 1100, variance: 18.2 },
    { name: 'Batch 005', actual: 1250, standard: 1100, variance: 13.6 },
  ],
  "inv-cons": [
    { name: 'Mozzarella Cheese', standard: 500, actual: 525, variance: 5.0, unit: 'kg', costVar: 125.50 },
    { name: 'Potato Starch', standard: 200, actual: 192, variance: -4.0, unit: 'kg', costVar: -32.00 },
    { name: 'Chicken Breast', standard: 150, actual: 162, variance: 8.0, unit: 'kg', costVar: 96.00 },
    { name: 'Batter Mix', standard: 80, actual: 82, variance: 2.5, unit: 'kg', costVar: 10.50 },
    { name: 'Frying Oil', standard: 120, actual: 135, variance: 12.5, unit: 'L', costVar: 45.00 },
    { name: 'Premium Sausage', standard: 1000, actual: 1005, variance: 0.5, unit: 'units', costVar: 7.50 },
  ],
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

const insightsMap: Record<string, { title: string, desc: string, type: 'up' | 'down' | 'alert' }[]> = {
  "prod-rep": [
    { title: "Standard Output Exceeded", desc: "Aggregate output exceeded planned targets by 6.8% across 5 batches.", type: "up" },
    { title: "Efficiency Dip", desc: "Batch 003 showed a 10.9% deficit due to equipment downtime.", type: "alert" },
  ],
  "inv-cons": [
    { title: "High Material Variance", desc: "Frying Oil consumption is 12.5% above standard. Investigate fryer temperature settings.", type: "alert" },
    { title: "Chicken Yield Concern", desc: "8% over-consumption of chicken breast noted in the Chicken PopCorn run.", type: "alert" },
    { title: "Efficient Starch Usage", desc: "Potato Starch remains 4% under budget with no impact on quality.", type: "up" },
  ],
  "inv-val": [
    { title: "High Stock Level", desc: "Mozzarella stock is at 95% capacity in Cold Storage A.", type: "alert" },
    { title: "Valuation Growth", desc: "Total inventory value increased by 12% this month.", type: "up" },
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
    const data = mockDataMap[selectedReportId] || []
    const insights = insightsMap[selectedReportId] || []

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
                        <Bar name="Standard Usage" dataKey="standard" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={32} />
                        <Bar name="Actual Usage" dataKey="actual" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={32} />
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
                            <Cell key={`cell-${index}`} fill={entry.color} />
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
                            <TableCell className="text-right font-mono text-muted-foreground">{row.standard?.toLocaleString() || row.stock?.toLocaleString()}</TableCell>
                            <TableCell className="text-right font-mono font-bold">{row.actual?.toLocaleString() || `$${row.value?.toLocaleString()}`}</TableCell>
                            <TableCell className={`text-right font-bold ${row.variance > 5 ? 'text-destructive' : row.variance < 0 ? 'text-secondary' : 'text-foreground'}`}>
                              {row.variance !== undefined ? `${row.variance > 0 ? '+' : ''}${row.variance}%` : '-'}
                            </TableCell>
                            {selectedReportId === 'inv-cons' && (
                              <TableCell className={`text-right font-bold ${row.costVar > 0 ? 'text-destructive' : 'text-secondary'}`}>
                                ${Math.abs(row.costVar).toFixed(2)}
                              </TableCell>
                            )}
                            <TableCell>
                              {Math.abs(row.variance) > 5 ? (
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
                {insights.length > 0 ? insights.map((insight, idx) => (
                  <div key={idx} className={`p-4 rounded-2xl border transition-all hover:shadow-md ${
                    insight.type === 'up' ? 'bg-secondary/5 border-secondary/10' : 
                    insight.type === 'alert' ? 'bg-destructive/5 border-destructive/10' : 'bg-muted/30 border-muted'
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 h-6 w-6 rounded-full flex items-center justify-center ${
                        insight.type === 'up' ? 'bg-secondary/20 text-secondary' : 
                        insight.type === 'alert' ? 'bg-destructive/20 text-destructive' : 'bg-muted text-muted-foreground'
                      }`}>
                        {insight.type === 'up' && <TrendingUp className="h-3 w-3" />}
                        {insight.type === 'alert' && <AlertTriangle className="h-3 w-3" />}
                        {insight.type === 'down' && <TrendingDown className="h-3 w-3" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold mb-0.5">{insight.title}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{insight.desc}</p>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <Info className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-20" />
                    <p className="text-xs text-muted-foreground italic">No strategic insights generated for this report.</p>
                  </div>
                )}
                
                <div className="pt-6 border-t mt-4 space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Corrective Directives</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/20 border border-primary/10 text-[11px] font-medium">
                      <CheckCircle2 className="h-4 w-4 text-secondary shrink-0" />
                      <span>Audit fryer oil consumption vs temperature logs.</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/20 border border-primary/10 text-[11px] font-medium">
                      <CheckCircle2 className="h-4 w-4 text-secondary shrink-0" />
                      <span>Re-verify chicken breast recipe scaling.</span>
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
