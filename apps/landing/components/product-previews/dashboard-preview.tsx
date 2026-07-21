import { Badge, Card, CardContent, CardHeader, CardTitle } from '@jobos/ui';
import { Briefcase, FileText, Library, MessageSquare, Send, Trophy, Users } from 'lucide-react';

export function DashboardPreview() {
  const stats = [
    { label: 'Total Jobs', value: 12, icon: Briefcase },
    { label: 'Active', value: 5, icon: Send },
    { label: 'Interviews', value: 2, icon: Users },
    { label: 'Offers', value: 1, icon: Trophy },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-lg">
      <div className="flex h-10 items-center gap-2 border-b border-border bg-muted/40 px-4">
        <div className="h-3 w-3 rounded-full bg-red-500/60" />
        <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
        <div className="h-3 w-3 rounded-full bg-green-500/60" />
        <span className="ml-2 text-xs text-muted-foreground">app.jobos.dev/dashboard</span>
      </div>
      <div className="flex">
        <aside className="w-44 shrink-0 border-r border-border bg-sidebar p-3">
          <p className="mb-3 text-sm font-semibold">JobOS</p>
          <nav className="space-y-1 text-xs">
            {[
              { label: 'Dashboard', icon: Briefcase, active: true, target: 'dashboard' },
              { label: 'Career Library', icon: Library, target: 'career' },
              { label: 'Resumes', icon: FileText, target: 'resumes' },
              { label: 'Jobs', icon: Briefcase, target: 'jobs' },
              { label: 'Interviews', icon: MessageSquare, target: 'interviews' },
            ].map(({ label, icon: Icon, active, target }) => (
              <div
                key={label}
                data-nav-target={target}
                className={`flex items-center gap-2 rounded-lg px-2 py-1.5 ${
                  active ? 'bg-sidebar-accent font-medium' : 'text-muted-foreground'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </div>
            ))}
          </nav>
        </aside>
        <div className="flex-1 p-4">
          <h3 className="text-sm font-semibold">Dashboard</h3>
          <p className="text-xs text-muted-foreground">Overview of your job search pipeline.</p>
          <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
            {stats.map(({ label, value, icon: Icon }) => (
              <Card key={label} className="shadow-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-1">
                  <CardTitle className="text-[10px] font-medium text-muted-foreground">
                    {label}
                  </CardTitle>
                  <Icon className="h-3 w-3 text-muted-foreground" />
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <p className="text-lg font-bold">{value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="mt-3 shadow-none">
            <CardHeader className="p-3 pb-1">
              <CardTitle className="text-xs">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 p-3 pt-0 text-xs text-muted-foreground">
              <p>Moved Stripe → Interview</p>
              <p>Uploaded resume — parsing complete</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
