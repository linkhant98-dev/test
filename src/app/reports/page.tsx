
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
  AlertTriangle
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
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
  { id: "inv-val", title: "Inventory Valuation", icon: BarChart3, desc: "Total asset value across all warehouses.", color: "bg-primary/10 text-primary" },
  { id: "prod-var", title: "Production Variance", icon: PieChartIcon, desc: "Detailed breakdown of BOM vs Actual costs.", color: "bg-secondary/10 text-secondary" },
  { id: "waste-an", title: "Waste Analysis", icon: FileText, desc: "Trend report on waste reasons and quantities.", color: "bg-destructive/10 text-destructive" },
  { id: "supp-perf", title: "Supplier Performance", icon: BarChart3, desc: "Delivery accuracy and quality metrics.", color: "bg-accent text-accent-foreground" },
  { id: "yield-tr", title: "Yield Trends", icon: PieChartIcon, desc: "Historical production yield percentages.", color: "bg-blue-100 text-blue-700" },
]

const mockData = [
  { name: 'Jan', value: 4000 },
  { name: 'Feb', value: 3000 },
  { name: 'Mar', value: 2000 },
  { name: 'Apr', value: 2780 },
  { name: 'May', value: 1890 },
  { name: 'Jun', value: 2390 },
]

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
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
          setSelectedReport(id)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  if (selectedReport) {
    const report = reportTypes.find(r => r.id === selectedReport)
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setSelectedReport(null)} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Reports
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" /> CSV</Button>
            <Button size="sm"><Download className="h-4 w-4 mr-2" /> PDF Export</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 border-none shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${report?.color}`}>
                  {report && <report.icon className="h-5 w-5" />}
                </div>
                <div>
                  <CardTitle className="font-headline">{report?.title}</CardTitle>
                  <CardDescription>Generated for the period: May 1, 2024 - May 31, 2024</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{fill: '#F9FAFB'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-bold">Key Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/5 border border-secondary/10">
                  <TrendingUp className="h-4 w-4 text-secondary mt-1" />
                  <div>
                    <p className="text-xs font-bold">Efficiency Growth</p>
                    <p className="text-[10px] text-muted-foreground">Up 12.4% compared to last month.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-1" />
                  <div>
                    <p className="text-xs font-bold">Waste Variance</p>
                    <p className="text-[10px] text-muted-foreground">Unusual spike detected in Line 3 packaging.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-bold">Report Metadata</CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Generated By</span>
                  <span className="font-medium">System Admin</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Data Points</span>
                  <span className="font-medium">1,242</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="outline" className="text-[10px] h-4 bg-green-50 text-green-700 border-green-200">Verified</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Operational Reporting</h1>
        <p className="text-muted-foreground">Generate and export detailed performance and inventory reports.</p>
      </div>

      {isGenerating ? (
        <Card className="border-none shadow-lg py-20">
          <CardContent className="flex flex-col items-center justify-center max-w-md mx-auto text-center space-y-6">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <div className="space-y-2 w-full">
              <h3 className="font-bold text-lg">Generating Report...</h3>
              <p className="text-sm text-muted-foreground">Compiling ledger entries and simulating cost roll-ups.</p>
              <Progress value={progress} className="h-2 mt-4" />
              <p className="text-[10px] font-mono text-muted-foreground">{progress}% Complete</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportTypes.map((report) => (
            <Card key={report.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-4 ${report.color}`}>
                  <report.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg font-headline">{report.title}</CardTitle>
                <CardDescription>{report.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" onClick={() => handleGenerate(report.id)}>
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
