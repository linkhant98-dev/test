
"use client"

import { FileText, Download, BarChart3, PieChart as PieChartIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Operational Reporting</h1>
        <p className="text-muted-foreground">Generate and export detailed performance and inventory reports.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: "Inventory Valuation", icon: BarChart3, desc: "Total asset value across all warehouses." },
          { title: "Production Variance", icon: PieChartIcon, desc: "Detailed breakdown of BOM vs Actual costs." },
          { title: "Waste Analysis", icon: FileText, desc: "Trend report on waste reasons and quantities." },
          { title: "Supplier Performance", icon: BarChart3, desc: "Delivery accuracy and quality metrics." },
          { title: "Yield Trends", icon: PieChartIcon, desc: "Historical production yield percentages." },
        ].map((report, i) => (
          <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <report.icon className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg font-headline">{report.title}</CardTitle>
              <CardDescription>{report.desc}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" /> Generate Report
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
