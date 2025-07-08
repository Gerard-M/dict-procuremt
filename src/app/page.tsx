'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Briefcase, Award, Plane, Building2, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen w-full bg-background p-4 md:p-8 subtle-dot-pattern"
    >
      <header className="text-center mb-12 md:mb-16">
        <div className="inline-flex items-center gap-4 mb-4 text-primary">
          <Building2 className="h-10 w-10 md:h-12 md:w-12" />
          <h1 className="text-4xl md:text-5xl font-bold text-primary tracking-tight">
            ILCDB Management System
          </h1>
        </div>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Streamlining financial processes with efficiency and clarity. Choose a module to begin.
        </p>
      </header>
      
      <main className="w-full max-w-5xl px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <Card className="group hover:shadow-xl transition-all duration-300 hover:bg-primary">
            <CardHeader className="items-center text-center">
              <div className="p-4 bg-primary/10 rounded-full mb-4 text-primary group-hover:bg-white/20 group-hover:text-white transition-colors duration-300">
                <Briefcase className="h-10 w-10" />
              </div>
              <CardTitle className="text-foreground text-2xl group-hover:text-white transition-colors duration-300">Procurement</CardTitle>
              <CardDescription className="text-muted-foreground group-hover:text-primary-foreground/80 transition-colors duration-300">Manage procurement of supplies and services.</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild className="group/button w-full bg-primary text-primary-foreground hover:bg-primary/90 group-hover:bg-white group-hover:text-primary group-hover:hover:bg-gray-200 transition-colors duration-300">
                <Link href="/procurement">
                  Open Module <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/button:translate-x-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 hover:bg-primary">
             <CardHeader className="items-center text-center">
              <div className="p-4 bg-primary/10 rounded-full mb-4 text-primary group-hover:bg-white/20 group-hover:text-white transition-colors duration-300">
                <Award className="h-10 w-10" />
              </div>
              <CardTitle className="text-foreground text-2xl group-hover:text-white transition-colors duration-300">Honoraria</CardTitle>
              <CardDescription className="text-muted-foreground group-hover:text-primary-foreground/80 transition-colors duration-300">Process payments for professional fees.</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
               <Button asChild className="group/button w-full bg-primary text-primary-foreground hover:bg-primary/90 group-hover:bg-white group-hover:text-primary group-hover:hover:bg-gray-200 transition-colors duration-300">
                <Link href="/honoraria">
                  Open Module <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/button:translate-x-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 hover:bg-primary">
            <CardHeader className="items-center text-center">
              <div className="p-4 bg-primary/10 rounded-full mb-4 text-primary group-hover:bg-white/20 group-hover:text-white transition-colors duration-300">
                <Plane className="h-10 w-10" />
              </div>
              <CardTitle className="text-foreground text-2xl group-hover:text-white transition-colors duration-300">Travel Vouchers</CardTitle>
              <CardDescription className="text-muted-foreground group-hover:text-primary-foreground/80 transition-colors duration-300">Handle travel expense claims and reimbursements.</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
               <Button asChild className="group/button w-full bg-primary text-primary-foreground hover:bg-primary/90 group-hover:bg-white group-hover:text-primary group-hover:hover:bg-gray-200 transition-colors duration-300">
                <Link href="/travel-voucher">
                  Open Module <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/button:translate-x-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <footer className="absolute bottom-4 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} ILCDB. All rights reserved.</p>
      </footer>
    </div>
  );
}
