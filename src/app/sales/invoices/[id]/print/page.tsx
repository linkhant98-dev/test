
"use client"

import { useParams } from "next/navigation"
import { Printer, ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase"
import { doc } from "firebase/firestore"
import Link from "next/link"

export default function PrintInvoicePage() {
  const { id } = useParams()
  const db = useFirestore()
  
  const invRef = useMemoFirebase(() => doc(db, "invoices", id as string), [db, id])
  const { data: invoice, isLoading } = useDoc(invRef)

  if (isLoading) return <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
  if (!invoice) return <div className="p-12 text-center">Invoice not found.</div>

  return (
    <div className="max-w-4xl mx-auto space-y-8 print:p-0 p-8 bg-white shadow-xl min-h-screen">
      <div className="flex justify-between items-center print:hidden">
        <Link href="/sales/invoices">
          <Button variant="ghost"><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
        </Link>
        <Button onClick={() => window.print()} className="bg-primary text-primary-foreground">
          <Printer className="h-4 w-4 mr-2" /> Print Now
        </Button>
      </div>

      <div className="border-b-4 border-primary pb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black font-headline tracking-tighter">CHEESY BITES CO.</h1>
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mt-1">Premium Snack Manufacturing</p>
          <div className="mt-6 text-sm">
            <p>123 Factory Lane, Industrial Zone</p>
            <p>Yangon, Myanmar</p>
            <p>support@cheesybites.com</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-6xl font-black opacity-10">INVOICE</h2>
          <div className="mt-4">
            <p className="font-bold text-lg">{invoice.invoiceNumber}</p>
            <p className="text-xs text-muted-foreground">Dated: {new Date(invoice.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-12">
        <div>
          <h3 className="text-[10px] font-black uppercase text-muted-foreground mb-4">Bill To</h3>
          <div className="font-bold text-lg">{invoice.customerName}</div>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{invoice.customerAddress || 'Customer Address'}</p>
        </div>
        <div className="text-right">
          <h3 className="text-[10px] font-black uppercase text-muted-foreground mb-4">Payment Info</h3>
          <div className="text-sm">
            <div className="flex justify-between border-b py-2"><span className="text-muted-foreground">Due Date:</span> <span className="font-bold">{invoice.dueDate}</span></div>
            <div className="flex justify-between border-b py-2"><span className="text-muted-foreground">Status:</span> <span className="font-bold uppercase text-primary">{invoice.status}</span></div>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-muted text-[10px] font-black uppercase tracking-widest">
              <th className="p-4">Description</th>
              <th className="p-4 text-center">Qty</th>
              <th className="p-4 text-right">Price</th>
              <th className="p-4 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y border-b">
            {invoice.items?.map((item: any, i: number) => (
              <tr key={i} className="text-sm">
                <td className="p-4 font-bold">{item.productName}</td>
                <td className="p-4 text-center">{item.quantity}</td>
                <td className="p-4 text-right">${item.price.toFixed(2)}</td>
                <td className="p-4 text-right font-bold">${item.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end pt-8">
        <div className="w-64 space-y-3">
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal:</span> <span>${invoice.totalAmount.toFixed(2)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Tax (0%):</span> <span>$0.00</span></div>
          <div className="flex justify-between text-xl font-black border-t-2 border-primary pt-3"><span>TOTAL:</span> <span className="text-primary">${invoice.totalAmount.toFixed(2)}</span></div>
        </div>
      </div>

      <div className="mt-32 pt-12 border-t text-[10px] text-muted-foreground text-center">
        <p>Thank you for your business. Please make payments within 7 days of the invoice date.</p>
        <p className="mt-1">Cheesy Bites Co. - Precision Inventory & Production Control</p>
      </div>
    </div>
  )
}
