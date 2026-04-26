
"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
  TrendingUp,
  ChevronRight,
  PieChart as PieChartIcon,
  BarChart3
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

const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 shadow-2xl rounded-xl border border-slate-100 flex flex-col gap-1 ring-4 ring-black/5">
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Product Mix</p>
        <p className="text-sm font-bold text-slate-800">{payload[0].name}</p>
        <p className="text-sm font-black text-primary leading-none mt-1">{payload[0].value}% Share</p>
      </div>
    );
  }
  return null;
};

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
    
    const completedOrders = orders?.filter(o => o.status === 'Complete') || [];
    const avgYield = completedOrders.length > 0 
      ? (completedOrders.reduce((acc, curr) => acc + (curr.yield || 0), 0) / completedOrders.length).toFixed(1)
      : "0";
    
    const activeProduction = orders?.filter(o => o.status === 'In Progress').length || 0;
    const lowStockCount = materials?.filter(m => (m.stock || 0) <= 50).length || 0;
    const monthlyTransfers = transfers?.length || 0;

    return [
      { 
        title: "B2B Revenue", 
        value: `MMK ${(totalSales / 1000000).toFixed(1)}M`, 
        description: `${invoices?.length || 0} Invoices issued`, 
        icon: ShoppingCart, 
        trend: "+0%", 
        trendType: "up",
        href: "/sales/invoices"
      },
      { 
        title: "Outlet Sales", 
        value: `MMK ${(outletSalesTotal / 1000000).toFixed(1)}M`, 
        description: `Retail branch revenue`, 
        icon: DollarSign, 
        trend: "+0%", 
        trendType: "up",
        href: "/sales/outlet-sales"
      },
      { 
        title: "Avg Yield %", 
        value: `${avgYield}%`, 
        description: "Production Efficiency", 
        icon: TrendingUp, 
        trend: "Steady", 
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
        trend: "Active", 
        trendType: "up",
        href: "/master-data/customers"
      },
      { 
        title: "Retails", 
        value: outletCount.toString(), 
        description: "Active Locations", 
        icon: Store, 
        trend: "Operational", 
        trendType: "up",
        href: "/master-data/outlets"
      }
    ];
  }, [invoices, customers, outlets, outletSales, orders, materials, transfers]);

  const outletPerformanceData = useMemo(() => {
    if (!outletSales || outletSales.length === 0) return [];
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
    const userCtx = { email: user.email, uid: user.uid };
    
    try {
      await setDoc(doc(db, "appSettings", "global"), {
        id: "global",
        companyLogoUrl: "https://picsum.photos/seed/cheesy-official/400/400",
        primaryColor: "#FFD700",
        backgroundColor: "#F7F4F0",
        accentColor: "#4F7736"
      });

      const roles = [
        { name: "Administrator", description: "Full system control", permissions: ["master_data", "sales", "inventory", "production", "reports", "admin", "audit"] },
        { name: "Production Manager", description: "Manage factory floor", permissions: ["production", "inventory", "master_data"] },
        { name: "Inventory Manager", description: "Warehouse & stock control", permissions: ["inventory", "master_data"] },
        { name: "Sales Executive", description: "Billing and outlets", permissions: ["sales", "reports"] }
      ];
      for (const r of roles) {
        await addDocumentNonBlocking(collection(db, "system_roles"), { ...r, createdAt: new Date().toISOString() }, userCtx);
      }

      const rawMaterials = [
        { code: "MAT-MOZ-01", name: "Mozzarella Cheese", category: "Raw Material", unit: "kg", stock: 250, cost: 15000 },
        { code: "MAT-POT-02", name: "Potato Starch", category: "Raw Material", unit: "kg", stock: 1200, cost: 4500 },
        { code: "MAT-CHK-03", name: "Chicken Breast (Minced)", category: "Ingredient", unit: "kg", stock: 150, cost: 8500 },
        { code: "MAT-SAU-04", name: "Premium Sausage", category: "Ingredient", unit: "units", stock: 500, cost: 1200 },
        { code: "MAT-OIL-05", name: "Frying Oil", category: "Ingredient", unit: "L", stock: 200, cost: 3800 },
        { code: "MAT-BAT-06", name: "Batter Mix", category: "Ingredient", unit: "kg", stock: 100, cost: 2500 }
      ];
      for (const m of rawMaterials) {
        await addDocumentNonBlocking(collection(db, "raw_materials"), { ...m, createdAt: new Date().toISOString() }, userCtx);
      }

      const goods = [
        { code: "FG-STICK-01", name: "Original Cheese Stick", category: "Finished Good", price: 3500, stock: 450 },
        { code: "FG-POT-02", name: "Long Potato", category: "Finished Good", price: 2500, stock: 800 },
        { code: "FG-POPC-03", name: "Chicken PopCorn", category: "Finished Good", price: 4000, stock: 320 },
        { code: "FG-SAU-04", name: "Sausage Cheese Stick", category: "Finished Good", price: 3800, stock: 210 }
      ];
      for (const g of goods) {
        await addDocumentNonBlocking(collection(db, "finished_goods"), { ...g, createdAt: new Date().toISOString() }, userCtx);
      }

      const customersList = [
        { code: "CUST-CITY-01", name: "City Mart Supermarket", email: "procurement@citymart.com.mm", customerType: "Wholesaler", customerClass: "VIP", creditLimit: 5000000, address: "Yangon, Myanmar", paymentTerms: "Net 30" },
        { code: "CUST-SNACK-02", name: "Neighborhood Snack Hub", email: "hello@snackhub.com", customerType: "Retailer", customerClass: "Grade A", creditLimit: 1000000, address: "Mandalay, Myanmar", paymentTerms: "Net 15" },
        { code: "CUST-HOTEL-03", name: "Lotte Hotel Catering", email: "fnb@lotteyangon.com", customerType: "Corporate", customerClass: "VIP", creditLimit: 10000000, address: "Yangon", paymentTerms: "Net 7" }
      ];
      for (const c of customersList) {
        await addDocumentNonBlocking(collection(db, "customers"), { ...c, createdAt: new Date().toISOString() }, userCtx);
      }

      const outletsList = [
        { name: "Junction City Outlet", location: "Yangon Downtown", manager: "U Kyaw", phone: "091234567" },
        { name: "Airport Shop", location: "Yangon Int'l Arrival", manager: "U Tun", phone: "094455667" },
        { name: "Ocean Supercenter", location: "North Okkalapa", manager: "Daw Su", phone: "095566778" }
      ];
      for (const o of outletsList) {
        await addDocumentNonBlocking(collection(db, "outlets"), { ...o, status: "Active", createdAt: new Date().toISOString() }, userCtx);
      }

      const warehousesList = [
        { name: "Main Factory Warehouse", location: "Hlaing Tharyar", capacity: "85%" },
        { name: "Cold Storage B", location: "Shwe Pyi Thar", capacity: "40%" }
      ];
      for (const w of warehousesList) {
        await addDocumentNonBlocking(collection(db, "warehouses"), { ...w, status: "Active", createdAt: new Date().toISOString() }, userCtx);
      }

      const wasteList = [
        { code: "SPOIL", description: "Ingredient Expiration", category: "Inventory", severity: "High" },
        { code: "REJECT", description: "Quality Control Reject", category: "Production", severity: "Medium" },
        { code: "DAMAGE", description: "Transit Damage", category: "Operations", severity: "Low" }
      ];
      for (const wr of wasteList) {
        await addDocumentNonBlocking(collection(db, "waste_reasons"), { ...wr, createdAt: new Date().toISOString() }, userCtx);
      }

      await addDocumentNonBlocking(collection(db, "invoices"), {
        invoiceNumber: "INV-DEMO-001",
        customerName: "City Mart Supermarket",
        customerCode: "CUST-CITY-01",
        totalAmount: 1575000,
        status: "Paid",
        paymentMethod: "Bank",
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
        items: [
          { productName: "Original Cheese Stick", productCode: "FG-STICK-01", quantity: 300, price: 3500, total: 1050000, unit: "Units" },
          { productName: "Long Potato", productCode: "FG-POT-02", quantity: 210, price: 2500, total: 525000, unit: "Units" }
        ]
      }, userCtx);

      const mockSales = [
        { outletName: "Junction City Outlet", amount: 245000, date: new Date(Date.now() - 86400000).toISOString().split('T')[0], transactionsCount: 42 },
        { outletName: "Airport Shop", amount: 580000, date: new Date(Date.now() - 86400000).toISOString().split('T')[0], transactionsCount: 88 }
      ];
      for (const s of mockSales) {
        await addDocumentNonBlocking(collection(db, "outlet_sales"), { ...s, recordedBy: user.email, createdAt: new Date().toISOString() }, userCtx);
      }

      const mockOrders = [
        { product: "Original Cheese Stick", date: new Date().toISOString().split('T')[0], quantity: 500, status: "In Progress", yield: 0, variance: 0 },
        { product: "Long Potato", date: new Date(Date.now() - 172800000).toISOString().split('T')[0], quantity: 1000, status: "Complete", yield: 98.2, variance: -1.8 }
      ];
      for (const o of mockOrders) {
        await addDocumentNonBlocking(collection(db, "production_orders"), { ...o, createdAt: new Date().toISOString() }, userCtx);
      }

      await addDocumentNonBlocking(collection(db, "stock_transfers"), {
        sourceName: "Main Factory Warehouse",
        destinationName: "Junction City Outlet",
        status: "Completed",
        recordedBy: user.email,
        timestamp: new Date(Date.now() - 43200000).toISOString(),
        items: [{ productName: "Original Cheese Stick", quantity: 100 }]
      }, userCtx);

    } catch (e) {
      console.error(e);
    } finally {
      setIsSeeding(false);
    }
  };

  if (isUserLoading || !user) {
    return <div className="h-full w-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const isDemoUser = user.isAnonymous;

  return (
    <div className="space-y-10 pb-12 animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter font-headline text-foreground leading-tight">Operational Intelligence</h1>
          <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
            {isDemoUser ? "Welcome to the Demo Sandbox. Populating this environment with training data will enable all charts and reports." : "Operational summary for Cheesy Bites Production Console."}
          </p>
        </div>
        
        {isDemoUser && (
          <div className="flex flex-col items-end gap-2">
            <Button 
              variant="outline" 
              className="h-14 px-6 gap-3 rounded-2xl transition-all shadow-lg font-bold border-2 border-primary bg-primary/10 text-primary hover:bg-primary/20"
              onClick={seedDemoData}
              disabled={isSeeding}
            >
              {isSeeding ? <RefreshCcw className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
              Populate Demo Environment
            </Button>
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mr-2 opacity-60">
              Sandbox Mode Enabled
            </span>
          </div>
        )}
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card 
            key={stat.title} 
            className="border-none shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer group bg-white rounded-2xl overflow-hidden"
            onClick={() => router.push(stat.href)}
          >
            <div className={`h-1.5 w-full ${stat.trendType === 'up' ? 'bg-secondary/20' : 'bg-destructive/20'} group-hover:bg-primary transition-colors`} />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground group-hover:text-primary transition-colors">{stat.title}</CardTitle>
              <div className="p-2 rounded-xl bg-muted/30 group-hover:bg-primary/10 transition-colors">
                <stat.icon className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black font-headline text-foreground truncate tracking-tight">{stat.value}</div>
              <p className="text-[10px] font-medium text-muted-foreground mt-1 truncate">{stat.description}</p>
              <div className="mt-5 flex items-center justify-between">
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted/50">
                  {stat.trendType === 'up' ? <ArrowUpRight className="h-3 w-3 text-secondary" /> : <ArrowDownRight className="h-3 w-3 text-destructive" />}
                  <span className={`text-[10px] font-bold ${stat.trendType === 'up' ? 'text-secondary' : 'text-destructive'}`}>{stat.trend}</span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                  <span className="text-[9px] font-black uppercase text-primary">Drill Down</span>
                  <ChevronRight className="h-3 w-3 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-8 border-none shadow-sm hover:shadow-xl transition-all duration-500 bg-white rounded-3xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-muted/50 pb-6">
             <div className="flex flex-col gap-1">
                <CardTitle className="font-headline text-2xl flex items-center gap-2">
                  Daily Sales Volume
                </CardTitle>
                <CardDescription className="text-xs">Aggregate revenue across all active retail branches.</CardDescription>
             </div>
             <Badge variant="secondary" className="bg-secondary/10 text-secondary text-[10px] uppercase font-black tracking-widest py-1 px-3">Live Feed</Badge>
          </CardHeader>
          <CardContent className="pt-8 pl-2 h-[450px]">
             {outletPerformanceData.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={outletPerformanceData}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" x2="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.7} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 11, fontWeight: 600}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 11, fontWeight: 600}} />
                    <Tooltip 
                      cursor={{fill: '#F9FAFB'}}
                      formatter={(val: number) => [`MMK ${val.toLocaleString()}`, "Revenue"]}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)', padding: '12px' }} 
                    />
                    <Bar 
                      dataKey="amount" 
                      fill="url(#barGradient)" 
                      radius={[8, 8, 0, 0]} 
                      barSize={45}
                      className="cursor-pointer transition-all hover:opacity-80"
                      onClick={() => router.push('/sales/outlet-sales')}
                    />
                  </BarChart>
                </ResponsiveContainer>
             ) : (
               <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground gap-4 bg-muted/5 rounded-2xl border-2 border-dashed">
                 <BarChart3 className="h-12 w-12 opacity-20" />
                 <p className="text-sm font-medium">No sales data recorded yet.</p>
                 {!isDemoUser && (
                   <Button variant="outline" size="sm" onClick={() => router.push('/sales/outlet-sales')}>
                     Record First Sale
                   </Button>
                 )}
               </div>
             )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-4 border-none shadow-sm hover:shadow-xl transition-all duration-500 bg-white rounded-3xl overflow-hidden flex flex-col">
          <CardHeader className="border-b border-muted/50 pb-6">
            <div className="flex flex-col gap-1">
              <CardTitle className="font-headline text-2xl flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-primary" />
                Production Mix
              </CardTitle>
              <CardDescription className="text-xs">Strategic distribution of output volume.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center py-10">
            {orders && orders.length > 0 ? (
              <>
                <div className="relative w-full h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={topProducts} 
                        innerRadius={75} 
                        outerRadius={105} 
                        paddingAngle={8} 
                        dataKey="share"
                        stroke="none"
                        className="cursor-pointer"
                        onClick={() => router.push('/production')}
                      >
                        {topProducts.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} style={{ outline: 'none' }} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Total</span>
                    <span className="text-3xl font-black font-headline tracking-tighter">100%</span>
                    <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1">Output</span>
                  </div>
                </div>

                <div className="w-full mt-6 space-y-3 px-4">
                  {topProducts.map((item) => (
                    <div key={item.name} className="flex items-center justify-between group cursor-default">
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full shadow-sm transition-transform group-hover:scale-125" style={{ backgroundColor: item.color }} />
                        <span className="text-xs font-bold text-slate-600 group-hover:text-foreground transition-colors">{item.name}</span>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-black border-muted-foreground/10 px-2 py-0">
                        {item.share}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-muted-foreground gap-4 py-20">
                <PieChartIcon className="h-16 w-16 opacity-10" />
                <p className="text-xs text-center px-10">Production analysis will appear once orders are completed.</p>
              </div>
            )}
          </CardContent>
          <div className="p-6 mt-auto border-t border-muted/50 bg-muted/10">
             <Button 
                variant="ghost" 
                className="w-full text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
                onClick={() => router.push('/production')}
             >
                Analyze Work Orders <ChevronRight className="h-3 w-3 ml-1" />
             </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

