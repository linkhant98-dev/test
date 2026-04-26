
"use client"

import { Calendar, Plus, Search, SlidersHorizontal, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function ProductionPlanningPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline text-foreground">Production Planning</h1>
          <p className="text-muted-foreground">Schedule upcoming production runs and check capacity.</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg">
          <Plus className="h-4 w-4 mr-2" /> New Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-none shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/10">
            <CardTitle className="text-lg font-headline">Weekly Schedule</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Prev</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
             <div className="grid grid-cols-7 border-b bg-muted/30">
               {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                 <div key={day} className="p-3 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground border-r last:border-0">{day}</div>
               ))}
             </div>
             <div className="grid grid-cols-7 h-[500px]">
               {Array.from({length: 35}).map((_, i) => (
                 <div key={i} className="border-r border-b p-2 last:border-r-0 hover:bg-muted/10 transition-colors cursor-pointer relative group flex flex-col">
                    <span className="text-[10px] font-bold text-muted-foreground/40">{i + 1}</span>
                    <div className="flex-1 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full bg-primary/20 text-primary">
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                 </div>
               ))}
             </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader className="bg-primary/5">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                Planning Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
               <p className="text-xs text-muted-foreground leading-relaxed">
                 Use the weekly schedule to map out upcoming manufacturing runs. Drag and drop functionality for rescheduling is currently under synchronization.
               </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Resource Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Production Line</label>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="secondary" size="sm" className="h-8 font-bold text-[10px]">Line 1</Button>
                  <Button variant="outline" size="sm" className="h-8 font-bold text-[10px]">Line 2</Button>
                  <Button variant="outline" size="sm" className="h-8 font-bold text-[10px]">Line 3</Button>
                  <Button variant="outline" size="sm" className="h-8 font-bold text-[10px]">Packing</Button>
                </div>
              </div>
              <div className="pt-4 border-t">
                <h4 className="text-xs font-bold text-muted-foreground uppercase mb-4">Real-time Utilization</h4>
                <div className="space-y-4">
                  {['Line 1', 'Line 2', 'Packing'].map(line => (
                    <div key={line} className="space-y-1">
                      <div className="flex justify-between text-[10px] font-black uppercase">
                        <span>{line}</span>
                        <span>0%</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary"
                          style={{ width: '0%' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Button className="w-full mt-4" variant="outline">
                <SlidersHorizontal className="h-4 w-4 mr-2" /> Advanced Config
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
