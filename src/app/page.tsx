import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Briefcase, Award, Plane, Building2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <header className="absolute top-0 left-0 w-full p-8">
         <div className="flex items-center gap-4">
            <Building2 className="h-10 w-10 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-primary">ILCDB Management System</h1>
              <p className="text-muted-foreground">Welcome. Please select a module to continue.</p>
            </div>
          </div>
      </header>
      <main className="w-full max-w-4xl px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="items-center text-center">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                <Briefcase className="h-10 w-10 text-primary" />
              </div>
              <CardTitle>Procurement</CardTitle>
              <CardDescription>Manage procurement of supplies and services.</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild className="w-full">
                <Link href="/procurement">Open Module</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
             <CardHeader className="items-center text-center">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                <Award className="h-10 w-10 text-primary" />
              </div>
              <CardTitle>Honoraria</CardTitle>
              <CardDescription>Process payments for professional fees.</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild className="w-full">
                <Link href="/honoraria">Open Module</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="items-center text-center">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                <Plane className="h-10 w-10 text-primary" />
              </div>
              <CardTitle>Travel Vouchers</CardTitle>
              <CardDescription>Handle travel expense claims and reimbursements.</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
               <Button asChild className="w-full">
                <Link href="/travel-voucher">Open Module</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
