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
  Sparkles,
  RefreshCcw
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
import { collection, doc, serverTimestamp } from "firebase/firestore"

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
    if (!db || !user) return;
    setIsSeeding(true);
    
    try {
      // 1. Materials
      const materials = [
        { name: "Mozzarella Cheese", unit: "kg", category: "Raw Material", stock: 150 },
        { name: "Potato Starch", unit: "kg", category: "Raw Material", stock: 200 },
        { name: "Chicken Breast (Minced)", unit: "kg", category: "Raw Material", stock: 80 },
        { name: "Premium Sausage", unit: "units", category: "Raw Material", stock: 500 },
        { name: "Batter Mix", unit: "kg", category: "Ingredient", stock: 100 },
        { name: "Breadcrumbs", unit: "kg", category: "Ingredient", stock: 120 },
        { name: "Frying Oil", unit: "L", category: "Ingredient", stock: 300 },
      ];

      for (const m of materials) {
        await addDocumentNonBlocking(collection(db, "raw_materials"), { ...m, createdAt: new Date().toISOString() });
      }

      // 2. Finished Goods & BOMs
      const products = [
        { name: "Original Cheese Stick", category: "Finished Good", price: 12.50, stock: 45 },
        { name: "Long Potato", category: "Finished Good", price: 8.00, stock: 120 },
        { name: "Chicken PopCorn", category: "Finished Good", price: 15.00, stock: 30 },
        { name: "Sausage Cheese Stick", category: "Finished Good", price: 14.50, stock: 25 },
      ];

      for (const p of products) {
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
        }
      }

      // 3. Customers
      const customers = [
        { 
          name: "City Mart Supermarket", 
          email: "procurement@citymart.com", 
          phone: "+95 912345678", 
          address: "Pyay Road, Yangon", 
          customerType: "Corporate",
          customerClass: "VIP",
          taxId: "MM-778899",
          creditLimit: 50000,
          paymentTerms: "Net 30",
          website: "https://www.citymart.com.mm",
          createdAt: new Date().toISOString() 
        },
        { 
          name: "Snack Shack Distribution", 
          email: "info@snackshack.com", 
          phone: "+95 987654321", 
          address: "Mandalay Plaza", 
          customerType: "Distributor",
          customerClass: "Grade A",
          taxId: "SS-112233",
          creditLimit: 25000,
          paymentTerms: "Net 15",
          website: "https://snackshack.biz",
          createdAt: new Date().toISOString() 
        },
      ];

      for (const c of customers) {
        await addDocumentNonBlocking(collection(db, "customers"), c);
      }

      // 4. Invoices
      const invoices = [
        { invoiceNumber: "INV-1001", customerName: "City Mart Supermarket", customerId: "dummy", totalAmount: 1500, status: "Sent", dueDate: "2024-06-01", createdAt: new Date().toISOString(), items: [{ productName: "Original Cheese Stick", quantity: 100, price: 15, total: 1500 }] },
        { invoiceNumber: "INV-1002", customerName: "Snack Shack Distribution", customerId: "dummy", totalAmount: 850, status: "Paid", dueDate: "2024-05-20", createdAt: new Date().toISOString(), items: [{ productName: "Long Potato", quantity: 100, price: 8.5, total: 850 }] },
      ];
      for (const i of invoices) {
        await addDocumentNonBlocking(collection(db, "invoices"), i);
      }

      // 5. Warehouses
      const warehouses = [
        { name: "Main Cold Storage", location: "Building A, West Wing", status: "Active", capacity: "85%" },
        { name: "Raw Material Depot", location: "Building B, South Gate", status: "Active", capacity: "40%" },
      ];

      for (const w of warehouses) {
        await addDocumentNonBlocking(collection(db, "warehouses"), { ...w, createdAt: new Date().toISOString() });
      }

      // 6. Production Orders
      const orders = [
        { product: "Original Cheese Stick", quantity: 1200, date: "2024-05-15", status: "Complete", yield: 94.2, variance: -0.8 },
        { product: "Long Potato", quantity: 800, date: "2024-05-18", status: "In Progress", yield: 0, variance: 0 },
      ];

      for (const o of orders) {
        await addDocumentNonBlocking(collection(db, "production_orders"), {
          ...o,
          createdByUserId: user.uid,
          createdAt: new Date().toISOString()
        });
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

  const stats = [
    { title: t("activeProductionOrders"), value: "12", description: "4 scheduled for today", icon: ShoppingCart, trend: "+2 from yesterday", trendType: "up" },
    { title: t("inventoryValue"), value: "$45,231.89", description: "Across 3 warehouses", icon: Package, trend: "+4.5%", trendType: "up" },
    { title: t("avgYield"), value: "94.2%", description: "Target: 95.0%", icon: CheckCircle2, trend: "-0.8%", trendType: "down" },
    { title: t("efficiencyAlerts"), value: "3", description: "Requires urgent review", icon: ClipboardList, trend: "Operational", trendType: "up" }
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
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
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
          <CardHeader><CardTitle className="font-headline">{t("productionVarianceTrend")}</CardTitle></CardHeader>
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
          <CardHeader><CardTitle className="font-headline">{t("productionMix")}</CardTitle></CardHeader>
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