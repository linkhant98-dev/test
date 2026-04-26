
"use client"

import { useState } from "react"
import { History, Search, Filter, Terminal, FileText, UserCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase"
import { collection, query, orderBy, limit } from "firebase/firestore"

export default function SystemLogsPage() {
  const db = useFirestore()
  const { user } = useUser()
  const [searchTerm, setSearchTerm] = useState("")

  const logsRef = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "system_logs"), orderBy("timestamp", "desc"), limit(100));
  }, [db, user]);

  const { data: logs, isLoading } = useCollection(logsRef)

  const filteredLogs = logs?.filter(log => 
    log.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.target?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-foreground">System Audit Trail</h1>
          <p className="text-muted-foreground">Real-time tracking of all administrative and operational CRUD activities.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Filter className="h-4 w-4 mr-2" /> Filter</Button>
          <Button variant="outline"><FileText className="h-4 w-4 mr-2" /> Export Logs</Button>
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden bg-slate-950 text-slate-50">
        <CardHeader className="border-b border-slate-800 p-4 flex flex-row items-center gap-4">
          <Terminal className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-mono uppercase tracking-widest text-primary/80">Audit Trail Console</CardTitle>
          <div className="ml-auto relative w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-500" />
             <Input 
                placeholder="Filter logs..." 
                className="h-8 pl-8 bg-slate-900 border-slate-800 text-xs text-slate-300 placeholder:text-slate-600 focus-visible:ring-slate-700" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
        </CardHeader>
        <CardContent className="p-0 min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">Accessing Audit Database...</span>
            </div>
          ) : (
            <div className="font-mono text-[10px] md:text-xs">
              <div className="grid grid-cols-12 gap-4 p-3 border-b border-slate-900 bg-slate-900/50 text-slate-500 font-bold uppercase">
                 <div className="col-span-3">Timestamp</div>
                 <div className="col-span-3">Performed By</div>
                 <div className="col-span-2">Action</div>
                 <div className="col-span-4">Details</div>
              </div>
              <div className="divide-y divide-slate-900 max-h-[600px] overflow-y-auto">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="grid grid-cols-12 gap-4 p-3 hover:bg-slate-900/30 transition-colors">
                    <div className="col-span-3 text-slate-500">{new Date(log.timestamp).toLocaleString()}</div>
                    <div className="col-span-3 flex items-center gap-1.5 text-primary truncate">
                      <UserCircle className="h-3 w-3 shrink-0" /> {log.user}
                    </div>
                    <div className={`col-span-2 font-bold ${
                      log.action === 'CREATE' ? 'text-green-400' : 
                      log.action === 'UPDATE' ? 'text-blue-400' : 
                      log.action === 'DELETE' ? 'text-red-400' : 'text-secondary'
                    }`}>
                      {log.action}
                    </div>
                    <div className="col-span-4 text-slate-400 truncate">
                      <span className="bg-slate-800 px-1 rounded text-slate-200 mr-2">{log.target?.split('/').pop()}</span>
                      {log.details}
                    </div>
                  </div>
                ))}
                {filteredLogs.length === 0 && (
                  <div className="p-12 text-center text-slate-600 italic">No activity logs found for the current filter.</div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
