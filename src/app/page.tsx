
"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Package, 
  ShoppingCart, 
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  ClipboardList,
  Loader2,
  Sparkles,
  RefreshCcw,
  Users,
  Tag,
  TrendingUp,
  AlertTriangle
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
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking } from "@/firebase"
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

  // Live Data Fetching
  const invoicesRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, "invoices");
  }, [db, user]);

  const customersRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, "customers");
  }, [db, user]);

  const productsRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, "finished_goods");
  }, [db, user]);

  const { data: invoices } = useCollection(invoicesRef);
  const { data: customers } = useCollection(customersRef);
  const { data: products } = useCollection(productsRef);

  const stats = useMemo(() => {
    const totalSales = invoices?.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0) || 0;
    const customerCount = customers?.length || 0;
    const productCount = products?.length || 0;
    
    return [
      { 
        title: "Total Revenue", 
        value: `MMK ${totalSales.toLocaleString()}`, 
        description: `${invoices?.length || 0} Invoices issued`, 
        icon: ShoppingCart, 
        trend: "+12.5%", 
        trendType: "up" 
      },
      { 
        title: "Customer Base", 
        value: customerCount.toString(), 
        description: "Active business partners", 
        icon: Users, 
        trend: "+2 new", 
        trendType: "up" 
      },
      { 
        title: "Product Catalog", 
        value: productCount.toString(), 
        description: "Items in Master Data", 
        icon: Tag, 
        trend: "Stable", 
        trendType: "up" 
      },
      { 
        title: "Yield Efficiency", 
        value: "94.2%", 
        description: "Avg. Production Output", 
        icon: TrendingUp, 
        trend: "-0.8%", 
        trendType: "down" 
      }
    ];
  }, [invoices, customers, products]);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  const seedDemoData = async () => {
    if (!db || !user) return;
    setIsSeeding(true);
    
    try {
      // 1. Materials
      const materials = [
        { name: "Mozzarella Cheese", unit: "kg", category: "Raw Material", stock: 150, cost: 12000 },
        { name: "Potato Starch", unit: "kg", category: "Raw Material", stock: 200, cost: 5000 },
        { name: "Chicken Breast (Minced)", unit: "kg", category: "Raw Material", stock: 80, cost: 15000 },
        { name: "Premium Sausage", unit: "units", category: "Raw Material", stock: 500, cost: 1200 },
        { name: "Batter Mix", unit: "kg", category: "Ingredient", stock: 100, cost: 8000 },
        { name: "Breadcrumbs", unit: "kg", category: "Ingredient", stock: 120, cost: 4000 },
        { name: "Frying Oil", unit: "L", category: "Ingredient", stock: 300, cost: 6500 },
      ];

      for (const m of materials) {
        await addDocumentNonBlocking(collection(db, "raw_materials"), { ...m, createdAt: new Date().toISOString() });
      }

      // 2. Finished Goods & BOMs & Tiered Prices
      const productNames = [
        { name: "Original Cheese Stick", category: "Finished Good", price: 3500, stock: 45 },
        { name: "Long Potato", category: "Finished Good", price: 2500, stock: 120 },
        { name: "Chicken PopCorn", category: "Finished Good", price: 4500, stock: 30 },
        { name: "Sausage Cheese Stick", category: "Finished Good", price: 4000, stock: 25 },
      ];

      for (const p of productNames) {
        const productRef = await addDocumentNonBlocking(collection(db, "finished_goods"), { ...p, createdAt: new Date().toISOString() });
        if (productRef) {
          await addDocumentNonBlocking(collection(db, "finished_goods", productRef.id, "bom_versions"), {
            version: "v1.0",
            status: "Active",
            effDate: "2024-01-01",
            finishedGoodId: productRef.id,
            components: [
              { name: 'Mozzarella Cheese', qty: 0.05, unit: 'kg', loss: 2.0 },
              { name: 'Batter Mix', qty: 0.02, unit: 'kg', loss: 5.0 },
            ]
          });

          await addDocumentNonBlocking(collection(db, "finished_goods", productRef.id, "price_rules"), {
            customerType: "Distributor",
            price: p.price * 0.8,
            validFrom: "2024-01-01",
            validTo: "2025-12-31",
            createdAt: new Date().toISOString()
          });
        }
      }

      // 3. Customers
      const customersData = [
        { 
          name: "City Mart Supermarket", 
          email: "procurement@citymart.com", 
          phone: "+95 912345678", 
          address: "Pyay Road, Yangon", 
          customerType: "Corporate",
          customerClass: "VIP",
          taxId: "MM-778899",
          creditLimit: 5000000,
          paymentTerms: "Net 30",
          website: "https://www.citymart.com.mm",
          createdAt: new Date().toISOString() 
        },
      ];

      for (const c of customersData) {
        await addDocumentNonBlocking(collection(db, "customers"), c);
      }

      alert("Demo ecosystem seeded successfully!");
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
          <p className="text-muted-foreground">Live monitoring of Sales, Customers, and Production metrics.</p>
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
          <CardHeader><CardTitle className="font-headline">Production Variance Trend</CardTitle></CardHeader>
          <CardContent className="pl-2 h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
                <LineChart data={varianceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Line type="monotone" dataKey="variance" stroke="#FFD700" strokeWidth={3} dot={{ fill: '#FFD700', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                </LineChart>
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
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
