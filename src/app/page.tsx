
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Package, 
  ShoppingCart, 
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  ClipboardList,
  Loader2
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
import { useTranslation } from "@/context/language-context"
import { useUser } from "@/firebase"

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
  { name: 'Cheddar Bites', share: 45, color: '#FFD700' },
  { name: 'Mozza Strings', share: 25, color: '#4F7736' },
  { name: 'Brie Pops', share: 20, color: '#FFB800' },
  { name: 'Other', share: 10, color: '#E5E7EB' },
]

export default function Dashboard() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

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
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight font-headline text-foreground">{t("operationalOverview")}</h1>
        <p className="text-muted-foreground">{t("realTimeMonitoring")}</p>
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
