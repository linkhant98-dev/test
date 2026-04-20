
"use client"

import { useState, useMemo, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  Save, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown,
  Loader2,
  Info
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useTranslation } from "@/context/language-context"
import { useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking, addDocumentNonBlocking, useUser } from "@/firebase"
import { doc, collection } from "firebase/firestore"

// Core BOM reference for different products
const BOM_MAP: Record<string, { material: string, stdQtyPerUnit: number, unit: string }[]> = {
  "Original Cheese Stick": [
    { material: "Mozzarella Cheese", stdQtyPerUnit: 0.05, unit: "kg" },
    { material: "Batter Mix", stdQtyPerUnit: 0.02, unit: "kg" },
    { material: "Breadcrumbs", stdQtyPerUnit: 0.02, unit: "kg" },
    { material: "Frying Oil", stdQtyPerUnit: 0.01, unit: "L" },
  ],
  "Long Potato": [
    { material: "Potato Starch", stdQtyPerUnit: 0.08, unit: "kg" },
    { material: "Seasoning Powder", stdQtyPerUnit: 0.005, unit: "kg" },
    { material: "Frying Oil", stdQtyPerUnit: 0.015, unit: "L" },
  ],
  "Chicken PopCorn": [
    { material: "Chicken Breast (Minced)", stdQtyPerUnit: 0.1, unit: "kg" },
    { material: "Seasoning Powder", stdQtyPerUnit: 0.01, unit: "kg" },
    { material: "Breadcrumbs", stdQtyPerUnit: 0.03, unit: "kg" },
    { material: "Frying Oil", stdQtyPerUnit: 0.02, unit: "L" },
  ],
  "Sausage Cheese Stick": [
    { material: "Premium Sausage", stdQtyPerUnit: 1, unit: "units" },
    { material: "Mozzarella Cheese", stdQtyPerUnit: 0.03, unit: "kg" },
    { material: "Batter Mix", stdQtyPerUnit: 0.02, unit: "kg" },
    { material: "Frying Oil", stdQtyPerUnit: 0.01, unit: "L" },
  ]
}

export default function RecordConsumptionPage() {
  const { id } = useParams()
  const router = useRouter()
  const { t } = useTranslation()
  const db = useFirestore()
  const { user } = useUser()

  const orderRef = useMemoFirebase(() => doc(db, "production_orders", id as string), [db, id])
  const { data: order, isLoading } = useDoc(orderRef)

  const activeBOM = useMemo(() => {
    if (!order) return []
    return BOM_MAP[order.product] || []
  }, [order])

  const [actualValues, setActualValues] = useState<Record<string, number>>({})

  useEffect(() => {
    if (order && activeBOM.length > 0 && Object.keys(actualValues).length === 0) {
      const initial: Record<string, number> = {}
      activeBOM.forEach(item => {
        initial[item.material] = Number((item.stdQtyPerUnit * order.quantity).toFixed(2))
      })
      setActualValues(initial)
    }
  }, [order, activeBOM, actualValues])

  const analysis = useMemo(() => {
    if (!order) return []
    return activeBOM.map(item => {
      const standard = item.stdQtyPerUnit * order.quantity
      const actual = actualValues[item.material] ?? standard
      const variance = actual - standard
      const variancePercent = standard > 0 ? (variance / standard) * 100 : 0
      
      return {
        ...item,
        standard,
        actual,
        variance,
        variancePercent
      }
    })
  }, [actualValues, order, activeBOM])

  const totalVariancePercent = useMemo(() => {
    if (analysis.length === 0) return 0
    const significantVariances = analysis.map(a => a.variancePercent)
    return significantVariances.reduce((a, b) => a + b, 0) / analysis.length
  }, [analysis])

  const handleSave = () => {
    if (!user || !order) return

    // 1. Record individual consumption records in the subcollection
    const consumptionColRef = collection(db, "production_orders", id as string, "consumption_records")
    analysis.forEach(item => {
      addDocumentNonBlocking(consumptionColRef, {
        materialId: item.material,
        plannedQuantity: item.standard,
        actualQuantity: item.actual,
        variance: item.variance,
        variancePercent: item.variancePercent,
        userId: user.uid,
        timestamp: new Date().toISOString()
      })
    })

    // 2. Update the parent order summary
    updateDocumentNonBlocking(orderRef, {
      status: "Complete",
      yield: Number((100 - Math.abs(totalVariancePercent)).toFixed(1)),
      variance: Number(totalVariancePercent.toFixed(1)),
      completedAt: new Date().toISOString()
    })

    router.push('/production')
  }

  if (isLoading || !order) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/production" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Orders
        </Link>
        <div className="flex items-center gap-2">
           <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-bold px-3">
             Order: {order.id.slice(-5).toUpperCase()}
           </Badge>
           <Badge variant="secondary" className="font-bold px-3">
             Target: {order.quantity.toLocaleString()} Units
           </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="font-headline text-xl">Consumption Data Entry</CardTitle>
              <CardDescription>Enter actual material quantities used for the <strong>{order.product}</strong> run.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Raw Material</TableHead>
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
                          className="text-right font-bold focus:ring-secondary"
                          value={actualValues[item.material] ?? ""}
                          onChange={(e) => setActualValues({...actualValues, [item.material]: Number(e.target.value)})}
                        />
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs uppercase font-bold">{item.unit}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="font-headline text-xl">Raw Variance Analysis</CardTitle>
              <CardDescription>Live comparison of actual consumption vs standard BOM requirements.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Material</TableHead>
                    <TableHead className="text-right">Variance</TableHead>
                    <TableHead className="text-right">Var %</TableHead>
                    <TableHead>Audit Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analysis.map((item) => (
                    <TableRow key={item.material}>
                      <TableCell className="font-medium">{item.material}</TableCell>
                      <TableCell className={`text-right font-bold ${item.variance > 0 ? 'text-destructive' : 'text-secondary'}`}>
                        {item.variance > 0 ? '+' : ''}{item.variance.toFixed(2)}
                      </TableCell>
                      <TableCell className={`text-right font-mono text-xs font-bold ${Math.abs(item.variancePercent) > 5 ? 'text-destructive' : 'text-secondary'}`}>
                        {item.variancePercent.toFixed(1)}%
                      </TableCell>
                      <TableCell>
                        {Math.abs(item.variancePercent) > 5 ? (
                          <div className="flex items-center gap-1 text-[10px] font-black text-destructive uppercase">
                            <AlertTriangle className="h-3 w-3" /> High Deviation
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-[10px] font-black text-secondary uppercase">
                            <CheckCircle2 className="h-3 w-3" /> Within Tolerance
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
          <Card className={`border-none shadow-sm text-secondary-foreground transition-colors ${totalVariancePercent > 5 ? 'bg-destructive/90' : 'bg-secondary'}`}>
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-widest opacity-80">Aggregate Order Variance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div className="text-4xl font-bold font-headline">
                  {totalVariancePercent > 0 ? '+' : ''}{totalVariancePercent.toFixed(1)}%
                </div>
                {totalVariancePercent > 0 ? <TrendingUp className="h-8 w-8" /> : <TrendingDown className="h-8 w-8" />}
              </div>
              <p className="text-xs mt-4 opacity-70 leading-relaxed">
                Overall material consumption deviation for this production run based on the Standard BOM.
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Info className="h-4 w-4" />
                Processing Directive
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg bg-accent/20 border border-primary/10">
                <p className="text-xs font-medium leading-relaxed">
                  Yield efficiency is currently <strong>{Math.abs(totalVariancePercent) > 5 ? 'flagged' : 'within targets'}</strong>. Data will be finalized in the Operational Intelligence reports.
                </p>
              </div>
              <Button className="w-full bg-primary text-primary-foreground font-bold h-12" onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" /> Complete & Save Audit
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
