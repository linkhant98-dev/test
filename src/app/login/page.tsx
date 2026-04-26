
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Lock, Mail, Loader2, ShieldCheck, UserPlus, LogIn, Key } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
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
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  
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
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password)
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email, password)
        // Register user in the directory on signup
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
      
      // 1. Set Role
      await setDoc(doc(db, "roles_admin", cred.user.uid), {
        email: "admin@gmail.com",
        role: "Administrator",
        initializedAt: new Date().toISOString()
      })

      // 2. Set User Directory Record
      await setDoc(doc(db, "users", cred.user.uid), {
        name: "Main Administrator",
        email: "admin@gmail.com",
        role: "Administrator",
        status: "Active",
        createdAt: new Date().toISOString()
      })
      
      toast({
        title: "Admin Account Created",
        description: "Credentials: admin@gmail.com / admin123"
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
        {/* Desktop Branding Column */}
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
              <div 
                className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-xl overflow-hidden p-1 border-4 border-white/20"
              >
                {settings?.companyLogoUrl ? (
                   <img 
                    src={settings.companyLogoUrl} 
                    alt="Cheesy Bites Logo" 
                    className="rounded-xl object-contain h-full w-full" 
                    data-ai-hint="cheese logo" 
                   />
                ) : (
                  <Image 
                    src="https://picsum.photos/seed/cheesy-official/400/400"
                    alt="Cheesy Bites Logo"
                    width={64}
                    height={64}
                    className="rounded-xl object-contain"
                    data-ai-hint="cheese logo"
                  />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-black leading-none font-headline tracking-tighter uppercase">Cheesy</span>
                <span className="text-sm font-bold text-primary -mt-1 tracking-[0.2em] uppercase">Bites</span>
              </div>
            </div>
            
            <h1 className="text-4xl font-bold font-headline leading-tight mb-6">
              Precision Inventory & Production Control
            </h1>
            <p className="text-secondary-foreground/80 max-w-sm text-lg leading-relaxed">
              Streamline your snack manufacturing operations with real-time tracking, variance analysis, and automated reporting.
            </p>
          </div>

          <div className="relative z-10 flex gap-6 text-xs font-bold uppercase tracking-widest opacity-40">
            <span>© 2024 Cheesy Bites Co.</span>
            <span>Enterprise Edition</span>
          </div>
        </div>

        {/* Login Form Column */}
        <div className="p-8 md:p-16 flex flex-col justify-center bg-white">
          <div className="mb-10 lg:hidden flex flex-col items-center gap-4">
             <div 
                className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary shadow-2xl overflow-hidden p-1.5 border-4 border-white"
              >
                {settings?.companyLogoUrl ? (
                   <img 
                    src={settings.companyLogoUrl} 
                    alt="Cheesy Bites Logo" 
                    className="rounded-xl object-contain h-full w-full" 
                    data-ai-hint="cheese logo" 
                   />
                ) : (
                  <Image 
                    src="https://picsum.photos/seed/cheesy-official/400/400"
                    alt="Cheesy Bites Logo"
                    width={80}
                    height={80}
                    className="rounded-xl object-contain"
                    data-ai-hint="cheese logo"
                  />
                )}
              </div>
              <div className="text-center">
                <span className="text-2xl font-black font-headline tracking-tighter uppercase block">Cheesy Bites</span>
                <span className="text-[10px] font-bold text-muted-foreground tracking-[0.3em] uppercase">Control System</span>
              </div>
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-bold font-headline mb-2 text-foreground">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-muted-foreground">
              {mode === 'login' ? 'Log in to manage your inventory and production.' : 'Join Cheesy Bites to start managing your production.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="admin@cheesybites.com" 
                  className="pl-10 h-12 rounded-xl border-muted focus-visible:ring-primary" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Password</Label>
                {mode === 'login' && (
                  <Button variant="link" type="button" className="px-0 h-auto text-xs text-primary font-bold">Forgot password?</Button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-10 h-12 rounded-xl border-muted focus-visible:ring-primary" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-12 text-md font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20" disabled={isLoggingIn}>
              {isLoggingIn ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : mode === 'login' ? (
                <LogIn className="h-4 w-4 mr-2" />
              ) : (
                <UserPlus className="h-4 w-4 mr-2" />
              )}
              {mode === 'login' ? 'Sign In' : 'Sign Up'}
            </Button>

            <div className="text-center">
              <Button 
                variant="link" 
                type="button"
                className="text-sm font-bold text-muted-foreground"
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              >
                {mode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
              </Button>
            </div>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-white px-4 text-muted-foreground font-black tracking-[0.3em]">System Utilities</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-primary/20 bg-primary/5 shadow-none group hover:bg-primary/10 transition-colors cursor-pointer rounded-2xl" onClick={handleInitializeAdmin}>
                <CardContent className="p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-black uppercase text-primary tracking-widest">Init Admin</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-tight font-medium">
                    Create <strong>admin@gmail.com</strong> with full role permissions.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-secondary/20 bg-secondary/5 shadow-none group hover:bg-secondary/10 transition-colors cursor-pointer rounded-2xl" onClick={handleDemoLogin}>
                <CardContent className="p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-secondary" />
                    <span className="text-[10px] font-black uppercase text-secondary tracking-widest">Demo Mode</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-tight font-medium">
                    Launch anonymous session for instant exploration.
                  </p>
                </CardContent>
              </Card>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
