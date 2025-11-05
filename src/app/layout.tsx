import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { QueryProvider } from '@/shared/lib/providers/QueryProvider';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Community Hub',
  description: 'Kulüp yönetim ve topluluk platformu',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <QueryProvider>
          {children}
          <Toaster position="top-right" richColors />
        </QueryProvider>
      </body>
    </html>
  );
}