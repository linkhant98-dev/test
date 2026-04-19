
"use client"

import { useState } from "react"
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
  Layers
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
  Area
} from "recharts"

const reportTypes = [
  { id: "prod-rep", title: "Production Reporting", icon: Factory, desc: "Line-by-line efficiency, throughput targets, and downtime analysis.", color: "bg-blue-100 text-blue-700" },
  { id: "inv-cons", title: "Inventory Consumption", icon: ShoppingCart, desc: "Detailed breakdown of raw material usage against theoretical BOM requirements.", color: "bg-purple-100 text-purple-700" },
  { id: "inv-val", title: "Inventory Valuation", icon: BarChart3, desc: "Asset value distribution across cold storage and dry warehouses.", color: "bg-emerald-100 text-emerald-700" },
  { id: "prod-var", title: "Yield & Variance", icon: PieChartIcon, desc: "Analysis of production yields and material cost deviations.", color: "bg-amber-100 text-amber-700" },
  { id: "waste-an", title: "Waste & Loss Analysis", icon: FileText, desc: "Categorized reporting on process loss, spoilage, and rejects.", color: "bg-rose-100 text-rose-700" },
  { id: "supp-perf", title: "Supplier Performance", icon: Zap, desc: "Lead time accuracy and material quality metrics per vendor.", color: "bg-indigo-100 text-indigo-700" },
]

const mockDataMap: Record<string, any[]> = {
  "prod-rep": [
    { name: 'Mon', value: 1200, target: 1100, efficiency: 94 },
    { name: 'Tue', value: 1150, target: 1100, efficiency: 92 },
    { name: 'Wed', value: 900, target: 1100, efficiency: 78 },
    { name: 'Thu', value: 1300, target: 1100, efficiency: 98 },
    { name: 'Fri', value: 1250, target: 1100, efficiency: 96 },
    { name: 'Sat', value: 800, target: 800, efficiency: 100 },
    { name: 'Sun', value: 400, target: 400, efficiency: 95 },
  ],
  "inv-cons": [
    { name: 'Raw Milk', theoretical: 5000, actual: 5120, variance: 2.4 },
    { name: 'Potato Starch', theoretical: 2000, actual: 1950, variance: -2.5 },
    { name: 'Chicken Breast', theoretical: 1500, actual: 1580, variance: 5.3 },
    { name: 'Batter Mix', theoretical: 800, actual: 820, variance: 2.5 },
    { name: 'Frying Oil', theoretical: 1200, actual: 1250, variance: 4.1 },
  ],
  "waste-an": [
    { name: 'Process Loss', value: 150, color: '#3b82f6' },
    { name: 'Spoilage', value: 85, color: '#f59e0b' },
    { name: 'QC Reject', value: 45, color: '#ef4444' },
    { name: 'Handling', value: 30, color: '#10b981' },
  ],
  "default": [
    { name: 'W1', value: 4000 },
    { name: 'W2', value: 3000 },
    { name: 'W3', value: 2000 },
    { name: 'W4', value: 2780 },
  ]
}

const insightsMap: Record<string, { title: string, desc: string, type: 'up' | 'down' | 'alert' }[]> = {
  "prod-rep": [
    { title: "Weekly Target Met", desc: "Aggregate output exceeded planned targets by 4.2% despite Wednesday's downtime.", type: "up" },
    { title: "Equipment Alert", desc: "Line 3 maintenance cycle is overdue. Schedule preventive checks to avoid further unplanned stops.", type: "alert" },
    { title: "Shift Synergy", desc: "Morning shift efficiency is consistently 12% higher than night shifts.", type: "up" },
  ],
  "inv-cons": [
    { title: "Material Surplus", desc: "Potato Starch usage optimized below theoretical BOM by 2.5%.", type: "up" },
    { title: "Yield Concern", desc: "Chicken Breast over-consumption detected in batch series #PO-055 through #PO-059.", type: "alert" },
  ],
  "waste-an": [
    { title: "Waste Reduction", desc: "Total process loss decreased by 15% compared to previous month.", type: "up" },
    { title: "Critical Spoilage", desc: "Unplanned spoilage in Cold Storage A caused $1,200 loss on Thursday.", type: "alert" },
  ],
  "default": [
    { title: "Data Integrity", desc: "All ledger records verified against physical cycle counts.", type: "up" },
    { title: "System Health", desc: "Transaction latency within optimal operational parameters.", type: "up" },
  ]
}

export default function ReportsPage() {
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)

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
    }, 120)
  }

  const handlePrint = () => {
    window.print();
  }

  if (selectedReportId) {
    const report = reportTypes.find(r => r.id === selectedReportId)
    const data = mockDataMap[selectedReportId] || mockDataMap["default"]
    const insights = insightsMap[selectedReportId] || insightsMap["default"]

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
          <Button variant="ghost" onClick={() => setSelectedReportId(null)} className="gap-2 w-fit">
            <ArrowLeft className="h-4 w-4" /> Back to Catalog
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" /> Print PDF
            </Button>
            <Button size="sm" className="bg-secondary text-secondary-foreground">
              <Download className="h-4 w-4 mr-2" /> Export Dataset
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
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="font-headline text-3xl">{report?.title}</CardTitle>
                      <Badge variant="outline" className="bg-white/50 border-primary/20">Operational Audit</Badge>
                    </div>
                    <CardDescription className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> May 2024</span>
                      <span className="flex items-center gap-1"><Layers className="h-3 w-3" /> 24 Production Batches Analyzed</span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-8">
                {selectedReportId === 'prod-rep' && (
                  <div className="space-y-8">
                    <div className="h-[350px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                          <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6B7280'}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6B7280'}} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                          />
                          <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorValue)" strokeWidth={3} />
                          <Line type="monotone" dataKey="target" stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="p-4 rounded-xl bg-muted/30 border text-center">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Total Output</p>
                        <p className="text-xl font-bold">7,000 Units</p>
                      </div>
                      <div className="p-4 rounded-xl bg-muted/30 border text-center">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Avg Efficiency</p>
                        <p className="text-xl font-bold text-secondary">92.8%</p>
                      </div>
                      <div className="p-4 rounded-xl bg-muted/30 border text-center">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Uptime Rate</p>
                        <p className="text-xl font-bold">98.2%</p>
                      </div>
                      <div className="p-4 rounded-xl bg-muted/30 border text-center">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Target Delta</p>
                        <p className="text-xl font-bold text-primary">+4.2%</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedReportId === 'inv-cons' && (
                  <div className="space-y-8">
                    <div className="h-[350px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} tick={{fontSize: 11, fontWeight: 'bold'}} />
                          <Tooltip 
                             cursor={{fill: 'transparent'}}
                             contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                          />
                          <Bar dataKey="theoretical" fill="#94a3b8" radius={[0, 4, 4, 0]} barSize={20} />
                          <Bar dataKey="actual" fill="hsl(var(--secondary))" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {selectedReportId === 'waste-an' && (
                  <div className="space-y-8">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                       <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                            <Tooltip />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                              {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                       </div>
                       <div className="space-y-4">
                         <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Loss Composition</h4>
                         <div className="space-y-3">
                           {data.map(item => (
                             <div key={item.name} className="flex items-center justify-between">
                               <div className="flex items-center gap-2">
                                 <div className="h-2 w-2 rounded-full" style={{backgroundColor: item.color}} />
                                 <span className="text-sm">{item.name}</span>
                               </div>
                               <span className="text-sm font-bold">{((item.value / 310) * 100).toFixed(1)}%</span>
                             </div>
                           ))}
                         </div>
                       </div>
                     </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/10 p-4 border-b">
                <div className="flex items-center gap-2">
                  <TableIcon className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-sm font-bold uppercase tracking-wider">Detailed Audit Records</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Entity</TableHead>
                      <TableHead className="text-right">Observed Value</TableHead>
                      <TableHead className="text-right">Target/Standard</TableHead>
                      <TableHead className="text-right">Variance</TableHead>
                      <TableHead>Assessment</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{row.name}</TableCell>
                        <TableCell className="text-right font-bold">{row.value || row.actual || '-'}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{row.target || row.theoretical || '-'}</TableCell>
                        <TableCell className={`text-right font-bold ${row.variance > 0 ? 'text-destructive' : row.variance < 0 ? 'text-secondary' : ''}`}>
                          {row.variance ? `${row.variance > 0 ? '+' : ''}${row.variance}%` : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={Math.abs(row.variance || 0) > 5 ? 'destructive' : 'secondary'} className="text-[10px]">
                            {Math.abs(row.variance || 0) > 5 ? 'Investigation Required' : 'Stabilized'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-6 print:hidden">
            <Card className="border-none shadow-sm h-full">
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Strategic Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {insights.map((insight, idx) => (
                  <div key={idx} className={`relative p-5 rounded-2xl border ${
                    insight.type === 'up' ? 'bg-secondary/5 border-secondary/10' : 
                    insight.type === 'alert' ? 'bg-destructive/5 border-destructive/10' : 'bg-muted/30 border-muted'
                  }`}>
                    <div className="flex items-start gap-4">
                      <div className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center ${
                        insight.type === 'up' ? 'bg-secondary/10 text-secondary' : 
                        insight.type === 'alert' ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'
                      }`}>
                        {insight.type === 'up' && <TrendingUp className="h-4 w-4" />}
                        {insight.type === 'alert' && <AlertTriangle className="h-4 w-4" />}
                        {insight.type === 'down' && <TrendingDown className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold mb-1">{insight.title}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{insight.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="pt-6 border-t mt-4">
                   <h4 className="text-xs font-bold uppercase text-muted-foreground mb-4">Recommended Actions</h4>
                   <div className="space-y-3">
                     <div className="flex items-center gap-3 text-xs p-3 rounded-xl bg-accent/20 border border-primary/10">
                       <CheckCircle2 className="h-4 w-4 text-secondary" />
                       <span>Re-calibrate scale sensors in Cold Storage A.</span>
                     </div>
                     <div className="flex items-center gap-3 text-xs p-3 rounded-xl bg-accent/20 border border-primary/10">
                       <CheckCircle2 className="h-4 w-4 text-secondary" />
                       <span>Verify BOM recipe #BOM-OCS-01 salt levels.</span>
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
        <h1 className="text-5xl font-bold font-headline text-foreground tracking-tight">Operational Reporting</h1>
        <p className="text-muted-foreground text-xl max-w-2xl">
          Synthesize complex production and inventory data into actionable operational business intelligence.
        </p>
      </div>

      {isGenerating ? (
        <Card className="border-none shadow-xl bg-white/50 backdrop-blur-sm py-32">
          <CardContent className="flex flex-col items-center justify-center max-w-md mx-auto text-center space-y-10">
            <div className="relative h-20 w-20">
              <Loader2 className="h-20 w-20 text-primary animate-spin stroke-[1.5]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <FileText className="h-8 w-8 text-primary/40" />
              </div>
            </div>
            <div className="space-y-4 w-full">
              <h3 className="font-bold text-3xl font-headline">Synthesizing Reports</h3>
              <p className="text-sm text-muted-foreground">Calculating variances and aggregating batch consumption data from 2,845 recent transactions.</p>
              <div className="pt-4">
                <Progress value={progress} className="h-2 mt-4 bg-muted/50" />
                <p className="text-[10px] font-mono text-muted-foreground mt-2 uppercase tracking-[0.2em]">{progress}% Processed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reportTypes.map((report) => (
            <Card key={report.id} className="border-none shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 group bg-white">
              <CardHeader className="pb-4">
                <div className={`h-16 w-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 shadow-sm ${report.color}`}>
                  <report.icon className="h-8 w-8" />
                </div>
                <CardTitle className="text-2xl font-headline group-hover:text-primary transition-colors">{report.title}</CardTitle>
                <CardDescription className="text-sm leading-relaxed mt-2 min-h-[48px]">{report.desc}</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <Button 
                  variant="outline" 
                  className="w-full border-primary/20 hover:border-primary hover:bg-primary/5 font-bold h-11 text-md" 
                  onClick={() => handleGenerate(report.id)}
                >
                  Generate Intelligence
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
