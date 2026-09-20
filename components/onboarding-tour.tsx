"use client";

import { useState, useEffect } from 'react';
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowRight, Check, Sparkles, Wand2 } from 'lucide-react';
import { useUIStore } from '@/lib/store/ui-store';

export default function OnboardingTour() {
  const { isOnboardingTourOpen, completeOnboardingTour, startOnboardingTour } = useUIStore();
  const [step, setStep] = useState(1);
  const [demoText, setDemoText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const totalSteps = 4;

  useEffect(() => {
    // Check if tour was completed
    const completed = localStorage.getItem('tourCompleted');
    if (!completed) {
      startOnboardingTour();
    }
  }, [startOnboardingTour]);

  const handleFinish = () => {
    localStorage.setItem('tourCompleted', 'true');
    completeOnboardingTour();
  };

  const nextStep = () => {
    if (step === 2 && demoText.length < 10) return; // Require some input
    if (step === 3) {
      setIsGenerating(true);
      setTimeout(() => {
        setIsGenerating(false);
        setStep(4);
      }, 2000);
      return;
    }
    if (step < totalSteps) setStep(step + 1);
  };

  return (
    <Dialog.Root open={isOnboardingTourOpen} onOpenChange={(open) => !open && handleFinish()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 data-[state=open]:animate-fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-xl glass rounded-lg z-50 overflow-hidden flex flex-col data-[state=open]:animate-fade-in-up border border-accent/20">
          
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
            <div 
              className="h-full bg-accent transition-all duration-500 ease-out"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>

          <div className="p-8 flex flex-col items-center text-center">
            {step === 1 && (
              <div className="animate-fade-in space-y-6 w-full">
                <div className="w-16 h-16 rounded-full glass border border-accent/30 mx-auto flex items-center justify-center bg-accent/10">
                  <Sparkles className="w-8 h-8 text-accent" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-white mb-2 tracking-tight">Welcome to MindFlow</h2>
                  <p className="text-muted text-sm leading-relaxed max-w-md mx-auto">
                    The tool built for technical creators to instantly distill complex documentation, messy notes, and PDFs into beautiful mental models.
                  </p>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="animate-fade-in space-y-6 w-full text-left">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-1">Step 1: The Dump</h2>
                  <p className="text-muted text-sm">Paste some raw notes below to see how the engine structures it.</p>
                </div>
                <div className="relative">
                  <textarea 
                    value={demoText}
                    onChange={(e) => setDemoText(e.target.value)}
                    className="w-full h-32 bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white/90 font-mono placeholder:text-muted/50 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 resize-none"
                    placeholder="e.g., React Server Components allow you to render components on the server..."
                  />
                  <button 
                    onClick={() => setDemoText("React Server Components allow you to render components on the server, reducing the JavaScript bundle sent to the client. This improves performance and SEO. They run ahead of time and can access backend resources directly.")}
                    className="absolute bottom-3 right-3 text-xs bg-white/10 hover:bg-white/15 px-2 py-1 rounded text-white transition-colors"
                  >
                    Load Example
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-fade-in space-y-6 w-full text-center">
                <div className="w-16 h-16 rounded-full glass border border-accent/30 mx-auto flex items-center justify-center bg-accent/10">
                  <Wand2 className={`w-8 h-8 text-accent ${isGenerating ? 'animate-pulse-glow' : ''}`} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">
                    {isGenerating ? 'Synthesizing Knowledge...' : 'Step 2: The Generation'}
                  </h2>
                  <p className="text-muted text-sm">
                    {isGenerating ? 'Analyzing concepts and building hierarchical relationships.' : 'Click next to extract nodes and build the graph.'}
                  </p>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="animate-fade-in space-y-6 w-full">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-1">The Result</h2>
                  <p className="text-muted text-sm mb-4">A perfectly structured, aesthetic canvas.</p>
                </div>
                <div className="w-full h-48 bg-[#09090b] rounded-lg border border-white/10 relative overflow-hidden dot-grid flex items-center justify-center p-4">
                  {/* Mock graph preview */}
                  <div className="absolute flex gap-8 items-center">
                    <div className="glass px-3 py-1.5 rounded text-xs font-mono text-accent border border-accent/30">React Server Components</div>
                    <div className="h-px w-8 bg-white/20 relative">
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white/40" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="glass px-3 py-1.5 rounded text-[10px] font-mono text-muted">Performance</div>
                      <div className="glass px-3 py-1.5 rounded text-[10px] font-mono text-muted">Backend Access</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-between w-full items-center">
              <button 
                onClick={handleFinish}
                className="text-xs text-muted hover:text-white transition-colors uppercase tracking-wider font-mono"
              >
                Skip Tour
              </button>
              
              <button 
                onClick={step === totalSteps ? handleFinish : nextStep}
                disabled={isGenerating || (step === 2 && demoText.length < 10)}
                className="flex items-center gap-2 bg-accent text-black font-medium px-5 py-2 rounded-md hover:bg-accent/90 transition-all text-sm disabled:opacity-50 shadow-[0_0_15px_rgba(226,224,217,0.2)]"
              >
                {step === totalSteps ? (
                  <>Finish <Check className="w-4 h-4" /></>
                ) : (
                  <>Next <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </div>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
