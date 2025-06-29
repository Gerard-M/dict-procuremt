"use client"

import { useState, useMemo, useEffect } from "react";
import { Briefcase, PlusCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProcurementTable } from "@/components/procurement-table";
import { CreateProcurementDialog } from "@/components/create-procurement-dialog";
import { getProcurements } from "@/lib/data";
import type { Procurement } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

function Header() {
  return (
    <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex items-center gap-4 p-4">
        <Briefcase className="h-8 w-8" />
        <h1 className="text-2xl font-bold font-headline">ProcureFlow</h1>
      </div>
    </header>
  );
}

export function Dashboard() {
  const [procurements, setProcurements] = useState<Procurement[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProcurements() {
      setLoading(true);
      const data = await getProcurements();
      setProcurements(data);
      setLoading(false);
    }
    loadProcurements();
  }, []);

  const handleProcurementCreated = (newProcurement: Procurement) => {
    setProcurements(prev => [newProcurement, ...prev]);
  };

  const filteredProcurements = useMemo(() => {
    if (!searchTerm) return procurements;
    return procurements.filter(p =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.prNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [procurements, searchTerm]);

  const activeProcurements = useMemo(() => filteredProcurements.filter(p => p.status === 'active'), [filteredProcurements]);
  const archivedProcurements = useMemo(() => filteredProcurements.filter(p => p.status === 'archived'), [filteredProcurements]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 p-4 sm:p-6 md:p-8 container mx-auto">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-3xl font-bold font-headline text-primary">Procurement Dashboard</h2>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search by title or PR..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <CreateProcurementDialog onProcurementCreated={handleProcurementCreated} />
            </div>
          </div>

          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:w-[400px]">
              <TabsTrigger value="active">Active Procurements</TabsTrigger>
              <TabsTrigger value="archived">Archived Procurements</TabsTrigger>
            </TabsList>
            <TabsContent value="active">
              {loading ? <TableSkeleton /> : <ProcurementTable procurements={activeProcurements} />}
            </TabsContent>
            <TabsContent value="archived">
              {loading ? <TableSkeleton /> : <ProcurementTable procurements={archivedProcurements} />}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

function TableSkeleton() {
    return (
        <div className="space-y-4 mt-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
        </div>
    )
}
