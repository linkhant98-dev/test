
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Package, 
  ShoppingCart, 
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  ClipboardList,
  Loader2,
  Database,
  Sparkles
} from "lucide-react"
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
  PieChart,
  Pie
} from "recharts"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/context/language-context"
import { useUser, useFirestore, addDocumentNonBlocking } from "@/firebase"
import { collection } from "firebase/firestore"

const varianceData = [
  { name: 'Mon', variance: 12 },
  { name: 'Tue', variance: 8 },
  { name: 'Wed', variance: 18 },
  { name: 'Thu', variance: 14 },
  { name: 'Fri', variance: 5 },
  { name: 'Sat', variance: 2 },
  { name: 'Sun', variance: 3 },
]

const topProducts = [
  { name: 'Original Cheese Stick', share: 45, color: '#FFD700' },
  { name: 'Long Potato', share: 25, color: '#4F7736' },
  { name: 'Chicken PopCorn', share: 20, color: '#FFB800' },
  { name: 'Sausage Cheese Stick', share: 10, color: '#E5E7EB' },
]

export default function Dashboard() {
  const { t } = useTranslation();
  const router = useRouter();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  const seedDemoData = async () => {
    if (!db) return;
    setIsSeeding(true);
    
    const materials = [
      { name: "Mozzarella Cheese", unit: "kg", category: "Raw Material", stock: 150 },
      { name: "Potato Starch", unit: "kg", category: "Raw Material", stock: 200 },
      { name: "Chicken Breast (Minced)", unit: "kg", category: "Raw Material", stock: 80 },
      { name: "Premium Sausage", unit: "units", category: "Raw Material", stock: 500 },
      { name: "Batter Mix", unit: "kg", category: "Ingredient", stock: 100 },
      { name: "Breadcrumbs", unit: "kg", category: "Ingredient", stock: 120 },
      { name: "Frying Oil", unit: "L", category: "Ingredient", stock: 300 },
      { name: "Seasoning Powder", unit: "kg", category: "Ingredient", stock: 50 },
      { name: "Sea Salt", unit: "kg", category: "Ingredient", stock: 25 },
    ];

    const products = [
      { name: "Original Cheese Stick", category: "Finished Good", price: 12.50, stock: 45 },
      { name: "Long Potato", category: "Finished Good", price: 8.00, stock: 120 },
      { name: "Chicken PopCorn", category: "Finished Good", price: 15.00, stock: 30 },
      { name: "Sausage Cheese Stick", category: "Finished Good", price: 14.50, stock: 25 },
    ];

    const warehouses = [
      { name: "Main Cold Storage", location: "Building A, West Wing", status: "Active", capacity: "85%" },
      { name: "Raw Material Depot", location: "Building B, South Gate", status: "Active", capacity: "40%" },
    ];

    const reasons = [
      { code: "SPOIL", description: "Natural spoilage or expiry", category: "Inventory", severity: "High" },
      { code: "DAMG", description: "Physical damage during handling", category: "Operations", severity: "Medium" },
      { code: "REJECT", description: "Quality control rejection", category: "Production", severity: "High" },
    ];

    try {
      for (const m of materials) {
        addDocumentNonBlocking(collection(db, "raw_materials"), { ...m, createdAt: new Date().toISOString() });
      }
      for (const p of products) {
        addDocumentNonBlocking(collection(db, "finished_goods"), { ...p, createdAt: new Date().toISOString() });
      }
      for (const w of warehouses) {
        addDocumentNonBlocking(collection(db, "warehouses"), { ...w, createdAt: new Date().toISOString() });
      }
      for (const r of reasons) {
        addDocumentNonBlocking(collection(db, "waste_reasons"), { ...r, createdAt: new Date().toISOString() });
      }
      alert("Demo data seeded successfully!");
    } catch (e) {
      console.error(e);
    } finally {
      setIsSeeding(false);
    }
  };

  if (isUserLoading || !user) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = [
    {
      title: t("activeProductionOrders"),
      value: "12",
      description: "4 scheduled for today",
      icon: ShoppingCart,
      trend: "+2 from yesterday",
      trendType: "up"
    },
    {
      title: t("inventoryValue"),
      value: "$45,231.89",
      description: "Across 3 warehouses",
      icon: Package,
      trend: "+4.5%",
      trendType: "up"
    },
    {
      title: t("avgYield"),
      value: "94.2%",
      description: "Target: 95.0%",
      icon: CheckCircle2,
      trend: "-0.8%",
      trendType: "down"
    },
    {
      title: t("efficiencyAlerts"),
      value: "3",
      description: "Requires urgent review",
      icon: ClipboardList,
      trend: "Operational",
      trendType: "up"
    }
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold tracking-tight font-headline text-foreground">{t("operationalOverview")}</h1>
          <p className="text-muted-foreground">{t("realTimeMonitoring")}</p>
        </div>
        <Button 
          variant="outline" 
          className="border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-bold h-12"
          onClick={seedDemoData}
          disabled={isSeeding}
        >
          {isSeeding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
          Seed Demo Data
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              <div className="mt-3 flex items-center gap-1">
                {stat.trendType === 'up' ? (
                  <ArrowUpRight className="h-3 w-3 text-secondary" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-destructive" />
                )}
                <span className={`text-[10px] font-bold ${stat.trendType === 'up' ? 'text-secondary' : 'text-destructive'}`}>
                  {stat.trend}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-4 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="font-headline">{t("productionVarianceTrend")}</CardTitle>
            <CardDescription>Daily cost variance percentage for current month.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2 h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
                <LineChart data={varianceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="variance" 
                    stroke="#FFD700" 
                    strokeWidth={3} 
                    dot={{ fill: '#FFD700', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="font-headline">{t("productionMix")}</CardTitle>
            <CardDescription>Top finished goods by volume.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={topProducts}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="share"
                >
                  {topProducts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-4 mt-4 w-full px-4">
              {topProducts.map((product) => (
                <div key={product.name} className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: product.color }} />
                  <span className="text-xs font-medium">{product.name} ({product.share}%)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="font-headline">{t("pendingTransactions")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: 'Stock Transfer #ST-112', status: 'Pending Approval', date: '2h ago' },
                { label: 'Goods Receipt #GR-903', status: 'Draft', date: '5h ago' },
                { label: 'Issue to Production #IP-776', status: 'Processing', date: '1d ago' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">{item.label}</span>
                    <span className="text-xs text-muted-foreground">{item.date}</span>
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 bg-accent text-accent-foreground rounded-full">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
