
"use client"

import { useParams } from "next/navigation"
import { Printer, ArrowLeft, Loader2, Mail, Phone, MapPin, Globe, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase"
import { doc } from "firebase/firestore"
import Link from "next/link"
import { useAppSettings } from "@/components/theme-provider"

export default function PrintInvoicePage() {
  const { id } = useParams()
  const db = useFirestore()
  const settings = useAppSettings()
  
  const invRef = useMemoFirebase(() => doc(db, "invoices", id as string), [db, id])
  const { data: invoice, isLoading } = useDoc(invRef)

  if (isLoading) return <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  if (!invoice) return <div className="p-12 text-center">Invoice not found.</div>

  return (
    <div className="max-w-4xl mx-auto space-y-8 print:p-0 p-8 bg-white shadow-xl min-h-screen">
      <div className="flex justify-between items-center print:hidden border-b pb-4">
        <Link href="/sales/invoices">
          <Button variant="ghost"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Invoices</Button>
        </Link>
        <Button onClick={() => window.print()} className="bg-primary text-primary-foreground font-bold">
          <Printer className="h-4 w-4 mr-2" /> Print Document
        </Button>
      </div>

      <div className="border-b-4 border-primary pb-8 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center overflow-hidden">
               {settings?.companyLogoUrl ? (
                 <img src={settings.companyLogoUrl} alt="Logo" className="object-contain h-full w-full" />
               ) : <span className="font-black text-xl text-primary-foreground">CB</span>}
            </div>
            <h1 className="text-3xl font-black font-headline tracking-tighter uppercase">Cheesy Bites Co.</h1>
          </div>
          <div className="space-y-1 text-xs text-muted-foreground uppercase font-bold tracking-widest">
            <p className="flex items-center gap-2"><MapPin className="h-3 w-3" /> 123 Factory Lane, Industrial Zone, Yangon</p>
            <p className="flex items-center gap-2"><Phone className="h-3 w-3" /> +95 912345678</p>
            <p className="flex items-center gap-2"><Globe className="h-3 w-3" /> www.cheesybites.com</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-7xl font-black opacity-5 leading-none">INVOICE</h2>
          <div className="mt-4">
            <p className="text-2xl font-black font-headline text-primary">{invoice.invoiceNumber}</p>
            <p className="text-xs text-muted-foreground font-bold">ISSUE DATE: {new Date(invoice.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-12 py-8">
        <div>
          <h3 className="text-[10px] font-black uppercase text-muted-foreground mb-4 tracking-[0.2em] border-b pb-1">Billing Details</h3>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-black text-xl">{invoice.customerName}</span>
            {invoice.customerCode && (
              <Badge variant="outline" className="text-[10px] font-black border-primary text-primary">
                {invoice.customerCode}
              </Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
             <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> {invoice.customerAddress || 'Default Customer Address, Yangon, Myanmar'}</p>
             <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> +95 912345678</p>
          </div>
        </div>
        <div className="text-right">
          <h3 className="text-[10px] font-black uppercase text-muted-foreground mb-4 tracking-[0.2em] border-b pb-1">Payment Schedule</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm border-b border-dashed py-1">
              <span className="text-muted-foreground">Term:</span> 
              <span className="font-bold">Net 7 Days</span>
            </div>
            <div className="flex justify-between text-sm border-b border-dashed py-1">
              <span className="text-muted-foreground">Due Date:</span> 
              <span className="font-bold text-destructive">{invoice.dueDate}</span>
            </div>
            <div className="flex justify-between text-sm border-b border-dashed py-1">
              <span className="text-muted-foreground">Payment:</span> 
              <span className="font-bold flex items-center gap-1 justify-end"><CreditCard className="h-3 w-3" /> {invoice.paymentMethod}</span>
            </div>
            <div className="flex justify-between text-sm border-b border-dashed py-1">
              <span className="text-muted-foreground">Status:</span> 
              <Badge variant="outline" className="font-black uppercase text-[10px] py-0">{invoice.status}</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-950 text-white text-[10px] font-black uppercase tracking-widest">
              <th className="p-4 rounded-tl-lg">Description / Item Code</th>
              <th className="p-4 text-center">Qty</th>
              <th className="p-4 text-center">Unit</th>
              <th className="p-4 text-right">Unit Price</th>
              <th className="p-4 text-right rounded-tr-lg">Line Total</th>
            </tr>
          </thead>
          <tbody className="divide-y border-x border-b">
            {invoice.items?.map((item: any, i: number) => (
              <tr key={i} className="text-sm hover:bg-muted/30 transition-colors">
                <td className="p-4">
                  <div className="font-black">{item.productName}</div>
                  <div className="text-[10px] text-primary font-black uppercase tracking-widest">
                    CODE: {item.productCode || 'CB-FG-UNKNOWN'}
                  </div>
                </td>
                <td className="p-4 text-center font-mono">{item.quantity}</td>
                <td className="p-4 text-center text-xs text-muted-foreground uppercase font-bold">{item.unit || 'Units'}</td>
                <td className="p-4 text-right font-mono">MMK {item.price.toLocaleString()}</td>
                <td className="p-4 text-right font-black font-mono text-primary">MMK {item.total.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end pt-12">
        <div className="w-96 space-y-4">
          <div className="flex justify-between text-sm px-2">
            <span className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Subtotal:</span> 
            <span className="font-mono">MMK {invoice.totalAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm px-2">
            <span className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Tax (0%):</span> 
            <span className="font-mono">MMK 0</span>
          </div>
          <div className="flex justify-between text-xl font-black bg-primary p-4 rounded-xl shadow-lg shadow-primary/20">
            <span className="tracking-tighter uppercase text-primary-foreground">Total:</span> 
            <span className="font-mono text-primary-foreground">MMK {invoice.totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="mt-40 pt-12 border-t text-[9px] text-muted-foreground text-center font-bold uppercase tracking-[0.3em]">
        <p>Thank you for choosing Cheesy Bites - Precision Quality Guaranteed</p>
        <p className="mt-2">This is a system generated document - No signature required</p>
      </div>
    </div>
  )
}
