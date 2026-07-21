import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@jobos/ui/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'JobOS — The Operating System for Your Career',
  description: 'Job searching shouldn\'t feel like a second full-time job.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
