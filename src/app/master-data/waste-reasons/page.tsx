
"use client"

import { Trash2, Plus, Search, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const wasteReasons = [
  { code: "SPOIL", description: "Natural spoilage or expiry", category: "Inventory", severity: "High" },
  { code: "DAMG", description: "Physical damage during handling", category: "Operations", severity: "Medium" },
  { code: "REJECT", description: "Quality control rejection", category: "Production", severity: "Critical" },
  { code: "PROCESS", description: "Inherent process loss/waste", category: "Production", severity: "Low" },
]

export default function WasteReasonsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline text-foreground">Waste Reasons</h1>
          <p className="text-muted-foreground">Define standardized codes for material wastage and loss reporting.</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" /> Add Reason
        </Button>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search reasons..." className="pl-9 bg-muted/20" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {wasteReasons.map((reason) => (
                <TableRow key={reason.code}>
                  <TableCell className="font-mono font-bold text-secondary">{reason.code}</TableCell>
                  <TableCell>{reason.description}</TableCell>
                  <TableCell>{reason.category}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <div className={`h-2 w-2 rounded-full ${
                        reason.severity === 'Critical' ? 'bg-destructive' :
                        reason.severity === 'High' ? 'bg-orange-500' :
                        reason.severity === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`} />
                      <span className="text-xs">{reason.severity}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                      <AlertCircle className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
