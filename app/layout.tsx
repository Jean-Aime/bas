import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/lib/auth/context';
import { BusinessProvider } from '@/lib/auth/business-context';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { DemoBanner } from '@/components/demo/demo-banner';

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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider>
            <BusinessProvider>
              {children}
              <Toaster />
              <DemoBanner />
            </BusinessProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
