'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Briefcase, Award, Plane, Building2, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function Home() {
  
  useEffect(() => {
    document.documentElement.classList.add('dark');
    const handleMouseMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.documentElement.classList.remove('dark');
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const cardClassName = "bg-black/20 border border-white/10 shadow-xl backdrop-blur-lg rounded-2xl transition-all duration-300 hover:border-white/20 hover:-translate-y-1 group/card";

  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-screen w-full overflow-hidden bg-background text-foreground p-4 md:p-8 modern-bg"
    >
      <div className="pointer-events-none fixed inset-0 radial-glow z-10" />

      <header className="text-center mb-12 md:mb-16 z-20">
        <div className="inline-flex items-center gap-4 mb-4">
          <Building2 className="h-10 w-10 md:h-12 md:w-12 text-primary-foreground" />
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground tracking-tight">
            ILCDB Management System
          </h1>
        </div>
        <p className="text-lg md:text-xl text-primary-foreground/70 max-w-2xl mx-auto">
          Streamlining financial processes with efficiency and clarity. Choose a module to begin.
        </p>
      </header>
      
      <main className="w-full max-w-5xl px-4 z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Procurement Card */}
          <div className="relative">
             <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl blur opacity-25 group-hover/card:opacity-60 transition duration-1000 group-hover/card:duration-200"></div>
            <Card className={cn("relative", cardClassName)}>
              <CardHeader className="items-center text-center">
                <div className="p-4 bg-white/10 rounded-full mb-4 border border-white/20">
                  <Briefcase className="h-10 w-10 text-primary-foreground" />
                </div>
                <CardTitle className="text-primary-foreground text-2xl">Procurement</CardTitle>
                <CardDescription className="text-primary-foreground/60">Manage procurement of supplies and services.</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button asChild variant="secondary" className="group w-full bg-white/10 text-white hover:bg-white/20">
                  <Link href="/procurement">
                    Open Module <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Honoraria Card */}
           <div className="relative">
             <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-2xl blur opacity-25 group-hover/card:opacity-60 transition duration-1000 group-hover/card:duration-200"></div>
            <Card className={cn("relative", cardClassName)}>
               <CardHeader className="items-center text-center">
                <div className="p-4 bg-white/10 rounded-full mb-4 border border-white/20">
                  <Award className="h-10 w-10 text-primary-foreground" />
                </div>
                <CardTitle className="text-primary-foreground text-2xl">Honoraria</CardTitle>
                <CardDescription className="text-primary-foreground/60">Process payments for professional fees.</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                 <Button asChild variant="secondary" className="group w-full bg-white/10 text-white hover:bg-white/20">
                  <Link href="/honoraria">
                    Open Module <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
           </div>

          {/* Travel Vouchers Card */}
           <div className="relative">
             <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-pink-600 rounded-2xl blur opacity-25 group-hover/card:opacity-60 transition duration-1000 group-hover/card:duration-200"></div>
            <Card className={cn("relative", cardClassName)}>
              <CardHeader className="items-center text-center">
                <div className="p-4 bg-white/10 rounded-full mb-4 border border-white/20">
                  <Plane className="h-10 w-10 text-primary-foreground" />
                </div>
                <CardTitle className="text-primary-foreground text-2xl">Travel Vouchers</CardTitle>
                <CardDescription className="text-primary-foreground/60">Handle travel expense claims and reimbursements.</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                 <Button asChild variant="secondary" className="group w-full bg-white/10 text-white hover:bg-white/20">
                  <Link href="/travel-voucher">
                    Open Module <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <footer className="absolute bottom-4 text-center text-primary-foreground/50 text-sm z-20">
        <p>&copy; {new Date().getFullYear()} ILCDB. All rights reserved.</p>
      </footer>
    </div>
  );
}
