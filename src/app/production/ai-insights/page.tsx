
"use client"

import { 
  ArrowLeft, 
  TrendingDown, 
  AlertCircle, 
  History,
  CheckCircle2,
  FileText,
  SearchX
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase"
import { collection, query, where, limit } from "firebase/firestore"
import { Loader2 } from "lucide-react"

export default function OrderDiagnosticPage() {
  const db = useFirestore()
  const { user } = useUser()

  // Fetch the most recent completed order to analyze
  const ordersRef = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, "production_orders"), 
      where("status", "==", "Complete"),
      limit(1)
    );
  }, [db, user]);

  const { data: orders, isLoading } = useCollection(ordersRef)
  const order = orders?.[0]

  if (isLoading) {
    return <div className="p-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto py-20 flex flex-col items-center justify-center text-center space-y-6">
        <div className="h-24 w-24 rounded-full bg-muted/20 flex items-center justify-center">
          <SearchX className="h-12 w-12 text-muted-foreground/30" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-headline">No Completed Orders Found</h2>
          <p className="text-muted-foreground max-w-xs mx-auto text-sm">
            AI analysis requires at least one completed production order with consumption records.
          </p>
        </div>
        <Link href="/production">
          <Button className="bg-primary text-primary-foreground font-bold">Go to Production Orders</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <Link href="/production" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Orders
        </Link>
        <Badge variant="outline" className="px-3 py-1 bg-accent text-secondary border-secondary/20 font-bold">
          Order Analysis View
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-secondary text-secondary-foreground pb-6">
              <CardTitle className="font-headline text-lg">Order Summary</CardTitle>
              <CardDescription className="text-secondary-foreground/70">Raw Performance Data</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-xs text-muted-foreground">Order ID</span>
                <span className="text-sm font-bold uppercase">{order.id.slice(-8)}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-xs text-muted-foreground">Product</span>
                <span className="text-sm font-bold">{order.product}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-xs text-muted-foreground">Actual Yield</span>
                <span className={`text-sm font-bold ${order.yield < 90 ? 'text-destructive' : 'text-secondary'}`}>{order.yield}%</span>
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
                    <p className="text-xs font-medium">Order completed on {new Date(order.completedAt || order.createdAt).toLocaleDateString()}.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-secondary mt-0.5" />
                  <div>
                    <p className="text-xs font-medium">Recorded with {order.variance}% deviation.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card className="border-none shadow-lg">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="font-headline text-xl">Detailed Variance Report</CardTitle>
              <CardDescription>Comprehensive review of material consumption and waste factors.</CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/5 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                    <div>
                      <h5 className="text-sm font-bold text-destructive">Observation</h5>
                      <p className="text-xs mt-1">Variance of {order.variance}% detected compared to standard BOM.</p>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border border-secondary/20 bg-secondary/5 flex items-start gap-3">
                    <TrendingDown className="h-5 w-5 text-secondary mt-0.5" />
                    <div>
                      <h5 className="text-sm font-bold text-secondary">Efficiency Note</h5>
                      <p className="text-xs mt-1">Production output yield finalized at {order.yield}%.</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-muted/10 rounded-xl p-8 border border-dashed text-center">
                  <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
                    Detailed consumption ledger analysis is available in the individual Order Logs.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="outline">Print Audit Report</Button>
            <Button className="bg-secondary text-secondary-foreground">Acknowledge Findings</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
