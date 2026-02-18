import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';

export const metadata: Metadata = {
  title: 'ToyShare — обмін дитячими іграшками',
  description: 'Платформа для обміну, дарування та продажу дитячих іграшок та речей',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <LanguageProvider>
          <AuthProvider>{children}</AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
