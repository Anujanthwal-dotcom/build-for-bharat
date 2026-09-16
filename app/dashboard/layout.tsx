import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { BrainCircuit } from 'lucide-react';
import OnboardingTour from '@/components/onboarding-tour';
import { SignOutButton } from '@/components/auth/sign-out-button';
import { SidebarNav } from '@/components/dashboard/sidebar-nav';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/");
  }

  const name = session.user.name || "User";
  const email = session.user.email || "";
  const image = session.user.image || null;
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

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
          <SidebarNav />
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-white/5 bg-white/[0.01]">
          <div className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/5 transition-colors">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                alt={name}
                className="w-8 h-8 rounded-sm object-cover border border-white/10"
              />
            ) : (
              <div className="w-8 h-8 rounded-sm bg-accent/20 border border-accent/30 flex items-center justify-center text-accent font-mono text-xs">
                {initials || "U"}
              </div>
            )}
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-white/90 truncate">{name}</p>
              <p className="text-xs text-muted truncate">{email}</p>
            </div>
            <SignOutButton />
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