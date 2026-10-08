import './globals.css';
import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import { AuthProvider } from '@/lib/auth/context';
import { BusinessProvider } from '@/lib/auth/business-context';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

// Display face — a clean grotesque carries every headline, page title and
// stat number. One sans family, two cuts: display for voice, Inter for UI.
const display = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'BAS — Business Automation System',
    template: '%s · BAS',
  },
  description: 'AI-powered business automation. Handle customer conversations, orders, and bookings automatically.',
  keywords: ['business automation', 'AI assistant', 'customer chat', 'workflow automation'],
  openGraph: {
    title: 'BAS — Business Automation System',
    description: 'AI-powered business automation. Handle customer conversations, orders, and bookings automatically.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${display.variable}`}>
      <body className={`${inter.variable} ${display.variable} ${inter.className} antialiased`}>
        <AuthProvider>
          <BusinessProvider>
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                classNames: {
                  toast: 'surface-raised rounded-md border-border text-sm font-medium',
                  title: 'text-foreground',
                  description: 'text-muted-foreground',
                },
              }}
            />
          </BusinessProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
