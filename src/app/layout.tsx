import './globals.css'
import { Inter } from 'next/font/google'
import { ThemeProvider } from './providers'
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { ErrorProvider } from '@/hooks/useErrorContext';
// If you are using 'sonner' or another toast library, import Toaster from there instead:
//import { Toaster } from 'sonner';
// Or, if you have a custom Toaster component, ensure it is exported as a React component:
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorBoundary>
            <ErrorProvider>
              <header className="flex justify-between items-center px-4 py-2 border-b border-border bg-card">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-orange-500">NotHotDog</h1>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider border-l border-muted pl-2">
                    Agent Testing Framework - Community Edition
                  </span>
                  <Toaster />
                </div>
              </header>

              <main className="flex min-h-screen flex-col">
                {children}
              </main>
              <footer className="flex justify-center items-center px-4 py-2 border-t border-border bg-card text-sm text-muted-foreground">
                <span>© 2024 NotHotDog. All rights reserved.</span>
              </footer>
            </ErrorProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}