
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
  DollarSign,
  Factory,
  AlertTriangle,
  Truck,
  TrendingUp
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
import { collection, setDoc, doc } from "firebase/firestore"

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

  const ordersRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, "production_orders");
  }, [db, user]);

  const materialsRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, "raw_materials");
  }, [db, user]);

  const transfersRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, "stock_transfers");
  }, [db, user]);

  const { data: invoices } = useCollection(invoicesRef);
  const { data: customers } = useCollection(customersRef);
  const { data: outlets } = useCollection(outletsRef);
  const { data: outletSales } = useCollection(outletSalesRef);
  const { data: orders } = useCollection(ordersRef);
  const { data: materials } = useCollection(materialsRef);
  const { data: transfers } = useCollection(transfersRef);

  const stats = useMemo(() => {
    const totalSales = invoices?.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0) || 0;
    const outletSalesTotal = outletSales?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0;
    const customerCount = customers?.length || 0;
    const outletCount = outlets?.length || 0;
    
    // Efficiency Calculation
    const completedOrders = orders?.filter(o => o.status === 'Complete') || [];
    const avgYield = completedOrders.length > 0 
      ? (completedOrders.reduce((acc, curr) => acc + (curr.yield || 0), 0) / completedOrders.length).toFixed(1)
      : "0";
    
    // Operations Tracking
    const activeProduction = orders?.filter(o => o.status === 'In Progress').length || 0;
    const lowStockCount = materials?.filter(m => (m.stock || 0) <= 50).length || 0;
    const monthlyTransfers = transfers?.length || 0;

    return [
      { 
        title: "B2B Revenue", 
        value: `MMK ${(totalSales / 1000000).toFixed(1)}M`, 
        description: `${invoices?.length || 0} Invoices issued`, 
        icon: ShoppingCart, 
        trend: "+12.5%", 
        trendType: "up",
        href: "/sales/invoices"
      },
      { 
        title: "Outlet Sales", 
        value: `MMK ${(outletSalesTotal / 1000000).toFixed(1)}M`, 
        description: `Retail branch revenue`, 
        icon: DollarSign, 
        trend: "+8.2%", 
        trendType: "up",
        href: "/sales/outlet-sales"
      },
      { 
        title: "Avg Yield %", 
        value: `${avgYield}%`, 
        description: "Production Efficiency", 
        icon: TrendingUp, 
        trend: "Healthy", 
        trendType: "up",
        href: "/production"
      },
      { 
        title: "Stock Alerts", 
        value: lowStockCount.toString(), 
        description: "Items below threshold", 
        icon: AlertTriangle, 
        trend: lowStockCount > 0 ? "Critical" : "Stable", 
        trendType: lowStockCount > 0 ? "down" : "up",
        href: "/inventory"
      },
      { 
        title: "Active Runs", 
        value: activeProduction.toString(), 
        description: "In Progress Orders", 
        icon: Factory, 
        trend: "Steady", 
        trendType: "up",
        href: "/production"
      },
      { 
        title: "Fleet Runs", 
        value: monthlyTransfers.toString(), 
        description: "Logistics Restocks", 
        icon: Truck, 
        trend: "On Schedule", 
        trendType: "up",
        href: "/inventory/transfer"
      },
      { 
        title: "Customers", 
        value: customerCount.toString(), 
        description: "Business partners", 
        icon: Users, 
        trend: "+2 new", 
        trendType: "up",
        href: "/master-data/customers"
      },
      { 
        title: "Retails", 
        value: outletCount.toString(), 
        description: "Active Locations", 
        icon: Store, 
        trend: "Global", 
        trendType: "up",
        href: "/master-data/outlets"
      }
    ];
  }, [invoices, customers, outlets, outletSales, orders, materials, transfers]);

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
      // 0. Global Settings (Branding)
      await setDoc(doc(db, "appSettings", "global"), {
        id: "global",
        companyLogoUrl: "https://picsum.photos/seed/cheesy-official/400/400",
        primaryColor: "#FFD700",
        backgroundColor: "#F7F4F0",
        accentColor: "#4F7736"
      });

      // 1. Raw Materials
      const materials = [
        { code: "MAT-MOZ-01", name: "Mozzarella Cheese", category: "Raw Material", unit: "kg", stock: 250, cost: 15000 },
        { code: "MAT-POT-02", name: "Potato Starch", category: "Raw Material", unit: "kg", stock: 1200, cost: 4500 },
        { code: "MAT-CHK-03", name: "Chicken Breast (Minced)", category: "Ingredient", unit: "kg", stock: 150, cost: 8500 },
        { code: "MAT-SAU-04", name: "Premium Sausage", category: "Ingredient", unit: "units", stock: 500, cost: 1200 },
        { code: "MAT-OIL-05", name: "Frying Oil", category: "Ingredient", unit: "L", stock: 200, cost: 3800 }
      ];
      for (const m of materials) {
        await addDocumentNonBlocking(collection(db, "raw_materials"), { ...m, createdAt: new Date().toISOString() });
      }

      // 2. Finished Goods
      const goods = [
        { code: "FG-STICK-01", name: "Original Cheese Stick", category: "Finished Good", price: 3500, stock: 450 },
        { code: "FG-POT-02", name: "Long Potato", category: "Finished Good", price: 2500, stock: 800 },
        { code: "FG-POPC-03", name: "Chicken PopCorn", category: "Finished Good", price: 4000, stock: 320 }
      ];
      for (const g of goods) {
        await addDocumentNonBlocking(collection(db, "finished_goods"), { ...g, createdAt: new Date().toISOString() });
      }

      // 3. Customers
      const customersList = [
        { code: "CUST-CITY-01", name: "City Mart Supermarket", email: "procurement@citymart.com.mm", customerType: "Wholesaler", customerClass: "VIP", creditLimit: 5000000, address: "Yangon, Myanmar" },
        { code: "CUST-SNACK-02", name: "Neighborhood Snack Hub", email: "hello@snackhub.com", customerType: "Retailer", customerClass: "Grade A", creditLimit: 1000000, address: "Mandalay, Myanmar" }
      ];
      for (const c of customersList) {
        await addDocumentNonBlocking(collection(db, "customers"), { ...c, createdAt: new Date().toISOString() });
      }

      // 4. Outlets
      const outletsList = [
        { name: "Junction City Outlet", location: "Yangon", manager: "U Kyaw", phone: "091234567" },
        { name: "Airport Shop", location: "Yangon Int'l", manager: "U Tun", phone: "094455667" }
      ];
      for (const o of outletsList) {
        await addDocumentNonBlocking(collection(db, "outlets"), { ...o, status: "Active", createdAt: new Date().toISOString() });
      }

      // 5. Invoices
      await addDocumentNonBlocking(collection(db, "invoices"), {
        invoiceNumber: "INV-Demo-01",
        customerName: "City Mart Supermarket",
        customerCode: "CUST-CITY-01",
        totalAmount: 1575000,
        status: "Paid",
        paymentMethod: "Bank",
        createdAt: new Date().toISOString(),
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        items: [
          { productName: "Original Cheese Stick", productCode: "FG-STICK-01", quantity: 300, price: 3500, total: 1050000, unit: "Units" },
          { productName: "Long Potato", productCode: "FG-POT-02", quantity: 210, price: 2500, total: 525000, unit: "Units" }
        ]
      });

      // 6. Outlet Sales
      await addDocumentNonBlocking(collection(db, "outlet_sales"), {
        outletName: "Junction City Outlet",
        amount: 245000,
        date: new Date().toISOString().split('T')[0],
        transactionsCount: 42,
        recordedBy: "Demo Admin",
        createdAt: new Date().toISOString()
      });

      // 7. Production Order
      await addDocumentNonBlocking(collection(db, "production_orders"), {
        product: "Original Cheese Stick",
        date: new Date().toISOString().split('T')[0],
        quantity: 500,
        status: "Complete",
        yield: 98.5,
        variance: -1.5,
        createdAt: new Date().toISOString()
      });

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
          <p className="text-muted-foreground">Strategic monitoring of Sales, Inventory, and Manufacturing health.</p>
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

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card 
            key={stat.title} 
            className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
            onClick={() => router.push(stat.href)}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black font-headline text-foreground truncate">{stat.value}</div>
              <p className="text-[10px] font-medium text-muted-foreground mt-1 truncate">{stat.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {stat.trendType === 'up' ? <ArrowUpRight className="h-3 w-3 text-secondary" /> : <ArrowDownRight className="h-3 w-3 text-destructive" />}
                  <span className={`text-[10px] font-bold ${stat.trendType === 'up' ? 'text-secondary' : 'text-destructive'}`}>{stat.trend}</span>
                </div>
                <span className="text-[8px] font-black uppercase text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">Drill Down &rarr;</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-4 border-none shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
             <CardTitle className="font-headline flex items-center justify-between">
                <span>Daily Sales by Outlet</span>
                <Badge variant="secondary" className="bg-secondary/10 text-secondary text-[10px]">Real-time Aggregate</Badge>
             </CardTitle>
          </CardHeader>
          <CardContent className="pl-2 h-[350px]">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={outletPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10}} />
                  <Tooltip 
                    formatter={(val: number) => [`MMK ${val.toLocaleString()}`, "Revenue"]}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
                  />
                  <Bar 
                    dataKey="amount" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]} 
                    className="cursor-pointer"
                    onClick={() => router.push('/sales/outlet-sales')}
                  />
                </BarChart>
              </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 border-none shadow-sm hover:shadow-md transition-shadow">
          <CardHeader><CardTitle className="font-headline">Production Mix</CardTitle></CardHeader>
          <CardContent className="h-[350px] flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie 
                  data={topProducts} 
                  innerRadius={60} 
                  outerRadius={80} 
                  paddingAngle={5} 
                  dataKey="share"
                  className="cursor-pointer"
                  onClick={() => router.push('/production')}
                >
                  {topProducts.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
