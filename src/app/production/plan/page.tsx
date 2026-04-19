
"use client"

import { Calendar, Plus, Search, SlidersHorizontal } from "lucide-react"
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
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" /> New Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b">
            <CardTitle className="text-lg font-headline">Weekly Schedule</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Prev</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
             <div className="grid grid-cols-7 border-b bg-muted/30">
               {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                 <div key={day} className="p-2 text-center text-[10px] font-bold uppercase text-muted-foreground border-r last:border-0">{day}</div>
               ))}
             </div>
             <div className="grid grid-cols-7 h-[400px]">
               {Array.from({length: 35}).map((_, i) => (
                 <div key={i} className="border-r border-b p-2 last:border-r-0 hover:bg-muted/10 transition-colors cursor-pointer relative group">
                    <span className="text-[10px] text-muted-foreground">{i + 1}</span>
                    {i === 2 && (
                      <div className="mt-1 p-1 bg-secondary/20 border-l-2 border-secondary rounded text-[8px] font-bold text-secondary-foreground truncate">
                        Cheddar #05
                      </div>
                    )}
                    {i === 4 && (
                      <div className="mt-1 p-1 bg-primary/20 border-l-2 border-primary rounded text-[8px] font-bold text-primary-foreground truncate">
                        Mozza #12
                      </div>
                    )}
                 </div>
               ))}
             </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-bold">Planning Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Production Line</label>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="secondary" size="sm" className="h-8">Line 1</Button>
                <Button variant="outline" size="sm" className="h-8">Line 2</Button>
                <Button variant="outline" size="sm" className="h-8">Line 3</Button>
                <Button variant="outline" size="sm" className="h-8">Packing</Button>
              </div>
            </div>
            <div className="pt-4 border-t">
              <h4 className="text-xs font-bold text-muted-foreground uppercase mb-4">Capacity Utilization</h4>
              <div className="space-y-4">
                {['Line 1', 'Line 2', 'Packing'].map(line => (
                  <div key={line} className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold uppercase">
                      <span>{line}</span>
                      <span>{line === 'Line 1' ? '92%' : line === 'Line 2' ? '45%' : '60%'}</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${line === 'Line 1' ? 'bg-destructive' : 'bg-secondary'}`}
                        style={{ width: line === 'Line 1' ? '92%' : line === 'Line 2' ? '45%' : '60%' }}
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
  )
}
