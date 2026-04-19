
"use client"

import { useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  Save, 
  Calculator, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight,
  TrendingUp,
  TrendingDown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

// Mock BOM data for calculation
const MOCK_BOM = [
  { material: "Raw Milk", stdQtyPerUnit: 10.5, unit: "L" },
  { material: "Rennet Extract", stdQtyPerUnit: 0.05, unit: "kg" },
  { material: "Sea Salt", stdQtyPerUnit: 0.12, unit: "kg" },
]

export default function RecordConsumptionPage() {
  const { id } = useParams()
  const router = useRouter()
  
  // In a real app, you'd fetch the order details
  const plannedOutput = 1200 // Mock planned output from the order

  const [actualValues, setActualValues] = useState<Record<string, number>>(
    MOCK_BOM.reduce((acc, item) => ({ ...acc, [item.material]: item.stdQtyPerUnit * plannedOutput }), {})
  )

  const analysis = useMemo(() => {
    return MOCK_BOM.map(item => {
      const standard = item.stdQtyPerUnit * plannedOutput
      const actual = actualValues[item.material] || 0
      const variance = actual - standard
      const variancePercent = (variance / standard) * 100
      
      return {
        ...item,
        standard,
        actual,
        variance,
        variancePercent
      }
    })
  }, [actualValues, plannedOutput])

  const totalVariancePercent = useMemo(() => {
    const totalStd = analysis.reduce((acc, curr) => acc + curr.standard, 0)
    const totalAct = analysis.reduce((acc, curr) => acc + curr.actual, 0)
    return ((totalAct - totalStd) / totalStd) * 100
  }, [analysis])

  const handleSave = () => {
    // Save logic here (e.g., Firestore updateDoc)
    router.push('/production')
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/production" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Orders
        </Link>
        <div className="flex items-center gap-2">
           <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
             Order: {id}
           </Badge>
           <Badge variant="secondary">
             Planned: {plannedOutput} kg
           </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="font-headline text-xl">Consumption Data Entry</CardTitle>
              <CardDescription>Enter actual material quantities used for this production run.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Material</TableHead>
                    <TableHead className="text-right">Standard Qty</TableHead>
                    <TableHead className="w-[180px] text-right">Actual Qty</TableHead>
                    <TableHead>Unit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analysis.map((item) => (
                    <TableRow key={item.material}>
                      <TableCell className="font-medium">{item.material}</TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">
                        {item.standard.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number" 
                          className="text-right font-bold"
                          value={actualValues[item.material]}
                          onChange={(e) => setActualValues({...actualValues, [item.material]: Number(e.target.value)})}
                        />
                      </TableCell>
                      <TableCell className="text-muted-foreground">{item.unit}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="font-headline text-xl">Variance Analysis</CardTitle>
              <CardDescription>Comparison of standard vs actual consumption.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Material</TableHead>
                    <TableHead className="text-right">Variance</TableHead>
                    <TableHead className="text-right">Var %</TableHead>
                    <TableHead>Insight</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analysis.map((item) => (
                    <TableRow key={item.material}>
                      <TableCell className="font-medium">{item.material}</TableCell>
                      <TableCell className={`text-right font-bold ${item.variance > 0 ? 'text-destructive' : 'text-secondary'}`}>
                        {item.variance > 0 ? '+' : ''}{item.variance.toFixed(2)}
                      </TableCell>
                      <TableCell className={`text-right font-mono text-xs ${Math.abs(item.variancePercent) > 5 ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {item.variancePercent.toFixed(1)}%
                      </TableCell>
                      <TableCell>
                        {Math.abs(item.variancePercent) > 5 ? (
                          <div className="flex items-center gap-1 text-[10px] font-bold text-destructive uppercase">
                            <AlertTriangle className="h-3 w-3" /> High Variance
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-[10px] font-bold text-secondary uppercase">
                            <CheckCircle2 className="h-3 w-3" /> Within Target
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-secondary text-secondary-foreground">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-widest opacity-80">Total Order Variance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div className="text-4xl font-bold font-headline">
                  {totalVariancePercent > 0 ? '+' : ''}{totalVariancePercent.toFixed(1)}%
                </div>
                {totalVariancePercent > 0 ? <TrendingUp className="h-8 w-8" /> : <TrendingDown className="h-8 w-8" />}
              </div>
              <p className="text-xs mt-4 opacity-70">
                Overall deviation from standard BOM configuration for this production run.
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold">Summary Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg bg-accent/20 border border-primary/10">
                <p className="text-xs font-medium leading-relaxed">
                  Based on current entries, the yield efficiency is trending <span className="font-bold">{totalVariancePercent > 0 ? 'lower' : 'higher'}</span> than the monthly average.
                </p>
              </div>
              <Button className="w-full bg-primary text-primary-foreground" onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" /> Save Consumption
              </Button>
              <Link href={`/production/ai-insights?id=${id}`}>
                <Button variant="outline" className="w-full mt-2">
                  <Sparkles className="h-4 w-4 mr-2 text-secondary" /> Run AI Diagnostic
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
