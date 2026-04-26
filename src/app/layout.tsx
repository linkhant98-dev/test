import type {Metadata} from 'next';
import './globals.css';
import {SidebarProvider, SidebarTrigger} from '@/components/ui/sidebar';
import {AppSidebar} from '@/components/layout/app-sidebar';
import {LanguageProvider} from '@/context/language-context';
import {FirebaseClientProvider} from '@/firebase/client-provider';
import {Toaster} from '@/components/ui/toaster';
import {ThemeProvider} from '@/components/theme-provider';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Cheesy Bites | Inventory Control',
  description: 'Professional inventory control and production management system.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&family=Inter:wght@100..900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <ThemeProvider>
            <LanguageProvider>
              <SidebarProvider>
                <div className="flex min-h-screen w-full">
                  <AppSidebar />
                  <div className="flex flex-1 flex-col overflow-hidden">
                    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:px-6 shadow-sm">
                      <div className="flex items-center gap-4">
                        <SidebarTrigger />
                        <div className="flex items-center gap-2 md:hidden">
                           <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center p-1 shadow-sm overflow-hidden">
                              <Image 
                                src="https://picsum.photos/seed/cheese-logo/100/100"
                                alt="Logo"
                                width={32}
                                height={32}
                                className="object-contain"
                              />
                           </div>
                           <span className="text-sm font-black font-headline tracking-tighter uppercase">Cheesy Bites</span>
                        </div>
                        <div className="hidden md:flex items-center gap-2 group cursor-default">
                           <span className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] group-hover:text-primary transition-colors">Menu</span>
                        </div>
                      </div>
                      <div className="flex flex-1 items-center justify-end gap-4">
                        {/* Space for future header notifications/search */}
                      </div>
                    </header>
                    <main className="flex-1 overflow-y-auto bg-background p-4 md:p-8">
                      {children}
                    </main>
                  </div>
                </div>
              </SidebarProvider>
            </LanguageProvider>
          </ThemeProvider>
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
