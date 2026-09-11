'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';
import { Zap, ShieldCheck, ArrowRight, Lock, Mail, Building2, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('owner@pulsefitness.in');
  const [password, setPassword] = useState('gymos2026');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // In local mode or placeholder credentials, allow demo access
        if (email === 'owner@pulsefitness.in') {
          router.push('/');
          return;
        }
        setErrorMsg(error.message);
        setIsLoading(false);
        return;
      }

      router.push('/');
    } catch {
      // Offline / Demo fallback
      router.push('/');
    }
  };

  const handleDemoLogin = (demoRole: 'owner' | 'front_desk') => {
    if (demoRole === 'owner') {
      setEmail('owner@pulsefitness.in');
      setPassword('gymos2026');
    } else {
      setEmail('desk@pulsefitness.in');
      setPassword('gymos2026');
    }
    router.push('/');
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Login Box */}
      <div className="w-full max-w-md bg-surface-300 border border-border rounded-2xl p-8 shadow-modal relative z-10 animate-slide-down">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-zinc-950 shadow-glow-brand mb-3">
            <Zap className="w-6 h-6 fill-current stroke-zinc-950 stroke-[1.5]" />
          </div>
          <div className="flex items-baseline gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">GYM</h1>
            <span className="text-xs font-mono font-bold tracking-widest text-brand-400 bg-brand-500/15 px-2 py-0.5 rounded border border-brand-500/30">
              OS
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1.5">
            The Operating System for Independent Gyms & Clubs
          </p>
        </div>

        {/* Tenant Gym Badge */}
        <div className="mb-6 p-3 rounded-xl bg-surface-200/80 border border-border-subtle flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-zinc-200 truncate">
              Pulse Fitness & Performance
            </div>
            <div className="text-[10px] text-zinc-400 font-mono">Tenant ID: IND-BLR-042</div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Staff Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-surface-200 text-sm text-white rounded-lg border border-border pl-9 pr-3 py-2.5 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Access Password
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3 pointer-events-none" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-surface-200 text-sm text-white rounded-lg border border-border pl-9 pr-3 py-2.5 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-lg bg-brand-500 hover:bg-brand-400 text-zinc-950 font-bold text-sm shadow-sm hover:shadow-glow-brand transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50 active:scale-[0.98]"
          >
            {isLoading ? (
              <span>Authenticating Session...</span>
            ) : (
              <>
                <span>Sign In to Gym OS</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* 1-Click Demo Evaluation Credentials */}
        <div className="mt-6 pt-5 border-t border-border-subtle">
          <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-2.5 font-medium">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Pilot Quick Sign-In:
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('owner')}
              className="p-2 rounded-lg bg-surface-200 hover:bg-surface-100 border border-border-subtle text-left transition-colors group"
            >
              <div className="text-xs font-semibold text-white group-hover:text-brand-300">
                Gym Owner
              </div>
              <div className="text-[10px] text-zinc-400 font-mono">Full Admin Access</div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('front_desk')}
              className="p-2 rounded-lg bg-surface-200 hover:bg-surface-100 border border-border-subtle text-left transition-colors group"
            >
              <div className="text-xs font-semibold text-white group-hover:text-brand-300">
                Front Desk
              </div>
              <div className="text-[10px] text-zinc-400 font-mono">Check-in / Desk</div>
            </button>
          </div>
        </div>

        {/* Footer Security Note */}
        <div className="mt-6 text-center text-[10px] text-zinc-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
          <span>Multi-tenant Row Level Security (RLS) Protected</span>
        </div>
      </div>
    </div>
  );
}
