"use client"

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Briefcase, PlusCircle, Search, LayoutGrid } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProcurementTable } from "@/components/procurement-table";
import { CreateProcurementDialog } from "@/components/create-procurement-dialog";
import { getProcurements, deleteProcurement } from "@/lib/data";
import type { Procurement } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function Header() {
  return (
    <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-4">
            <Briefcase className="h-8 w-8" />
            <h1 className="text-2xl font-bold font-headline">ILCDB Procurement System</h1>
        </div>
        <Button asChild variant="secondary">
            <Link href="/">
                <LayoutGrid className="mr-2 h-4 w-4" />
                Main Menu
            </Link>
        </Button>
      </div>
    </header>
  );
}

export function Dashboard() {
  const [procurements, setProcurements] = useState<Procurement[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [procurementToEdit, setProcurementToEdit] = useState<Procurement | null>(null);
  const { toast } = useToast();

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
  
  const handleProcurementUpdated = (updatedProcurement: Procurement) => {
    setProcurements(prev => prev.map(p => p.id === updatedProcurement.id ? updatedProcurement : p));
    setProcurementToEdit(null);
  };

  const handleProcurementDelete = async (id: string) => {
    try {
      await deleteProcurement(id);
      setProcurements(prev => prev.filter(p => p.id !== id));
      toast({ title: "Success", description: "Procurement has been deleted." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete procurement.", variant: "destructive" });
    }
  };

  const openEditDialog = (procurement: Procurement) => {
    setProcurementToEdit(procurement);
  };

  const filteredProcurements = useMemo(() => {
    if (!searchTerm) return procurements;
    return procurements.filter(p =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.prNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [procurements, searchTerm]);

  const activeProcurements = useMemo(() => filteredProcurements.filter(p => p.status === 'active'), [filteredProcurements]);
  const completedProcurements = useMemo(() => filteredProcurements.filter(p => p.status === 'completed'), [filteredProcurements]);

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
              <CreateProcurementDialog
                onProcurementCreated={handleProcurementCreated}
                onProcurementUpdated={handleProcurementUpdated}
                procurementToEdit={procurementToEdit}
                onOpenChange={(open) => {
                    if (!open) {
                        setProcurementToEdit(null);
                    }
                }}
              >
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create New
                </Button>
              </CreateProcurementDialog>
            </div>
          </div>

          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:w-[400px]">
              <TabsTrigger value="active">Active Procurements</TabsTrigger>
              <TabsTrigger value="completed">Completed Procurements</TabsTrigger>
            </TabsList>
            <TabsContent value="active">
              {loading ? <TableSkeleton /> : <ProcurementTable procurements={activeProcurements} onEdit={openEditDialog} onDelete={handleProcurementDelete} />}
            </TabsContent>
            <TabsContent value="completed">
              {loading ? <TableSkeleton /> : <ProcurementTable procurements={completedProcurements} onEdit={openEditDialog} onDelete={handleProcurementDelete} />}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

function TableSkeleton() {
    return (
        <div className="rounded-md border mt-4">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="w-[150px]"><Skeleton className="h-5 w-24" /></TableHead>
                        <TableHead><Skeleton className="h-5 w-32" /></TableHead>
                        <TableHead className="w-[180px]"><Skeleton className="h-5 w-28" /></TableHead>
                        <TableHead className="w-[150px]"><Skeleton className="h-5 w-20" /></TableHead>
                        <TableHead className="w-[200px]"><Skeleton className="h-5 w-40" /></TableHead>
                        <TableHead className="w-[100px] text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {[...Array(4)].map((_, i) => (
                        <TableRow key={i} className="border-none">
                            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                            <TableCell><div className="space-y-1"><Skeleton className="h-2 w-32" /><Skeleton className="h-3 w-24" /></div></TableCell>
                            <TableCell>
                                <div className="flex justify-end gap-2">
                                    <Skeleton className="h-8 w-8" />
                                    <Skeleton className="h-8 w-8" />
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
