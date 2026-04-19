
"use client"

import { useState } from "react"
import { Trash2, Plus, Search, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, useUser } from "@/firebase"
import { collection } from "firebase/firestore"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function WasteReasonsPage() {
  const db = useFirestore()
  const { user } = useUser()
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newReason, setNewReason] = useState({
    code: "",
    description: "",
    category: "Production",
    severity: "Medium"
  })

  const reasonsRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, "waste_reasons");
  }, [db, user]);

  const { data: wasteReasons, isLoading } = useCollection(reasonsRef)

  const handleAddReason = () => {
    if (!newReason.code || !reasonsRef) return
    addDocumentNonBlocking(reasonsRef, {
      ...newReason,
      createdAt: new Date().toISOString()
    })
    setIsAddOpen(false)
    setNewReason({ code: "", description: "", category: "Production", severity: "Medium" })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline text-foreground">Waste Reasons</h1>
          <p className="text-muted-foreground">Define standardized codes for material wastage and loss reporting.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" /> Add Reason
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Waste Reason</DialogTitle>
              <DialogDescription>Create a code for loss tracking.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Reason Code</Label>
                <Input value={newReason.code} onChange={(e) => setNewReason({...newReason, code: e.target.value.toUpperCase()})} placeholder="e.g. SPOIL" />
              </div>
              <div className="grid gap-2">
                <Label>Description</Label>
                <Input value={newReason.description} onChange={(e) => setNewReason({...newReason, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Category</Label>
                  <Select onValueChange={(v) => setNewReason({...newReason, category: v})} defaultValue={newReason.category}>
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Production">Production</SelectItem>
                      <SelectItem value="Inventory">Inventory</SelectItem>
                      <SelectItem value="Operations">Operations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Severity</Label>
                  <Select onValueChange={(v) => setNewReason({...newReason, severity: v})} defaultValue={newReason.severity}>
                    <SelectTrigger>
                      <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Critical">Critical</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddReason}>Save Reason</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search reasons..." className="pl-9 bg-muted/20" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
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
                {wasteReasons?.map((reason) => (
                  <TableRow key={reason.id}>
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
                {!isLoading && wasteReasons?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground italic">
                      No reasons found. Seed demo data from Dashboard.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
