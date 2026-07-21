import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Inter } from 'next/font/google';
import '@jobos/ui/globals.css';
import 'lenis/dist/lenis.css';
import './landing.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'JobOS — The Operating System for Your Career',
  description: "Job searching shouldn't feel like a second full-time job.",
};

export const dynamic = 'force-dynamic';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <ClerkProvider
          signInUrl="http://localhost:3000/sign-in"
          signUpUrl="http://localhost:3000/sign-up"
          afterSignInUrl="http://localhost:3000/dashboard"
          afterSignUpUrl="http://localhost:3000/onboarding"
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
