"use client";
import './globals.css'
import { Inter } from 'next/font/google'
import { ThemeProvider } from './providers'
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { ErrorProvider } from '@/hooks/useErrorContext';
// If you are using 'sonner' or another toast library, import Toaster from there instead:
//import { Toaster } from 'sonner';
// Or, if you have a custom Toaster component, ensure it is exported as a React component:
import { Toaster } from '@/components/ui/toaster';
//! added by niranjan for theme toggle
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      aria-label="Toggle Theme"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="fixed top-2 right-4 z-50 p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white shadow-md"
      type="button"
    >
      {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
    </button>
  );
}

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
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorBoundary>
            <ErrorProvider>
              <header className="flex justify-between items-center px-4 py-2 border-b border-border bg-card">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-orange-500">GenAI Test Suite</h1>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider border-l border-muted pl-2">
                    Agent Testing Framework - Community Edition
                  </span>
                  <ThemeToggle />
                  <Toaster />
                </div>
              </header>

              <main className="flex min-h-screen flex-col">
                {children}
              </main>
              <footer className="flex justify-center items-center px-4 py-2 border-t border-border bg-card text-sm text-muted-foreground">
                <span>© 2025 GenAI Test Suite. All rights reserved.</span>
              </footer>
            </ErrorProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}