import Link from 'next/link';
import { BrainCircuit, FolderGit2, Blocks, BookOpen, Settings, LogOut } from 'lucide-react';
import OnboardingTour from '@/components/onboarding-tour';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden text-foreground">
      {/* Sidebar / Left Rail */}
      <aside className="w-64 border-r border-white/5 bg-black/20 backdrop-blur-xl flex flex-col justify-between flex-shrink-0">
        <div>
          {/* Logo Area */}
          <div className="h-16 flex items-center px-6 border-b border-white/5 bg-white/[0.02]">
            <Link href="/" className="flex items-center gap-2 group">
              <BrainCircuit className="w-5 h-5 text-accent transition-transform group-hover:scale-110" />
              <span className="font-mono text-sm tracking-tight text-white/90">MindFlow</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-1">
            <NavItem icon={FolderGit2} label="Projects" active />
            <NavItem icon={Blocks} label="Templates" />
            <NavItem icon={BookOpen} label="Documentation" />
            <NavItem icon={Settings} label="Settings" />
          </nav>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-white/5 bg-white/[0.01]">
          <div className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/5 transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-sm bg-accent/20 border border-accent/30 flex items-center justify-center text-accent font-mono text-xs">
              U
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-white/90 truncate">User Name</p>
              <p className="text-xs text-muted truncate">user@example.com</p>
            </div>
            <LogOut className="w-4 h-4 text-muted hover:text-white transition-colors" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative h-full min-w-0">
        {children}
      </main>
      
      <OnboardingTour />
    </div>
  );
}

function NavItem({ icon: Icon, label, active = false }: { icon: any, label: string, active?: boolean }) {
  return (
    <Link
      href="#"
      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
        active 
          ? 'bg-white/10 text-white font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] border border-white/5' 
          : 'text-muted hover:bg-white/5 hover:text-white'
      }`}
    >
      <Icon className={`w-4 h-4 ${active ? 'text-accent' : ''}`} />
      {label}
    </Link>
  );
}
