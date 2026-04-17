import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard, BookOpen, Target, Route, MessageSquare,
  LogOut, ChevronLeft, ChevronRight, Brain, Shield, Menu,
  GraduationCap, FlaskConical, BarChart3, UserCog
} from 'lucide-react';
import { cn } from '@/lib/utils';

const studentNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/learning-path', icon: Route, label: 'Learning Path' },
  { to: '/skill-gap', icon: Target, label: 'Skill Gap' },
  { to: '/courses', icon: BookOpen, label: 'Courses' },
  { to: '/advisor', icon: MessageSquare, label: 'AI Advisor' },
  { to: '/quizzes', icon: GraduationCap, label: 'Assessments' },
  { to: '/projects', icon: FlaskConical, label: 'Case Studies' },
  { to: '/insights', icon: BarChart3, label: 'Insights' },
  { to: '/profile', icon: UserCog, label: 'Profile' },
];

const adminNav = [
  { to: '/admin', icon: Shield, label: 'Admin Panel' },
];

export default function Layout({ children }: { children: ReactNode }) {
  const { user, signOut, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [...studentNav, ...(isAdmin ? adminNav : [])];

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-background/80 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-60",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo */}
        <div className="flex items-center gap-2 p-4 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-sm font-bold text-foreground tracking-tight">NeuroLearn</h1>
              <p className="text-[10px] text-muted-foreground font-mono">AI • INDUSTRIAL</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all",
                location.pathname === item.to
                  ? "bg-primary/10 text-primary glow-border"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-2 border-t border-border space-y-1">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all w-full"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground hover:text-foreground transition-all w-full"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            {!collapsed && <span className="text-xs">Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-3 p-4 border-b border-border">
          <button onClick={() => setMobileOpen(true)}>
            <Menu className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            <span className="font-bold text-sm">NeuroLearn</span>
          </div>
        </div>
        <div className="p-4 lg:p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
