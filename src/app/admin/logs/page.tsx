
"use client"

import { History, Search, Filter, Terminal, FileText, UserCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const logs = [
  { time: "2024-05-15 14:22:10", user: "Admin User", action: "Updated Material", target: "MAT-001", details: "Changed stock from 2400 to 2500" },
  { time: "2024-05-15 12:45:05", user: "Lead Prod", action: "Created Order", target: "PO-2024-006", details: "New production run for Brie Appetizers" },
  { time: "2024-05-15 09:12:30", user: "Inv Spec", action: "Goods Receipt", target: "GR-2024-102", details: "3 items received from vendor" },
  { time: "2024-05-14 16:30:11", user: "System", action: "AI Analysis", target: "PO-2024-006", details: "Anomaly detected in yield variance" },
]

export default function SystemLogsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-foreground">System Logs</h1>
          <p className="text-muted-foreground">Audit trail of all administrative and operational activities.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Filter className="h-4 w-4 mr-2" /> Filter</Button>
          <Button variant="outline"><FileText className="h-4 w-4 mr-2" /> Export</Button>
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden bg-slate-950 text-slate-50">
        <CardHeader className="border-b border-slate-800 p-4 flex flex-row items-center gap-4">
          <Terminal className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-mono uppercase tracking-widest text-primary/80">Audit Trail Console</CardTitle>
          <div className="ml-auto relative w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-500" />
             <Input placeholder="Filter logs..." className="h-8 pl-8 bg-slate-900 border-slate-800 text-xs text-slate-300 placeholder:text-slate-600 focus-visible:ring-slate-700" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="font-mono text-[10px] md:text-xs">
            <div className="grid grid-cols-12 gap-4 p-3 border-b border-slate-900 bg-slate-900/50 text-slate-500 font-bold uppercase">
               <div className="col-span-3">Timestamp</div>
               <div className="col-span-2">User</div>
               <div className="col-span-2">Action</div>
               <div className="col-span-5">Details</div>
            </div>
            <div className="divide-y divide-slate-900">
              {logs.map((log, i) => (
                <div key={i} className="grid grid-cols-12 gap-4 p-3 hover:bg-slate-900/30 transition-colors">
                  <div className="col-span-3 text-slate-500">{log.time}</div>
                  <div className="col-span-2 flex items-center gap-1.5 text-primary">
                    <UserCircle className="h-3 w-3" /> {log.user}
                  </div>
                  <div className="col-span-2 text-secondary font-bold">{log.action}</div>
                  <div className="col-span-5 text-slate-400">
                    <span className="bg-slate-800 px-1 rounded text-slate-200 mr-2">{log.target}</span>
                    {log.details}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
