"use client"

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Plane, PlusCircle, Search, LayoutGrid } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TravelVoucherTable } from "@/components/travel-voucher-table";
import { CreateTravelVoucherDialog } from "@/components/create-travel-voucher-dialog";
import { getTravelVouchers, deleteTravelVoucher } from "@/lib/data";
import type { TravelVoucher } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function Header() {
  return (
    <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-4">
            <Plane className="h-8 w-8" />
            <h1 className="text-2xl font-bold font-headline">ILCDB Travel Voucher System</h1>
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

export function TravelVoucherDashboard() {
  const [travelVouchers, setTravelVouchers] = useState<TravelVoucher[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [voucherToEdit, setVoucherToEdit] = useState<TravelVoucher | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function loadVouchers() {
      setLoading(true);
      const data = await getTravelVouchers();
      setTravelVouchers(data);
      setLoading(false);
    }
    loadVouchers();
  }, []);

  const handleVoucherCreated = (newVoucher: TravelVoucher) => {
    setTravelVouchers(prev => [newVoucher, ...prev]);
  };
  
  const handleVoucherUpdated = (updatedVoucher: TravelVoucher) => {
    setTravelVouchers(prev => prev.map(h => h.id === updatedVoucher.id ? updatedVoucher : h));
    setVoucherToEdit(null);
  };

  const handleVoucherDelete = async (id: string) => {
    try {
      await deleteTravelVoucher(id);
      setTravelVouchers(prev => prev.filter(h => h.id !== id));
      toast({ title: "Success", description: "Travel voucher record has been deleted." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete travel voucher record.", variant: "destructive" });
    }
  };

  const openEditDialog = (voucher: TravelVoucher) => {
    setVoucherToEdit(voucher);
  };

  const filteredVouchers = useMemo(() => {
    if (!searchTerm) return travelVouchers;
    return travelVouchers.filter(h =>
      h.activityTitle.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [travelVouchers, searchTerm]);

  const activeVouchers = useMemo(() => filteredVouchers.filter(p => p.status === 'active'), [filteredVouchers]);
  const archivedVouchers = useMemo(() => filteredVouchers.filter(p => p.status === 'archived'), [filteredVouchers]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 p-4 sm:p-6 md:p-8 container mx-auto">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-3xl font-bold font-headline text-primary">Travel Voucher Dashboard</h2>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search by activity..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <CreateTravelVoucherDialog
                onVoucherCreated={handleVoucherCreated}
                onVoucherUpdated={handleVoucherUpdated}
                voucherToEdit={voucherToEdit}
                onOpenChange={(open) => {
                    if (!open) {
                        setVoucherToEdit(null);
                    }
                }}
              >
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create New
                </Button>
              </CreateTravelVoucherDialog>
            </div>
          </div>

          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:w-[400px]">
              <TabsTrigger value="active">Active Records</TabsTrigger>
              <TabsTrigger value="archived">Archived Records</TabsTrigger>
            </TabsList>
            <TabsContent value="active">
              {loading ? <TableSkeleton /> : <TravelVoucherTable vouchers={activeVouchers} onEdit={openEditDialog} onDelete={handleVoucherDelete} />}
            </TabsContent>
            <TabsContent value="archived">
              {loading ? <TableSkeleton /> : <TravelVoucherTable vouchers={archivedVouchers} onEdit={openEditDialog} onDelete={handleVoucherDelete} />}
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
                        <TableHead><Skeleton className="h-5 w-48" /></TableHead>
                        <TableHead className="w-[180px]"><Skeleton className="h-5 w-28" /></TableHead>
                        <TableHead className="w-[150px]"><Skeleton className="h-5 w-20" /></TableHead>
                        <TableHead className="w-[200px]"><Skeleton className="h-5 w-40" /></TableHead>
                        <TableHead className="w-[100px] text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {[...Array(4)].map((_, i) => (
                        <TableRow key={i} className="border-none">
                            <TableCell><Skeleton className="h-5 w-56" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                            <TableCell><div className="space-y-1"><Skeleton className="h-2 w-32" /><Skeleton className="h-3 w-16" /></div></TableCell>
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
