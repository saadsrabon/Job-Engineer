import type { Metadata } from 'next';
import '@jobos/ui/globals.css';

export const metadata: Metadata = {
  title: 'JobOS Docs',
  description: 'JobOS documentation',
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased">{children}</body>
    </html>
  );
}
