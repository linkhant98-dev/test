
"use client"

import { useState, useEffect } from "react"
import { Save, Image as ImageIcon, Palette, Layout, Loader2, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking, useUser } from "@/firebase"
import { doc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"

export default function AppSettingsPage() {
  const db = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()
  
  const settingsRef = useMemoFirebase(() => doc(db, "appSettings", "global"), [db])
  const { data: settings, isLoading } = useDoc(settingsRef)

  const [formData, setFormData] = useState({
    companyLogoUrl: "",
    primaryColor: "#FFD700",
    backgroundColor: "#F7F4F0",
    accentColor: "#4F7736"
  })

  useEffect(() => {
    if (settings) {
      setFormData({
        companyLogoUrl: settings.companyLogoUrl || "",
        primaryColor: settings.primaryColor || "#FFD700",
        backgroundColor: settings.backgroundColor || "#F7F4F0",
        accentColor: settings.accentColor || "#4F7736"
      })
    }
  }, [settings])

  const handleSave = () => {
    if (!db || !user) return
    setDocumentNonBlocking(settingsRef, formData, { merge: true }, { email: user.email, uid: user.uid })
    toast({
      title: "Settings Updated",
      description: "Global branding and theme have been applied."
    })
  }

  if (isLoading) {
    return <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">System Settings</h1>
        <p className="text-muted-foreground">Manage global branding, theme colors, and application defaults.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-headline flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary" />
              Company Branding
            </CardTitle>
            <CardDescription>Logo used on login screen and invoices.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Logo URL</Label>
              <Input 
                value={formData.companyLogoUrl}
                onChange={(e) => setFormData({...formData, companyLogoUrl: e.target.value})}
                placeholder="https://example.com/logo.png"
              />
            </div>
            {formData.companyLogoUrl && (
              <div className="p-4 bg-muted/20 rounded-xl flex items-center justify-center border border-dashed">
                <img src={formData.companyLogoUrl} alt="Logo Preview" className="max-h-20 object-contain" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-headline flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              Theme Configuration
            </CardTitle>
            <CardDescription>Custom HSL-mapped hex colors.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Primary (Gold)</Label>
                <div className="flex gap-2">
                  <Input type="color" className="w-12 h-10 p-1" value={formData.primaryColor} onChange={(e) => setFormData({...formData, primaryColor: e.target.value})} />
                  <Input value={formData.primaryColor} onChange={(e) => setFormData({...formData, primaryColor: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Accent (Olive)</Label>
                <div className="flex gap-2">
                  <Input type="color" className="w-12 h-10 p-1" value={formData.accentColor} onChange={(e) => setFormData({...formData, accentColor: e.target.value})} />
                  <Input value={formData.accentColor} onChange={(e) => setFormData({...formData, accentColor: e.target.value})} />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Background (Light Off-White)</Label>
              <div className="flex gap-2">
                <Input type="color" className="w-12 h-10 p-1" value={formData.backgroundColor} onChange={(e) => setFormData({...formData, backgroundColor: e.target.value})} />
                <Input value={formData.backgroundColor} onChange={(e) => setFormData({...formData, backgroundColor: e.target.value})} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-secondary text-secondary-foreground font-bold h-12 px-8">
          <Save className="h-4 w-4 mr-2" /> Save Global Configuration
        </Button>
      </div>
    </div>
  )
}
