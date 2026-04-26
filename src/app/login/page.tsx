"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Lock, Mail, Loader2, ShieldCheck, ArrowRight, UserPlus, LogIn, Key } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useAuth, useUser, useFirestore } from "@/firebase"
import { initiateAnonymousSignIn, initiateEmailSignIn, initiateEmailSignUp } from "@/firebase/non-blocking-login"
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!auth || !email || !password) return
    
    setIsLoggingIn(true)
    if (mode === 'login') {
      initiateEmailSignIn(auth, email, password)
    } else {
      initiateEmailSignUp(auth, email, password)
    }
    
    setTimeout(() => setIsLoggingIn(false), 3000)
  }

  const handleDemoLogin = () => {
    if (!auth) return
    setIsLoggingIn(true)
    initiateAnonymousSignIn(auth)
    setTimeout(() => setIsLoggingIn(false), 3000)
  }

  const handleInitializeAdmin = async () => {
    if (!auth || !db) return
    setIsLoggingIn(true)
    try {
      // Firebase requires at least 6 characters, using admin123
      const cred = await createUserWithEmailAndPassword(auth, "admin@gmail.com", "admin123")
      
      // Signify admin role by creating doc in roles_admin
      await setDoc(doc(db, "roles_admin", cred.user.uid), {
        email: "admin@gmail.com",
        role: "Administrator",
        initializedAt: new Date().toISOString()
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
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg overflow-hidden p-1"
              >
                {settings?.companyLogoUrl ? (
                   <img src={settings.companyLogoUrl} alt="Logo" className="rounded-lg object-contain h-10 w-10" />
                ) : (
                  <Image 
                    src="https://picsum.photos/seed/cheese-logo/200/200"
                    alt="Logo"
                    width={48}
                    height={48}
                    className="rounded-lg object-contain"
                  />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black leading-none font-headline tracking-tighter">CHEESY</span>
                <span className="text-sm font-bold text-primary -mt-1">BITES</span>
              </div>
            </div>
            
            <h1 className="text-4xl font-bold font-headline leading-tight mb-6">
              Precision Inventory & Production Control
            </h1>
            <p className="text-secondary-foreground/80 max-w-sm">
              Streamline your snack manufacturing operations with real-time tracking, variance analysis, and automated reporting.
            </p>
          </div>

          <div className="relative z-10 flex gap-6 text-xs font-medium opacity-60">
            <span>© 2024 Cheesy Bites Co.</span>
            <span>Privacy Policy</span>
            <span>Support</span>
          </div>
        </div>

        <div className="p-8 md:p-16 flex flex-col justify-center bg-white">
          <div className="mb-8 lg:hidden flex justify-center">
             <div 
                className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-xl overflow-hidden p-1"
              >
                {settings?.companyLogoUrl ? (
                   <img src={settings.companyLogoUrl} alt="Logo" className="rounded-lg object-contain h-14 w-14" />
                ) : (
                  <Image 
                    src="https://picsum.photos/seed/cheese-logo/200/200"
                    alt="Logo"
                    width={64}
                    height={64}
                    className="rounded-lg object-contain"
                  />
                )}
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
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="admin@cheesybites.com" 
                  className="pl-10 h-12" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                {mode === 'login' && (
                  <Button variant="link" type="button" className="px-0 h-auto text-xs text-primary">Forgot password?</Button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-10 h-12" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-12 text-md font-bold" disabled={isLoggingIn}>
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
                className="text-sm font-medium"
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              >
                {mode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
              </Button>
            </div>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground font-black tracking-widest">System Access Utilities</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-primary/20 bg-primary/5 shadow-none group hover:bg-primary/10 transition-colors cursor-pointer" onClick={handleInitializeAdmin}>
                <CardContent className="p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-primary" />
                    <span className="text-xs font-black uppercase text-primary">Initialize Admin</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    Create <strong>admin@gmail.com</strong> with full role permissions.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-secondary/20 bg-secondary/5 shadow-none group hover:bg-secondary/10 transition-colors cursor-pointer" onClick={handleDemoLogin}>
                <CardContent className="p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-secondary" />
                    <span className="text-xs font-black uppercase text-secondary">Demo Mode</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-tight">
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
