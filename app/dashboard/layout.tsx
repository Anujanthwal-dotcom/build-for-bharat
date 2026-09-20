import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions, isGuestEmail } from '@/lib/auth';
import { BrainCircuit, Sparkles } from 'lucide-react';
import OnboardingTour from '@/components/onboarding-tour';
import { FloatingCharacterTour } from '@/components/onboarding/floating-character-tour';
import { SignOutButton } from '@/components/auth/sign-out-button';
import { SidebarNav } from '@/components/dashboard/sidebar-nav';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/");
  }

  const isGuest = isGuestEmail(session.user.email);
  const name = session.user.name || (isGuest ? "Guest User" : "User");
  const email = isGuest ? "Temporary Session" : (session.user.email || "");
  const image = isGuest ? null : (session.user.image || null);
  const initials = isGuest
    ? "GU"
    : name
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

          {/* Guest Mode Callout */}
          {isGuest && (
            <div className="mx-4 mt-3 px-3 py-2 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
              <div className="flex items-center justify-between font-medium">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                  Guest Mode
                </span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono">
                  DEMO
                </span>
              </div>
              <p className="text-[11px] text-amber-200/70 mt-1 leading-snug">
                Data is temporary and will be cleared when you exit.
              </p>
            </div>
          )}

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
              <div className={`w-8 h-8 rounded-sm flex items-center justify-center font-mono text-xs ${
                isGuest 
                  ? "bg-amber-500/20 border border-amber-500/30 text-amber-300"
                  : "bg-accent/20 border border-accent/30 text-accent"
              }`}>
                {initials || "U"}
              </div>
            )}
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium text-white/90 truncate">{name}</p>
                {isGuest && (
                  <span className="text-[9px] font-mono px-1 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">
                    GUEST
                  </span>
                )}
              </div>
              <p className="text-xs text-muted truncate">{email}</p>
            </div>
            <SignOutButton isGuest={isGuest} />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative h-full min-w-0">
        {children}
      </main>
      
      <OnboardingTour />
      <FloatingCharacterTour />
    </div>
  );
}