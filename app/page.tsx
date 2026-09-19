import Link from 'next/link';
import { ArrowRight, BrainCircuit } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { SignInButton } from '@/components/auth/sign-in-button';
import { GuestButton } from '@/components/auth/guest-button';

export default async function LandingPage() {
  const session = await getServerSession(authOptions);

  return (
    <main className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-background dot-grid mesh-bg">
      {/* Background Animated Graph Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20 flex justify-center items-center">
        <div className="w-[800px] h-[600px] border border-white/5 rounded-full absolute animate-[spin_40s_linear_infinite]" />
        <div className="w-[600px] h-[400px] border border-white/10 rounded-full absolute animate-[spin_30s_linear_infinite_reverse]" />
        <div className="w-16 h-16 bg-white/5 border border-white/20 rounded-md absolute top-1/4 left-1/4 backdrop-blur-md animate-[pulse_4s_ease-in-out_infinite]" />
        <div className="w-24 h-12 bg-white/5 border border-white/20 rounded-md absolute bottom-1/4 right-1/4 backdrop-blur-md animate-[pulse_5s_ease-in-out_infinite_1s]" />
      </div>

      <div className="z-10 flex flex-col items-center animate-fade-in-up">
        {/* Brand */}
        <div className="mb-6 flex items-center gap-2 px-3 py-1.5 glass rounded-md">
          <BrainCircuit className="w-5 h-5 text-accent" />
          <span className="font-mono text-sm tracking-tight text-accent">MindFlow</span>
        </div>

        {/* Hero Card */}
        <div className="glass p-8 md:p-12 rounded-lg max-w-2xl text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white leading-tight">
            Turn raw documentation into <br className="hidden md:block" />
            <span className="text-accent font-mono">visual mindmaps.</span>
          </h1>
          <p className="text-muted text-base md:text-lg max-w-lg mx-auto leading-relaxed">
            Instantly process PDFs, links, and notes into strictly structured, aesthetic mental models. Built for the modern technical creator.
          </p>
          
          <div className="pt-4 flex flex-col items-center gap-3 w-full max-w-xs mx-auto">
            {session?.user ? (
              <Link 
                href="/dashboard"
                className="group relative w-full inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 transition-all text-white font-medium px-6 py-3 rounded-md overflow-hidden"
              >
                <div className="absolute inset-0 bg-accent/10 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative flex items-center gap-2">
                  Continue to Dashboard
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            ) : (
              <>
                <GuestButton className="w-full" />
                <div className="flex items-center gap-3 w-full my-1">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-[11px] font-mono text-muted uppercase">or</span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>
                <SignInButton className="w-full" />
              </>
            )}
            <p className="text-muted text-xs font-mono text-center">
              {session?.user 
                ? 'Welcome back — your mindmaps are synced.' 
                : 'Guest mode creates a temporary session. No login required.'}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}