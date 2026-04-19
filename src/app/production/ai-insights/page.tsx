
"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { 
  Sparkles, 
  ArrowLeft, 
  RefreshCw, 
  TrendingDown, 
  AlertCircle, 
  Lightbulb, 
  History,
  FileSearch,
  CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { varianceInsightGenerator, VarianceInsightGeneratorOutput } from "@/ai/flows/variance-insight-generator-flow"

// Mocked historical data for the selected order
const MOCK_ORDER_DATA = {
  id: "PO-2024-006",
  product: "Brie Appetizers",
  planned: 1200,
  actual: 1060,
  yield: 88.3,
  materials: [
    { name: "Creamy Brie Base", planned: 1000, actual: 1150, variance: 150, costVar: 450 },
    { name: "Crackers (Salted)", planned: 500, actual: 480, variance: -20, costVar: -10 },
    { name: "Honey Glaze", planned: 50, actual: 85, variance: 35, costVar: 105 },
  ],
  waste: [
    { reason: "Over-baking", qty: 45 },
    { reason: "Dropped items", qty: 25 },
    { reason: "Quality Reject", qty: 70 },
  ]
}

export default function AIInsightsPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("id") || "PO-2024-006"
  
  const [loading, setLoading] = useState(false)
  const [insight, setInsight] = useState<VarianceInsightGeneratorOutput | null>(null)

  const generateInsight = async () => {
    setLoading(true)
    try {
      // Mapping mock data to input schema
      const result = await varianceInsightGenerator({
        productionOrderId: MOCK_ORDER_DATA.id,
        finishedGoodName: MOCK_ORDER_DATA.product,
        plannedQuantity: MOCK_ORDER_DATA.planned,
        actualQuantity: MOCK_ORDER_DATA.actual,
        yieldPercentage: MOCK_ORDER_DATA.yield,
        plannedMaterialConsumption: MOCK_ORDER_DATA.materials.map(m => ({
          materialName: m.name,
          plannedQuantity: m.planned
        })),
        actualMaterialConsumption: MOCK_ORDER_DATA.materials.map(m => ({
          materialName: m.name,
          actualQuantity: m.actual
        })),
        materialVariances: MOCK_ORDER_DATA.materials.map(m => ({
          materialName: m.name,
          quantityVariance: m.variance,
          costVariance: m.costVar
        })),
        wasteReasons: MOCK_ORDER_DATA.waste.map(w => ({
          reason: w.reason,
          quantity: w.qty
        }))
      })
      setInsight(result)
    } catch (error) {
      console.error("Failed to generate insight", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (orderId) {
      generateInsight()
    }
  }, [orderId])

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <Link href="/production" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Orders
        </Link>
        <Badge variant="outline" className="px-3 py-1 bg-accent text-secondary border-secondary/20 font-bold">
          AI Diagnostic Tool
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-secondary text-secondary-foreground pb-6">
              <CardTitle className="font-headline text-lg">Order Details</CardTitle>
              <CardDescription className="text-secondary-foreground/70">Source Data for Analysis</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-xs text-muted-foreground">Order ID</span>
                <span className="text-sm font-bold">{MOCK_ORDER_DATA.id}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-xs text-muted-foreground">Product</span>
                <span className="text-sm font-bold">{MOCK_ORDER_DATA.product}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-xs text-muted-foreground">Actual Yield</span>
                <span className="text-sm font-bold text-destructive">{MOCK_ORDER_DATA.yield}%</span>
              </div>
              <div className="pt-2">
                <h4 className="text-xs font-bold text-muted-foreground uppercase mb-2">Significant Variances</h4>
                <div className="space-y-2">
                  {MOCK_ORDER_DATA.materials.filter(m => m.variance > 0).map(m => (
                    <div key={m.name} className="flex justify-between items-center">
                      <span className="text-xs">{m.name}</span>
                      <span className="text-xs font-bold text-destructive">+{m.variance} kg</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold">Historical Context</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <History className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs font-medium">Yield is 7% lower than the 30-day average for this BOM.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-secondary mt-0.5" />
                  <div>
                    <p className="text-xs font-medium">No inventory discrepancies reported in previous 5 batches.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card className="border-none shadow-lg bg-card">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="font-headline text-xl">AI Variance Analysis</CardTitle>
                  <CardDescription>Powered by Gemini for deep production insights</CardDescription>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={generateInsight}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </CardHeader>
            <CardContent className="pt-8">
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-[90%]" />
                  <Skeleton className="h-4 w-[95%]" />
                  <Skeleton className="h-32 w-full mt-6" />
                </div>
              ) : insight ? (
                <div className="prose prose-slate max-w-none">
                  <div className="flex items-center gap-2 mb-6 text-secondary font-bold">
                    <Lightbulb className="h-5 w-5" />
                    <span>Key Findings</span>
                  </div>
                  <div className="bg-accent/40 rounded-2xl p-6 border border-primary/20 leading-relaxed text-foreground whitespace-pre-wrap">
                    {insight.summary}
                  </div>
                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/5 flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                      <div>
                        <h5 className="text-sm font-bold text-destructive">Critical Issue</h5>
                        <p className="text-xs mt-1">High over-consumption of 'Creamy Brie Base' suggests scale miscalibration or weighing errors.</p>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl border border-secondary/20 bg-secondary/5 flex items-start gap-3">
                      <TrendingDown className="h-5 w-5 text-secondary mt-0.5" />
                      <div>
                        <h5 className="text-sm font-bold text-secondary">Efficiency Tip</h5>
                        <p className="text-xs mt-1">Reducing glaze temperature by 5°C could potentially decrease waste from runoff by 15%.</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <FileSearch className="h-16 w-16 text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-bold">Ready to Analyze</h3>
                  <p className="text-muted-foreground max-w-xs mt-2">Click the button to generate AI insights for this production order.</p>
                  <Button onClick={generateInsight} className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90">
                    Run AI Analysis
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {insight && (
            <div className="flex justify-end gap-3">
              <Button variant="outline">Download Report</Button>
              <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90">Acknowledge & Save Findings</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
