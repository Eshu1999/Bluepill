
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { Pill, ShieldCheck, Users } from 'lucide-react';
import { useAuth } from './auth-provider';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  React.useEffect(() => {
    if (!loading) {
      if (user && profile) {
        // If user is already logged in and has a profile, redirect them
        const homePage = profile.accountType === 'doctor' ? '/doctor/home' : '/mymedicine';
        router.replace(homePage);
      } else if (user && !profile) {
        // If user is logged in but has no profile, send to account creation
        router.replace('/create-account');
      }
    }
  }, [user, profile, loading, router]);

  // While checking auth status, show a loader
  if (loading || user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If not loading and no user, show the landing page
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="container z-40 bg-background">
        <div className="flex h-20 items-center justify-between py-6">
          <Logo />
          <nav className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push('/login')}>
              Login
            </Button>
            <Button onClick={() => router.push('/create-account')}>
              Sign Up
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="container flex flex-col items-center py-16 md:py-24 lg:py-32 text-center">
          <h1 className="text-4xl font-bold tracking-tighter md:text-6xl lg:text-7xl font-headline">
            Your Personal Medication Assistant
          </h1>
          <p className="mt-6 max-w-[700px] text-lg text-muted-foreground">
            Bluepill helps you manage your medications, track your health, and connect with your family and doctors, all in one secure place.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button size="lg" onClick={() => router.push('/create-account')}>
              Get Started for Free
            </Button>
            <Button size="lg" variant="outline" onClick={() => router.push('/login')}>
              I Already Have an Account
            </Button>
          </div>
        </section>
        <section className="container grid grid-cols-1 gap-12 md:grid-cols-3 py-16">
          <div className="flex flex-col items-center text-center">
            <Pill className="h-12 w-12 text-primary" />
            <h3 className="mt-4 text-xl font-bold">Manage Medications</h3>
            <p className="mt-2 text-muted-foreground">
              Easily add, track, and get reminders for all your prescriptions. Never miss a dose again.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <Users className="h-12 w-12 text-primary" />
            <h3 className="mt-4 text-xl font-bold">Connect with Family</h3>
            <p className="mt-2 text-muted-foreground">
              Share your medication schedule and health progress with family members to keep them in the loop.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <ShieldCheck className="h-12 w-12 text-primary" />
            <h3 className="mt-4 text-xl font-bold">Secure & Private</h3>
            <p className="mt-2 text-muted-foreground">
              Your health data is sensitive. We use top-tier security to ensure your information stays private.
            </p>
          </div>
        </section>
      </main>
      <footer className="py-6 md:px-8 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built by you with Firebase Studio.
          </p>
          <Link href="/admin/login" className="text-sm text-muted-foreground hover:text-primary">
            Admin Login
          </Link>
        </div>
      </footer>
    </div>
  );
}
