
"use client"

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Award, PlusCircle, Search, LayoutGrid, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HonorariaTable } from "@/components/honoraria-table";
import { CreateHonorariaDialog } from "@/components/create-honoraria-dialog";
import { getHonoraria, updateHonoraria, deleteHonoraria } from "@/lib/data";
import type { Honoraria, ProjectType } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "./ui/separator";

const projectTypes: ProjectType[] = ['ILCDB-DWIA', 'SPARK', 'TECH4ED-DTC', 'PROJECT CLICK', 'OTHERS'];
const statusTypes: ('paid' | 'cancelled')[] = ['paid', 'cancelled'];

function Header() {
  return (
    <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-4">
            <Award className="h-8 w-8" />
            <h1 className="text-2xl font-bold font-headline">ILCDB Honoraria System</h1>
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

interface HonorariaFiltersProps {
  onApplyFilters: (filters: {
    projectTypes: ProjectType[];
    amountRange: [number, number];
    progressRange: [number, number];
    statuses: ('paid' | 'cancelled')[];
  }) => void;
  maxAmount: number;
  initialFilters: {
    projectTypes: ProjectType[];
    amountRange: [number, number];
    progressRange: [number, number];
    statuses: ('paid' | 'cancelled')[];
  }
}

function HonorariaFilters({ onApplyFilters, maxAmount, initialFilters }: HonorariaFiltersProps) {
    const [open, setOpen] = useState(false);
    
    const [tempProjectTypes, setTempProjectTypes] = useState<ProjectType[]>(initialFilters.projectTypes);
    const [tempAmountRange, setTempAmountRange] = useState<[number, number]>(initialFilters.amountRange);
    const [tempProgressRange, setTempProgressRange] = useState<[number, number]>(initialFilters.progressRange);
    const [tempStatuses, setTempStatuses] = useState<('paid' | 'cancelled')[]>(initialFilters.statuses);

    useEffect(() => {
        setTempAmountRange(initialFilters.amountRange)
    }, [initialFilters.amountRange])

    const handleProjectTypeToggle = (type: ProjectType) => {
        const newSelection = tempProjectTypes.includes(type)
            ? tempProjectTypes.filter(t => t !== type)
            : [...tempProjectTypes, type];
        setTempProjectTypes(newSelection);
    };

    const handleStatusToggle = (status: 'paid' | 'cancelled') => {
        const newSelection = tempStatuses.includes(status)
            ? tempStatuses.filter(s => s !== status)
            : [...tempStatuses, status];
        setTempStatuses(newSelection);
    };

    const handleApply = () => {
        onApplyFilters({
            projectTypes: tempProjectTypes,
            amountRange: tempAmountRange,
            progressRange: tempProgressRange,
            statuses: tempStatuses,
        });
        setOpen(false);
    };

    const handleClear = () => {
        setTempProjectTypes([]);
        setTempAmountRange([0, maxAmount]);
        setTempProgressRange([0, 1]);
        setTempStatuses([]);
    };

    const activeFiltersCount = [
        initialFilters.projectTypes.length > 0 ? 1 : 0,
        initialFilters.amountRange[0] > 0 || initialFilters.amountRange[1] < maxAmount ? 1 : 0,
        initialFilters.progressRange[0] > 0 || initialFilters.progressRange[1] < 1 ? 1 : 0,
        initialFilters.statuses.length > 0 ? 1 : 0,
    ].reduce((sum, count) => sum + count, 0);

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2 relative">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
            {activeFiltersCount > 0 && <span className="absolute -right-1 -top-1 flex h-3 w-3 items-center justify-center rounded-full bg-primary text-primary-foreground text-[8px]">{activeFiltersCount}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-4" align="end">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium">Filters</h4>
            <Button variant="ghost" size="sm" onClick={handleClear}>Clear all</Button>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
                <Label>Project Type</Label>
                <div className="grid grid-cols-2 gap-2">
                {projectTypes.map(type => (
                    <div key={type} className="flex items-center space-x-2">
                        <Checkbox 
                            id={`filter-h-${type}`}
                            checked={tempProjectTypes.includes(type)} 
                            onCheckedChange={() => handleProjectTypeToggle(type)}
                        />
                        <Label htmlFor={`filter-h-${type}`} className="font-normal">{type}</Label>
                    </div>
                ))}
                </div>
            </div>
             <Separator />
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="grid grid-cols-2 gap-2">
                {statusTypes.map(status => (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox
                      id={`filter-h-${status}`}
                      checked={tempStatuses.includes(status)}
                      onCheckedChange={() => handleStatusToggle(status)}
                    />
                    <Label htmlFor={`filter-h-${status}`} className="font-normal capitalize">{status}</Label>
                  </div>
                ))}
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
                <Label>Amount Range</Label>
                <div className="flex items-center gap-2">
                    <Input
                        type="number"
                        placeholder="Min amount"
                        value={tempAmountRange[0]}
                        onChange={(e) => setTempAmountRange([Number(e.target.value), tempAmountRange[1]])}
                        className="text-sm"
                    />
                     <span className="text-muted-foreground">-</span>
                    <Input
                        type="number"
                        placeholder="Max amount"
                        value={tempAmountRange[1] === maxAmount ? '' : tempAmountRange[1]}
                        onChange={(e) => setTempAmountRange([tempAmountRange[0], Number(e.target.value) || maxAmount])}
                        className="text-sm"
                    />
                </div>
            </div>
             <Separator />
            <div className="space-y-2">
                <Label>Progress</Label>
                 <Slider
                    min={0}
                    max={1}
                    step={1}
                    value={tempProgressRange}
                    onValueChange={(value) => setTempProgressRange(value as [number, number])}
                 />
                 <div className="flex justify-between text-xs text-muted-foreground">
                     <span>In Progress</span>
                     <span>Completed</span>
                 </div>
            </div>
            <Button onClick={handleApply} className="w-full">Apply Filters</Button>
          </div>
        </PopoverContent>
      </Popover>
    );
}

export function HonorariaDashboard() {
  const [honoraria, setHonoraria] = useState<Honoraria[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [honorariaToEdit, setHonorariaToEdit] = useState<Honoraria | null>(null);
  const { toast } = useToast();

  const [selectedProjectTypes, setSelectedProjectTypes] = useState<ProjectType[]>([]);
  const [maxAmount, setMaxAmount] = useState(100000);
  const [amountRange, setAmountRange] = useState<[number, number]>([0, 100000]);
  const [progressRange, setProgressRange] = useState<[number, number]>([0, 1]);
  const [selectedStatuses, setSelectedStatuses] = useState<('paid' | 'cancelled')[]>([]);
  
  const initialFilters = { projectTypes: selectedProjectTypes, amountRange, progressRange, statuses: selectedStatuses };


  useEffect(() => {
    async function loadHonoraria() {
      setLoading(true);
      const data = await getHonoraria();
      setHonoraria(data);
      if (data.length > 0) {
        const max = Math.max(...data.map(p => p.amount), 100000);
        setMaxAmount(max);
        setAmountRange([0, max]);
      }
      setLoading(false);
    }
    loadHonoraria();
  }, []);

  const handleApplyFilters = (filters: typeof initialFilters) => {
    setSelectedProjectTypes(filters.projectTypes);
    setAmountRange(filters.amountRange);
    setProgressRange(filters.progressRange);
    setSelectedStatuses(filters.statuses);
  }

  const handleHonorariaCreated = (newHonoraria: Honoraria) => {
    setHonoraria(prev => [newHonoraria, ...prev]);
  };
  
  const handleHonorariaUpdated = (updatedHonoraria: Honoraria) => {
    setHonoraria(prev => prev.map(h => h.id === updatedHonoraria.id ? updatedHonoraria : h));
    setHonorariaToEdit(null);
  };

  const handleStatusChange = async (id: string, status: 'paid' | 'cancelled') => {
    try {
      const updates: Partial<Honoraria> = { status };
      if (status === 'cancelled') {
        updates.isArchived = true;
      }
      const updatedHonoraria = await updateHonoraria(id, updates);

      if (updatedHonoraria) {
        setHonoraria(prev => prev.map(p => p.id === id ? updatedHonoraria : p));
        toast({ title: "Success", description: `Honoraria has been marked as ${status}.` });
      }
    } catch (error) {
      toast({ title: "Error", description: `Failed to update honoraria status.`, variant: "destructive" });
    }
  };

  const handleHonorariaDelete = async (id: string) => {
    try {
      await deleteHonoraria(id);
      setHonoraria(prev => prev.filter(h => h.id !== id));
      toast({ title: "Success", description: "Honoraria record has been deleted." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete honoraria record.", variant: "destructive" });
    }
  };

  const openEditDialog = (honoraria: Honoraria) => {
    setHonorariaToEdit(honoraria);
  };
  
  const getProgressValue = (record: Honoraria) => {
    return record.status === 'completed' || record.phase.isCompleted ? 1 : 0;
  };

  const filteredHonoraria = useMemo(() => {
    let filtered = honoraria;

    if (searchTerm) {
        filtered = filtered.filter(p =>
          p.activityTitle.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    if (selectedProjectTypes.length > 0) {
        filtered = filtered.filter(p => selectedProjectTypes.includes(p.projectType));
    }

    if (selectedStatuses.length > 0) {
        filtered = filtered.filter(p => selectedStatuses.includes(p.status as 'paid' | 'cancelled'));
    }

    filtered = filtered.filter(p => p.amount >= amountRange[0] && p.amount <= amountRange[1]);

    filtered = filtered.filter(p => {
        const progress = getProgressValue(p);
        return progress >= progressRange[0] && progress <= progressRange[1];
    });

    return filtered;
  }, [honoraria, searchTerm, selectedProjectTypes, amountRange, progressRange, selectedStatuses]);

  const activeHonoraria = useMemo(() => filteredHonoraria.filter(p => p.status === 'active' && !p.isArchived), [filteredHonoraria]);
  const completedHonoraria = useMemo(() => filteredHonoraria.filter(p => p.status === 'completed' && !p.isArchived), [filteredHonoraria]);
  const archivedHonoraria = useMemo(() => filteredHonoraria.filter(p => p.isArchived), [filteredHonoraria]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 p-4 sm:p-6 md:p-8 container mx-auto">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-3xl font-bold font-headline text-primary">Honoraria Dashboard</h2>
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
               <HonorariaFilters
                  onApplyFilters={handleApplyFilters}
                  maxAmount={maxAmount}
                  initialFilters={initialFilters}
                />
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search by activity..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <CreateHonorariaDialog
                onHonorariaCreated={handleHonorariaCreated}
                onHonorariaUpdated={handleHonorariaUpdated}
                honorariaToEdit={honorariaToEdit}
                onOpenChange={(open) => {
                    if (!open) {
                        setHonorariaToEdit(null);
                    }
                }}
              >
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create New
                </Button>
              </CreateHonorariaDialog>
            </div>
          </div>

          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:grid-cols-4">
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              {loading ? <TableSkeleton /> : <HonorariaTable honoraria={filteredHonoraria} onEdit={openEditDialog} onStatusChange={handleStatusChange} onDelete={handleHonorariaDelete} />}
            </TabsContent>
            <TabsContent value="active">
              {loading ? <TableSkeleton /> : <HonorariaTable honoraria={activeHonoraria} onEdit={openEditDialog} onStatusChange={handleStatusChange} onDelete={handleHonorariaDelete} />}
            </TabsContent>
            <TabsContent value="completed">
              {loading ? <TableSkeleton /> : <HonorariaTable honoraria={completedHonoraria} onEdit={openEditDialog} onStatusChange={handleStatusChange} onDelete={handleHonorariaDelete} />}
            </TabsContent>
            <TabsContent value="archived">
                {loading ? <TableSkeleton /> : <HonorariaTable honoraria={archivedHonoraria} onEdit={openEditDialog} onStatusChange={handleStatusChange} onDelete={handleHonorariaDelete} />}
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

    