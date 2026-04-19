
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Lock, Mail, Loader2, ShieldCheck, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useAuth, useUser } from "@/firebase"
import { initiateAnonymousSignIn } from "@/firebase/non-blocking-login"
import { useTranslation } from "@/context/language-context"

export default function LoginPage() {
  const router = useRouter()
  const auth = useAuth()
  const { user, isUserLoading } = useUser()
  const { t } = useTranslation()
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  useEffect(() => {
    if (user && !isUserLoading) {
      router.push("/")
    }
  }, [user, isUserLoading, router])

  const handleDemoLogin = () => {
    if (!auth) return
    setIsLoggingIn(true)
    initiateAnonymousSignIn(auth)
  }

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] p-4">
      <div className="w-full max-w-[1000px] grid grid-cols-1 md:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden border">
        <div className="hidden md:flex flex-col justify-between p-12 bg-secondary text-secondary-foreground relative overflow-hidden">
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
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg overflow-hidden p-1">
                <Image 
                  src="https://picsum.photos/seed/cheese-logo/200/200"
                  alt="Logo"
                  width={48}
                  height={48}
                  className="rounded-lg object-contain"
                  data-ai-hint="cheese logo"
                />
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

        <div className="p-8 md:p-16 flex flex-col justify-center">
          <div className="mb-8 md:hidden flex justify-center">
             <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-xl overflow-hidden p-1">
                <Image 
                  src="https://picsum.photos/seed/cheese-logo/200/200"
                  alt="Logo"
                  width={64}
                  height={64}
                  className="rounded-lg object-contain"
                  data-ai-hint="cheese logo"
                />
              </div>
          </div>

          <div className="mb-8 text-center md:text-left">
            <h2 className="text-3xl font-bold font-headline mb-2 text-foreground">Welcome Back</h2>
            <p className="text-muted-foreground">Log in to manage your inventory and production.</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="admin@cheesybites.com" className="pl-10" disabled />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                <Button variant="link" className="px-0 h-auto text-xs text-primary">Forgot password?</Button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="password" type="password" placeholder="••••••••" className="pl-10" disabled />
              </div>
            </div>

            <Button className="w-full h-12 text-md font-bold" disabled>
              Sign In
            </Button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground font-bold">Demo Mode</span>
              </div>
            </div>

            <Card className="border-primary/20 bg-primary/5 shadow-none">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-secondary mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-secondary">Demo Admin Access</h4>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Use the button below to log in as a demo administrator with full access to all features.
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={handleDemoLogin} 
                  className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 h-10 font-bold"
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <ArrowRight className="h-4 w-4 mr-2" />
                  )}
                  Login as Demo Admin
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
