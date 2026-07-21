'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Library,
  MessageSquare,
  Mail,
  BarChart3,
  Bell,
  Shield,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { cn } from '@jobos/ui';
import { Button } from '@jobos/ui';
import { useUiStore } from '@/lib/store';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/career', label: 'Career Library', icon: Library },
  { href: '/dashboard/resumes', label: 'Resumes', icon: FileText },
  { href: '/dashboard/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/dashboard/interviews', label: 'Interviews', icon: MessageSquare },
  { href: '/dashboard/email', label: 'Email', icon: Mail },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/reminders', label: 'Reminders', icon: Bell },
  { href: '/dashboard/admin', label: 'Admin', icon: Shield },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useUiStore();

  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r border-border bg-sidebar transition-all duration-200',
        sidebarOpen ? 'w-64' : 'w-16',
      )}
    >
      <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4">
        {sidebarOpen && (
          <Link href="/dashboard" className="text-lg font-semibold tracking-tight">
            JobOS
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {sidebarOpen && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {sidebarOpen && (
        <div className="border-t border-sidebar-border p-4 text-xs text-muted-foreground">
          JobOS v0.1
        </div>
      )}
    </aside>
  );
}
