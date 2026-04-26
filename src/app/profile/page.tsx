
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { User, Mail, Shield, Calendar, Save, Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useUser, useAuth } from "@/firebase"
import { updateProfile } from "firebase/auth"
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from "@/context/language-context"
import Link from "next/link"

export default function ProfilePage() {
  const { user, isUserLoading } = useUser()
  const auth = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useTranslation()

  const [displayName, setDisplayName] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "")
    }
  }, [user])

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login")
    }
  }, [user, isUserLoading, router])

  const handleUpdate = async () => {
    if (!auth?.currentUser) return
    setIsUpdating(true)
    try {
      await updateProfile(auth.currentUser, {
        displayName: displayName
      })
      toast({
        title: t("profileUpdated"),
        description: t("profileUpdateDesc")
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message
      })
    } finally {
      setIsUpdating(false)
    }
  }

  if (isUserLoading || !user) {
    return <div className="h-full w-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" /> {t("backToHome")}
        </Link>
      </div>

      <Card className="border-none shadow-xl overflow-hidden bg-white">
        <div className="h-32 bg-secondary relative">
          <div className="absolute -bottom-12 left-8">
            <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
              <AvatarImage src={user.photoURL || ""} />
              <AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold">
                {user.displayName?.[0] || user.email?.[0].toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
        <CardHeader className="pt-16 pb-4 px-8">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl font-bold font-headline">{user.displayName || "Standard User"}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </div>
            <Badge variant="secondary" className="bg-secondary/10 text-secondary border-none px-3 py-1">
              <Shield className="h-3 w-3 mr-1" /> {user.isAnonymous ? "Guest Admin" : "Administrator"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="px-8 space-y-6">
          <div className="grid gap-6">
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("displayName")}</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="displayName" 
                  value={displayName} 
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="pl-10 h-12 rounded-xl"
                  placeholder="Your full name"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("emailAddress")}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  value={user.email || "No email linked"} 
                  disabled 
                  className="pl-10 h-12 rounded-xl bg-muted/30 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("accountRole")}</Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    value={user.isAnonymous ? "Restricted Access" : "Full Administrative Access"} 
                    disabled 
                    className="pl-10 h-12 rounded-xl bg-muted/30 cursor-not-allowed"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("memberSince")}</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    value={new Date(user.metadata.creationTime || Date.now()).toLocaleDateString()} 
                    disabled 
                    className="pl-10 h-12 rounded-xl bg-muted/30 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="px-8 py-6 bg-muted/10 border-t flex justify-end">
          <Button onClick={handleUpdate} disabled={isUpdating} className="bg-primary text-primary-foreground font-bold px-8 h-12 rounded-xl shadow-lg shadow-primary/20">
            {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            {t("saveProfile")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
