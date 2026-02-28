import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import AnimatedBackground from '@/components/AnimatedBackground';

export const metadata: Metadata = {
  title: 'ToyShare — обмін дитячими іграшками',
  description: 'Платформа для обміну, дарування та продажу дитячих іграшок та речей',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk" suppressHydrationWarning>
      <body className="min-h-screen text-gray-900 dark:text-gray-100 antialiased relative selection:bg-teal-500/30">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            <AuthProvider>
              <AnimatedBackground />
              <div className="relative z-0">{children}</div>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
