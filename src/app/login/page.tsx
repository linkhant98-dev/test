
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Lock, Mail, Loader2, ShieldCheck, UserPlus, LogIn, Key, Store, Sparkles, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth, useUser, useFirestore } from "@/firebase"
import { initiateAnonymousSignIn } from "@/firebase/non-blocking-login"
import { useTranslation } from "@/context/language-context"
import { useAppSettings } from "@/components/theme-provider"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const router = useRouter()
  const auth = useAuth()
  const db = useFirestore()
  const { user, isUserLoading } = useUser()
  const { t } = useTranslation()
  const settings = useAppSettings()
  const { toast } = useToast()
  
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (user && !isUserLoading) {
      router.push("/")
    }
  }, [user, isUserLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!auth || !email || !password) return
    
    setIsLoggingIn(true)
    try {
      if (authMode === 'login') {
        await signInWithEmailAndPassword(auth, email, password)
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email, password)
        await setDoc(doc(db, "users", cred.user.uid), {
          name: email.split('@')[0],
          email: email,
          role: "Viewer",
          status: "Active",
          createdAt: new Date().toISOString()
        })
      }
      router.push("/")
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: err.message || "Invalid credentials. Please try again."
      })
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleDemoLogin = () => {
    if (!auth) return
    setIsLoggingIn(true)
    initiateAnonymousSignIn(auth)
  }

  const handleInitializeAdmin = async () => {
    if (!auth || !db) return
    setIsLoggingIn(true)
    try {
      const cred = await createUserWithEmailAndPassword(auth, "admin@gmail.com", "admin123")
      await setDoc(doc(db, "roles_admin", cred.user.uid), {
        email: "admin@gmail.com",
        role: "Administrator",
        initializedAt: new Date().toISOString()
      })
      await setDoc(doc(db, "users", cred.user.uid), {
        name: "Main Administrator",
        email: "admin@gmail.com",
        role: "Administrator",
        status: "Active",
        createdAt: new Date().toISOString()
      })
      router.push("/")
    } catch (e: any) {
      if (e.code === 'auth/email-already-in-use') {
        try {
          await signInWithEmailAndPassword(auth, "admin@gmail.com", "admin123")
          router.push("/")
        } catch (loginErr: any) {
          toast({ variant: "destructive", title: "Login Failed", description: loginErr.message })
        }
      } else {
        toast({ variant: "destructive", title: "Setup Failed", description: e.message })
      }
    } finally {
      setIsLoggingIn(false)
    }
  }

  if (isUserLoading || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] p-4">
      <div className="w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden border">
        <div className="hidden lg:flex flex-col justify-between p-12 bg-secondary text-secondary-foreground relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <Image 
              src="https://picsum.photos/seed/cheese-pattern/1200/1200"
              alt="Background pattern"
              fill
              className="object-cover"
              data-ai-hint="cheese pattern"
            />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-xl overflow-hidden p-1 border-4 border-white/20">
                {settings?.companyLogoUrl ? (
                   <img src={settings.companyLogoUrl} alt="Logo" className="rounded-xl object-contain h-full w-full" />
                ) : (
                  <Image src="https://picsum.photos/seed/cheesy-official/400/400" alt="Logo" width={64} height={64} className="rounded-xl object-contain" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-black leading-none font-headline tracking-tighter uppercase">Cheesy</span>
                <span className="text-sm font-bold text-primary -mt-1 tracking-[0.2em] uppercase">Bites</span>
              </div>
            </div>
            <h1 className="text-4xl font-bold font-headline leading-tight mb-6">Precision Inventory Control System</h1>
            <p className="text-secondary-foreground/80 max-w-sm text-lg leading-relaxed">Choose your working environment to begin managing production, sales, and quality control.</p>
          </div>
          <div className="relative z-10 flex gap-6 text-xs font-bold uppercase tracking-widest opacity-40">
            <span>© 2024 Cheesy Bites Co.</span>
            <span>Enterprise Edition</span>
          </div>
        </div>

        <div className="p-8 md:p-16 flex flex-col justify-center bg-white">
          <Tabs defaultValue="demo" className="w-full">
            <div className="text-center lg:text-left mb-8">
               <h2 className="text-3xl font-bold font-headline mb-2">Select Company</h2>
               <p className="text-muted-foreground text-sm">Toggle between our training sandbox or your production console.</p>
            </div>
            
            <TabsList className="grid w-full grid-cols-2 mb-10 h-14 p-1 bg-muted/40 rounded-2xl">
              <TabsTrigger value="demo" className="rounded-xl font-bold text-xs gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm uppercase tracking-widest">
                <Sparkles className="h-3 w-3" /> Demo Sandbox
              </TabsTrigger>
              <TabsTrigger value="cheesy" className="rounded-xl font-bold text-xs gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm uppercase tracking-widest">
                <Building2 className="h-3 w-3" /> Cheesy Bites
              </TabsTrigger>
            </TabsList>

            <TabsContent value="demo" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <div className="p-6 rounded-3xl border-2 border-dashed border-primary/20 bg-primary/5 space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                  <Store className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-xl">Demo Company</h3>
                  <p className="text-sm text-muted-foreground">Evaluation environment pre-loaded with comprehensive training data, tiered prices, and production logs.</p>
                </div>
                <Button 
                  onClick={handleDemoLogin} 
                  disabled={isLoggingIn}
                  className="w-full h-14 text-md font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90"
                >
                  {isLoggingIn ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  Enter Demo Mode
                </Button>
              </div>
              <p className="text-[10px] text-center text-muted-foreground font-medium uppercase tracking-[0.2em]">Ideal for product evaluation & staff training</p>
            </TabsContent>

            <TabsContent value="cheesy" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <div className="space-y-6">
                <div className="space-y-2">
                   <h3 className="font-bold text-xl">Production Console</h3>
                   <p className="text-sm text-muted-foreground">Log in to the real Cheesy Bites database. All master data and transactions will be blank by default.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Account Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input type="email" placeholder="admin@cheesybites.com" className="pl-10 h-12 rounded-xl" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Secure Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input type="password" placeholder="••••••••" className="pl-10 h-12 rounded-xl" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-14 text-md font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-secondary/20 bg-secondary hover:bg-secondary/90" disabled={isLoggingIn}>
                    {isLoggingIn ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <LogIn className="h-4 w-4 mr-2" />}
                    {authMode === 'login' ? 'Sign In' : 'Register Account'}
                  </Button>
                  <div className="flex flex-col gap-2 pt-2">
                    <Button variant="link" type="button" className="text-xs font-bold text-muted-foreground" onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}>
                      {authMode === 'login' ? "New to Cheesy Bites? Create an account" : "Already have an account? Sign In"}
                    </Button>
                    <Button variant="ghost" type="button" onClick={handleInitializeAdmin} className="text-[9px] text-muted-foreground uppercase font-black tracking-widest hover:text-primary">
                      <Key className="h-3 w-3 mr-1.5" /> Force Initialize Super Admin
                    </Button>
                  </div>
                </form>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
