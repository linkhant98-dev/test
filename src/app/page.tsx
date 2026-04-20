"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  ShoppingCart, 
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Sparkles,
  RefreshCcw,
  Users,
  Store,
  DollarSign
} from "lucide-react"
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  BarChart,
  Bar,
  Legend
} from "recharts"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTranslation } from "@/context/language-context"
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking } from "@/firebase"
import { collection } from "firebase/firestore"

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

  // Live Data Fetching
  const invoicesRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, "invoices");
  }, [db, user]);

  const customersRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, "customers");
  }, [db, user]);

  const outletsRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, "outlets");
  }, [db, user]);

  const outletSalesRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, "outlet_sales");
  }, [db, user]);

  const { data: invoices } = useCollection(invoicesRef);
  const { data: customers } = useCollection(customersRef);
  const { data: outlets } = useCollection(outletsRef);
  const { data: outletSales } = useCollection(outletSalesRef);

  const stats = useMemo(() => {
    const totalSales = invoices?.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0) || 0;
    const outletSalesTotal = outletSales?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0;
    const customerCount = customers?.length || 0;
    const outletCount = outlets?.length || 0;
    
    return [
      { 
        title: "B2B Sales", 
        value: `MMK ${(totalSales / 1000000).toFixed(1)}M`, 
        description: `${invoices?.length || 0} Invoices issued`, 
        icon: ShoppingCart, 
        trend: "+12.5%", 
        trendType: "up" 
      },
      { 
        title: "Outlet Revenue", 
        value: `MMK ${(outletSalesTotal / 1000000).toFixed(1)}M`, 
        description: `Daily summaries recorded`, 
        icon: DollarSign, 
        trend: "+8.2%", 
        trendType: "up" 
      },
      { 
        title: "Active Outlets", 
        value: outletCount.toString(), 
        description: "Retail locations", 
        icon: Store, 
        trend: "Stable", 
        trendType: "up" 
      },
      { 
        title: "Customer Base", 
        value: customerCount.toString(), 
        description: "Business partners", 
        icon: Users, 
        trend: "+2 new", 
        trendType: "up" 
      }
    ];
  }, [invoices, customers, outlets, outletSales]);

  const outletPerformanceData = useMemo(() => {
    if (!outletSales) return [];
    const agg: Record<string, number> = {};
    outletSales.forEach(s => {
      agg[s.outletName] = (agg[s.outletName] || 0) + (s.amount || 0);
    });
    return Object.entries(agg).map(([name, value]) => ({
      name,
      amount: value
    })).sort((a,b) => b.amount - a.amount);
  }, [outletSales]);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  const seedDemoData = async () => {
    if (!db || !user) return;
    setIsSeeding(true);
    try {
      const outletNames = [
        { name: "Junction City Outlet", location: "Yangon", manager: "U Kyaw", phone: "091234567" },
        { name: "Ocean Supercenter Branch", location: "Mandalay", manager: "Daw Yee", phone: "097788990" },
        { name: "Airport Shop", location: "Yangon Int'l", manager: "U Tun", phone: "094455667" }
      ];
      for (const o of outletNames) {
        addDocumentNonBlocking(collection(db, "outlets"), { ...o, status: "Active", createdAt: new Date().toISOString() });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSeeding(false);
    }
  };

  if (isUserLoading || !user) {
    return <div className="h-full w-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold tracking-tight font-headline text-foreground">Operational Intelligence</h1>
          <p className="text-muted-foreground">Live monitoring of Sales, Outlets, and Production metrics.</p>
        </div>
        <Button 
          variant="outline" 
          className="border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-bold h-12 gap-2"
          onClick={seedDemoData}
          disabled={isSeeding}
        >
          {isSeeding ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Reset & Seed Mock Data
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
              <div className="text-2xl font-bold text-foreground truncate">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              <div className="mt-3 flex items-center gap-1">
                {stat.trendType === 'up' ? <ArrowUpRight className="h-3 w-3 text-secondary" /> : <ArrowDownRight className="h-3 w-3 text-destructive" />}
                <span className={`text-[10px] font-bold ${stat.trendType === 'up' ? 'text-secondary' : 'text-destructive'}`}>{stat.trend}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-4 border-none shadow-sm">
          <CardHeader>
             <CardTitle className="font-headline flex items-center justify-between">
                <span>Daily Sales by Outlet</span>
                <Badge variant="secondary" className="bg-secondary/10 text-secondary text-[10px]">Real-time Aggregate</Badge>
             </CardTitle>
          </CardHeader>
          <CardContent className="pl-2 h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={outletPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10}} />
                  <Tooltip 
                    formatter={(val: number) => [`MMK ${val.toLocaleString()}`, "Revenue"]}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
                  />
                  <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 border-none shadow-sm">
          <CardHeader><CardTitle className="font-headline">Production Mix</CardTitle></CardHeader>
          <CardContent className="h-[300px] flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={topProducts} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="share">
                  {topProducts.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}