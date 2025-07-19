"use client"

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Briefcase, PlusCircle, Search, LayoutGrid, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProcurementTable } from "@/components/procurement-table";
import { CreateProcurementDialog } from "@/components/create-procurement-dialog";
import { getProcurements, updateProcurement } from "@/lib/data";
import type { Procurement, ProjectType } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import { formatCurrency } from "@/lib/utils";

const projectTypes: ProjectType[] = ['ILCDB-DWIA', 'SPARK', 'TECH4ED-DTC', 'PROJECT CLICK', 'OTHERS'];


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

interface ProcurementFiltersProps {
  dateRange: DateRange | undefined;
  setDateRange: (date: DateRange | undefined) => void;
  selectedProjectTypes: ProjectType[];
  setSelectedProjectTypes: (types: ProjectType[]) => void;
  amountRange: [number, number];
  setAmountRange: (range: [number, number]) => void;
  maxAmount: number;
  progressRange: [number, number];
  setProgressRange: (range: [number, number]) => void;
  activeFilters: number;
}

function ProcurementFilters({
    dateRange,
    setDateRange,
    selectedProjectTypes,
    setSelectedProjectTypes,
    amountRange,
    setAmountRange,
    maxAmount,
    progressRange,
    setProgressRange,
    activeFilters
}: ProcurementFiltersProps) {

    const handleProjectTypeToggle = (type: ProjectType) => {
        const newSelection = selectedProjectTypes.includes(type)
            ? selectedProjectTypes.filter(t => t !== type)
            : [...selectedProjectTypes, type];
        setSelectedProjectTypes(newSelection);
    }

    return (
        <div className="flex items-center gap-2">
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="gap-2 relative">
                        <CalendarIcon className="h-4 w-4" />
                        <span>Date</span>
                        {dateRange?.from && (
                            <div className="hidden lg:block text-xs text-muted-foreground ml-2">
                                {format(dateRange.from, "LLL dd, y")} - {dateRange.to ? format(dateRange.to, "LLL dd, y") : '...'}
                            </div>
                        )}
                        {activeFilters > 0 && (dateRange?.from) && <span className="absolute -right-1 -top-1 flex h-3 w-3 items-center justify-center rounded-full bg-primary text-primary-foreground text-[8px]">1</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                    />
                </PopoverContent>
            </Popover>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                     <Button variant="outline" className="gap-2 relative">
                        <Filter className="h-4 w-4" />
                        <span>Project Type</span>
                        {selectedProjectTypes.length > 0 && <span className="absolute -right-1 -top-1 flex h-3 w-3 items-center justify-center rounded-full bg-primary text-primary-foreground text-[8px]">{selectedProjectTypes.length}</span>}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel>Filter by Project Type</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {projectTypes.map(type => (
                        <DropdownMenuCheckboxItem
                            key={type}
                            checked={selectedProjectTypes.includes(type)}
                            onSelect={(e) => e.preventDefault()}
                            onCheckedChange={() => handleProjectTypeToggle(type)}
                        >
                            {type}
                        </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="gap-2 relative">
                        <Filter className="h-4 w-4" />
                        <span>Amount</span>
                        {(amountRange[0] > 0 || amountRange[1] < maxAmount) && <span className="absolute -right-1 -top-1 flex h-3 w-3 items-center justify-center rounded-full bg-primary text-primary-foreground text-[8px]">!</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4" align="start">
                    <div className="space-y-4">
                         <label className="text-sm font-medium">Amount Range</label>
                         <Slider
                            min={0}
                            max={maxAmount}
                            step={100}
                            value={amountRange}
                            onValueChange={(value) => setAmountRange(value as [number, number])}
                         />
                         <div className="flex justify-between text-xs text-muted-foreground">
                             <span>{formatCurrency(amountRange[0])}</span>
                             <span>{formatCurrency(amountRange[1])}</span>
                         </div>
                    </div>
                </PopoverContent>
            </Popover>
            
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="gap-2 relative">
                        <Filter className="h-4 w-4" />
                        <span>Progress</span>
                        {(progressRange[0] > 0 || progressRange[1] < 100) && <span className="absolute -right-1 -top-1 flex h-3 w-3 items-center justify-center rounded-full bg-primary text-primary-foreground text-[8px]">!</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4" align="start">
                    <div className="space-y-4">
                         <label className="text-sm font-medium">Progress Range (%)</label>
                         <Slider
                            min={0}
                            max={100}
                            step={1}
                            value={progressRange}
                            onValueChange={(value) => setProgressRange(value as [number, number])}
                         />
                         <div className="flex justify-between text-xs text-muted-foreground">
                             <span>{progressRange[0]}%</span>
                             <span>{progressRange[1]}%</span>
                         </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}

export function Dashboard() {
  const [procurements, setProcurements] = useState<Procurement[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [procurementToEdit, setProcurementToEdit] = useState<Procurement | null>(null);
  const { toast } = useToast();

  // Filter states
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedProjectTypes, setSelectedProjectTypes] = useState<ProjectType[]>([]);
  const [maxAmount, setMaxAmount] = useState(100000);
  const [amountRange, setAmountRange] = useState<[number, number]>([0, 100000]);
  const [progressRange, setProgressRange] = useState<[number, number]>([0, 100]);

  useEffect(() => {
    async function loadProcurements() {
      setLoading(true);
      const data = await getProcurements();
      setProcurements(data);
      if (data.length > 0) {
        const max = Math.max(...data.map(p => p.amount));
        setMaxAmount(max);
        setAmountRange([0, max]);
      }
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

  const handleStatusChange = async (id: string, status: 'paid' | 'cancelled') => {
    try {
      const updatedProcurement = await updateProcurement(id, { status });
      if (updatedProcurement) {
        setProcurements(prev => prev.map(p => p.id === id ? updatedProcurement : p));
        toast({ title: "Success", description: `Procurement has been marked as ${status}.` });
      }
    } catch (error) {
      toast({ title: "Error", description: `Failed to update procurement status.`, variant: "destructive" });
    }
  };

  const openEditDialog = (procurement: Procurement) => {
    setProcurementToEdit(procurement);
  };
  
  const getProgress = (procurement: Procurement) => {
    const completedPhases = procurement.phases.filter(p => p.isCompleted).length;
    return (completedPhases / procurement.phases.length) * 100;
  };

  const filteredProcurements = useMemo(() => {
    let filtered = procurements;
    
    // Search filter
    if (searchTerm) {
        filtered = filtered.filter(p =>
          p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.prNumber.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    // Date range filter
    if (dateRange?.from) {
        filtered = filtered.filter(p => {
            const createdAt = new Date(p.createdAt);
            const from = dateRange.from!;
            const to = dateRange.to ? new Date(dateRange.to.getTime() + 86400000 - 1) : from; // include the whole "to" day
            return createdAt >= from && createdAt <= to;
        });
    }

    // Project type filter
    if (selectedProjectTypes.length > 0) {
        filtered = filtered.filter(p => selectedProjectTypes.includes(p.projectType));
    }

    // Amount range filter
    filtered = filtered.filter(p => p.amount >= amountRange[0] && p.amount <= amountRange[1]);

    // Progress range filter
    filtered = filtered.filter(p => {
        const progress = getProgress(p);
        return progress >= progressRange[0] && progress <= progressRange[1];
    });

    return filtered;
  }, [procurements, searchTerm, dateRange, selectedProjectTypes, amountRange, progressRange]);

  const activeProcurements = useMemo(() => filteredProcurements.filter(p => p.status === 'active'), [filteredProcurements]);
  const completedProcurements = useMemo(() => filteredProcurements.filter(p => p.status === 'completed'), [filteredProcurements]);
  const paidProcurements = useMemo(() => filteredProcurements.filter(p => p.status === 'paid'), [filteredProcurements]);
  const cancelledProcurements = useMemo(() => filteredProcurements.filter(p => p.status === 'cancelled'), [filteredProcurements]);

  const activeFiltersCount = [
    dateRange?.from ? 1 : 0,
    selectedProjectTypes.length > 0 ? 1 : 0,
    amountRange[0] > 0 || amountRange[1] < maxAmount ? 1 : 0,
    progressRange[0] > 0 || progressRange[1] < 100 ? 1 : 0
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 p-4 sm:p-6 md:p-8 container mx-auto">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-3xl font-bold font-headline text-primary">Procurement Dashboard</h2>
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
               <ProcurementFilters
                    dateRange={dateRange}
                    setDateRange={setDateRange}
                    selectedProjectTypes={selectedProjectTypes}
                    setSelectedProjectTypes={setSelectedProjectTypes}
                    amountRange={amountRange}
                    setAmountRange={setAmountRange}
                    maxAmount={maxAmount}
                    progressRange={progressRange}
                    setProgressRange={setProgressRange}
                    activeFilters={activeFiltersCount}
                />
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
            <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:grid-cols-4">
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="paid">Paid</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>
            <TabsContent value="active">
              {loading ? <TableSkeleton /> : <ProcurementTable procurements={activeProcurements} onEdit={openEditDialog} onStatusChange={handleStatusChange} />}
            </TabsContent>
            <TabsContent value="completed">
              {loading ? <TableSkeleton /> : <ProcurementTable procurements={completedProcurements} onEdit={openEditDialog} onStatusChange={handleStatusChange} />}
            </TabsContent>
            <TabsContent value="paid">
              {loading ? <TableSkeleton /> : <ProcurementTable procurements={paidProcurements} onEdit={openEditDialog} onStatusChange={handleStatusChange} />}
            </TabsContent>
            <TabsContent value="cancelled">
              {loading ? <TableSkeleton /> : <ProcurementTable procurements={cancelledProcurements} onEdit={openEditDialog} onStatusChange={handleStatusChange} />}
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

    