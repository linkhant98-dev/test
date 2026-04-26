import type {Metadata} from 'next';
import './globals.css';
import {SidebarProvider, SidebarTrigger} from '@/components/ui/sidebar';
import {AppSidebar} from '@/components/layout/app-sidebar';
import {LanguageProvider} from '@/context/language-context';
import {FirebaseClientProvider} from '@/firebase/client-provider';
import {Toaster} from '@/components/ui/toaster';
import {ThemeProvider} from '@/components/theme-provider';

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
                    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:px-6">
                      <SidebarTrigger />
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
