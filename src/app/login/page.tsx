
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Lock, Mail, Loader2, ShieldCheck, UserPlus, LogIn, Key, Store, Sparkles, Building2, ChefHat, Wheat, UtensilsCrossed } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth, useUser, useFirestore } from "@/firebase"
import { initiateAnonymousSignIn } from "@/firebase/non-blocking-login"
import { useTranslation } from "@/context/language-context"
import { useAppSettings } from "@/components/theme-provider"
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth"
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
      await signInWithEmailAndPassword(auth, email, password)
      router.push("/")
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: "Invalid credentials or unauthorized access. Please contact your system administrator."
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
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB] p-4 lg:p-0">
      <div className="w-full max-w-[1200px] h-full lg:h-[800px] grid grid-cols-1 lg:grid-cols-12 bg-white rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] overflow-hidden border border-slate-100">
        
        {/* Visual Brand Panel */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-12 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-40 mix-blend-overlay">
            <Image 
              src="https://picsum.photos/seed/gourmet-cheese/1200/1600"
              alt="Gourmet Snacks"
              fill
              className="object-cover"
              data-ai-hint="cheese snacks"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-16">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-2xl shadow-primary/20 p-1 border-2 border-white/10">
                {settings?.companyLogoUrl ? (
                   <img src={settings.companyLogoUrl} alt="Logo" className="rounded-xl object-contain h-full w-full" />
                ) : (
                  <UtensilsCrossed className="h-8 w-8 text-black" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black leading-none font-headline tracking-tighter uppercase">Cheesy</span>
                <span className="text-xs font-bold text-primary tracking-[0.3em] uppercase">Bites Co.</span>
              </div>
            </div>
            
            <div className="space-y-6">
               <h1 className="text-5xl font-bold font-headline leading-[1.1] tracking-tight">
                 Gourmet <br/>
                 <span className="text-primary">Precision</span> <br/>
                 Operations.
               </h1>
               <div className="h-1 w-12 bg-primary rounded-full" />
               <p className="text-slate-300 max-w-sm text-lg leading-relaxed font-medium">
                 The ultimate operating system for snack manufacturing, batch tracking, and retail velocity.
               </p>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-2 gap-8">
             <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Recipe Integrity</span>
                <span className="text-xs text-slate-400 font-bold">Standardized BOMs</span>
             </div>
             <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Retail Sync</span>
                <span className="text-xs text-slate-400 font-bold">Real-time Inventory</span>
             </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="lg:col-span-7 p-8 md:p-20 flex flex-col justify-center bg-white">
          <div className="max-w-md mx-auto w-full">
            <Tabs defaultValue="demo" className="w-full">
              <div className="text-center lg:text-left mb-10">
                 <h2 className="text-4xl font-bold font-headline mb-3 text-slate-900 tracking-tight">Workspace Login</h2>
                 <p className="text-slate-500 font-medium">Access your enterprise dashboard or the demo sandbox.</p>
              </div>
              
              <TabsList className="grid w-full grid-cols-2 mb-12 h-14 p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
                <TabsTrigger value="demo" className="rounded-xl font-bold text-[10px] gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary uppercase tracking-widest transition-all">
                  <Sparkles className="h-3 w-3" /> Training Sandbox
                </TabsTrigger>
                <TabsTrigger value="cheesy" className="rounded-xl font-bold text-[10px] gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-secondary uppercase tracking-widest transition-all">
                  <Building2 className="h-3 w-3" /> Production
                </TabsTrigger>
              </TabsList>

              <TabsContent value="demo" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-8 rounded-[2rem] border-2 border-dashed border-primary/20 bg-primary/5 space-y-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <ChefHat className="h-32 w-32" />
                  </div>
                  <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-xl shadow-primary/20">
                    <Store className="h-7 w-7 text-black" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-2xl text-slate-900">Sandbox Environment</h3>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                      Jump into our pre-populated evaluation suite. Perfect for exploring tiered pricing, BOM simulations, and sales reporting.
                    </p>
                  </div>
                  <Button 
                    onClick={handleDemoLogin} 
                    disabled={isLoggingIn}
                    className="w-full h-16 text-sm font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-primary/30 bg-primary hover:bg-primary/90 text-black border-none"
                  >
                    {isLoggingIn ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Sparkles className="h-5 w-5 mr-2" />}
                    Enter Demo Workspace
                  </Button>
                </div>
                <div className="flex items-center gap-4 px-2">
                  <div className="h-px flex-1 bg-slate-100" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Authorized Access Only</span>
                  <div className="h-px flex-1 bg-slate-100" />
                </div>
              </TabsContent>

              <TabsContent value="cheesy" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-8">
                  <div className="space-y-2">
                     <h3 className="font-bold text-2xl text-slate-900">Enterprise Console</h3>
                     <p className="text-sm text-slate-500 font-medium">Secure sign-in for the active Cheesy Bites production database.</p>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Identity Email</Label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <Input type="email" placeholder="admin@cheesybites.com" className="pl-12 h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all text-sm font-bold" value={email} onChange={(e) => setEmail(e.target.value)} required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Secure Password</Label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <Input type="password" placeholder="••••••••" className="pl-12 h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all text-sm font-bold" value={password} onChange={(e) => setPassword(e.target.value)} required />
                      </div>
                    </div>
                    <Button type="submit" className="w-full h-16 text-sm font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-secondary/20 bg-secondary hover:bg-secondary/90" disabled={isLoggingIn}>
                      {isLoggingIn ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <LogIn className="h-5 w-5 mr-2" />}
                      Authenticate
                    </Button>
                    
                    <div className="flex items-center gap-4 pt-8">
                      <div className="h-px flex-1 bg-slate-100" />
                      <Button variant="ghost" type="button" onClick={handleInitializeAdmin} className="text-[9px] text-slate-400 uppercase font-black tracking-widest hover:text-primary hover:bg-transparent">
                        <Key className="h-3 w-3 mr-2" /> Initial Setup Mode
                      </Button>
                      <div className="h-px flex-1 bg-slate-100" />
                    </div>
                  </form>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      {/* Footer Branding for Mobile */}
      <div className="lg:hidden mt-8 text-center space-y-4">
         <div className="flex items-center justify-center gap-3">
           <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center p-1">
             <UtensilsCrossed className="h-5 w-5 text-black" />
           </div>
           <span className="text-lg font-black font-headline tracking-tighter uppercase">Cheesy Bites</span>
         </div>
         <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">© 2024 Enterprise Edition</p>
      </div>
    </div>
  )
}
