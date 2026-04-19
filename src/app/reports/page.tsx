
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
  Table as TableIcon
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
  Cell
} from "recharts"

const reportTypes = [
  { id: "prod-rep", title: "Production Reporting", icon: Factory, desc: "Daily/Weekly production output summary and line efficiency.", color: "bg-orange-100 text-orange-700" },
  { id: "inv-cons", title: "Inventory Consumption", icon: ShoppingCart, desc: "Detailed analysis of raw material usage against output.", color: "bg-purple-100 text-purple-700" },
  { id: "inv-val", title: "Inventory Valuation", icon: BarChart3, desc: "Total asset value across all physical warehouses.", color: "bg-primary/10 text-primary" },
  { id: "prod-var", title: "Production Variance", icon: PieChartIcon, desc: "Detailed breakdown of BOM vs Actual material costs.", color: "bg-secondary/10 text-secondary" },
  { id: "waste-an", title: "Waste Analysis", icon: FileText, desc: "Trend report on waste reasons and scrap quantities.", color: "bg-destructive/10 text-destructive" },
  { id: "supp-perf", title: "Supplier Performance", icon: Zap, desc: "Delivery accuracy and raw material quality metrics.", color: "bg-accent text-accent-foreground" },
]

const mockDataMap: Record<string, any[]> = {
  "prod-rep": [
    { name: 'Line 1', value: 8500, secondary: '92%', status: 'Optimal' },
    { name: 'Line 2', value: 6200, secondary: '88%', status: 'Running' },
    { name: 'Line 3', value: 4100, secondary: '74%', status: 'Maintenance' },
    { name: 'Packing', value: 9800, secondary: '95%', status: 'Optimal' },
  ],
  "inv-cons": [
    { name: 'Raw Milk', value: 12500, secondary: '-2%', status: 'Within BOM' },
    { name: 'Sea Salt', value: 450, secondary: '+5%', status: 'High Var' },
    { name: 'Rennet', value: 25, secondary: '0%', status: 'On Target' },
    { name: 'Culture', value: 15, secondary: '+1%', status: 'On Target' },
  ],
  "inv-val": [
    { name: 'Main Whse', value: 45000, secondary: 'Building A', status: 'Active' },
    { name: 'Cold Store', value: 32000, secondary: 'Building B', status: 'Active' },
    { name: 'Raw Depot', value: 28000, secondary: 'Building B', status: 'Active' },
  ],
  "default": [
    { name: 'Metric A', value: 4000, secondary: 'N/A', status: 'N/A' },
    { name: 'Metric B', value: 3000, secondary: 'N/A', status: 'N/A' },
    { name: 'Metric C', value: 2000, secondary: 'N/A', status: 'N/A' },
  ]
}

const insightsMap: Record<string, { title: string, desc: string, type: 'up' | 'down' | 'alert' }[]> = {
  "prod-rep": [
    { title: "Throughput Up", desc: "Line 1 exceeded targets by 8% this week.", type: "up" },
    { title: "Line 3 Downtime", desc: "Maintenance delayed production for 4 hours on Tuesday.", type: "alert" },
  ],
  "inv-cons": [
    { title: "Efficient Usage", desc: "Milk consumption is 2% below BOM estimates.", type: "up" },
    { title: "Spike in Salt", desc: "Batch #099 showed unusual salt usage increase.", type: "alert" },
  ],
  "default": [
    { title: "General Growth", desc: "Operational efficiency is trending positive.", type: "up" },
    { title: "Data Audit", desc: "System logs show 100% data integrity for this period.", type: "up" },
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
    }, 150)
  }

  if (selectedReportId) {
    const report = reportTypes.find(r => r.id === selectedReportId)
    const data = mockDataMap[selectedReportId] || mockDataMap["default"]
    const insights = insightsMap[selectedReportId] || insightsMap["default"]

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setSelectedReportId(null)} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Catalog
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" /> Export CSV</Button>
            <Button size="sm" className="bg-secondary text-secondary-foreground"><Download className="h-4 w-4 mr-2" /> PDF Report</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Card className="lg:col-span-8 border-none shadow-sm">
            <CardHeader className="border-b pb-6">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${report?.color}`}>
                  {report && <report.icon className="h-6 w-6" />}
                </div>
                <div>
                  <CardTitle className="font-headline text-2xl">{report?.title}</CardTitle>
                  <CardDescription>Reporting Period: May 1, 2024 - May 31, 2024</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[300px] mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6B7280'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6B7280'}} />
                    <Tooltip 
                      cursor={{fill: '#F9FAFB'}}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} 
                    />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]}>
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'hsl(var(--primary))' : 'hsl(var(--secondary))'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <TableIcon className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Detailed Grid View</h3>
                </div>
                <div className="rounded-xl border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableHead>Target Entity</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                        <TableHead>{selectedReportId === 'prod-rep' ? 'Efficiency' : selectedReportId === 'inv-cons' ? 'Variance' : 'Location/Info'}</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.map((row, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{row.name}</TableCell>
                          <TableCell className="text-right font-bold">{row.value.toLocaleString()}</TableCell>
                          <TableCell>
                            <span className={row.secondary.startsWith('+') ? 'text-destructive font-bold' : row.secondary.startsWith('-') ? 'text-secondary font-bold' : ''}>
                              {row.secondary}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={row.status === 'Optimal' || row.status === 'Active' ? 'secondary' : row.status === 'Maintenance' || row.status === 'High Var' ? 'destructive' : 'outline'} className="text-[10px] px-1.5 py-0">
                              {row.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-4 space-y-6">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Key Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {insights.map((insight, idx) => (
                  <div key={idx} className={`flex items-start gap-3 p-4 rounded-xl border ${
                    insight.type === 'up' ? 'bg-secondary/5 border-secondary/10' : 
                    insight.type === 'alert' ? 'bg-destructive/5 border-destructive/10' : 'bg-muted/30 border-muted'
                  }`}>
                    {insight.type === 'up' && <TrendingUp className="h-5 w-5 text-secondary mt-0.5" />}
                    {insight.type === 'alert' && <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />}
                    {insight.type === 'down' && <TrendingDown className="h-5 w-5 text-orange-500 mt-0.5" />}
                    <div>
                      <p className="text-sm font-bold">{insight.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{insight.desc}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Report Verification</CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Data Integrity</span>
                  <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Verified
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Generated On</span>
                  <span className="font-medium">{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Source Records</span>
                  <span className="font-medium">2,845 items</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold font-headline text-foreground">Operational Reporting</h1>
        <p className="text-muted-foreground text-lg">Generate and analyze detailed performance and inventory metrics.</p>
      </div>

      {isGenerating ? (
        <Card className="border-none shadow-xl py-24">
          <CardContent className="flex flex-col items-center justify-center max-w-md mx-auto text-center space-y-8">
            <div className="relative h-16 w-16">
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary/50" />
              </div>
            </div>
            <div className="space-y-3 w-full">
              <h3 className="font-bold text-2xl">Compiling Data...</h3>
              <p className="text-sm text-muted-foreground">Analyzing ledger entries and calculating variances.</p>
              <Progress value={progress} className="h-3 mt-6" />
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">{progress}% Complete</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportTypes.map((report) => (
            <Card key={report.id} className="border-none shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group">
              <CardHeader>
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${report.color}`}>
                  <report.icon className="h-7 w-7" />
                </div>
                <CardTitle className="text-xl font-headline group-hover:text-primary transition-colors">{report.title}</CardTitle>
                <CardDescription className="line-clamp-2 min-h-[40px]">{report.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full border-primary/20 hover:border-primary hover:bg-primary/5 font-bold" onClick={() => handleGenerate(report.id)}>
                  Generate Report
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
