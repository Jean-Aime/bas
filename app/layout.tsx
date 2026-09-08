import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/lib/auth/context';
import { BusinessProvider } from '@/lib/auth/business-context';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BAS — Business Automation System',
  description: 'Automate customer and operational processes while continuing to use your existing systems.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <BusinessProvider>
            {children}
            <Toaster />
          </BusinessProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
