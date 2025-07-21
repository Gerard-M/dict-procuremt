
"use client"

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, Filter, Briefcase, Award, Plane, LayoutGrid } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "./ui/separator";
import { DataTable, type ColumnDef, type ActionConfig } from "./data-table";
import type { ProjectType, Status } from "@/lib/types";

const projectTypes: ProjectType[] = ['ILCDB-DWIA', 'SPARK', 'TECH4ED-DTC', 'PROJECT CLICK', 'OTHERS'];
const statusTypes: Status[] = ['paid', 'cancelled'];

interface HeaderProps {
    title: string;
    itemType: 'procurement' | 'honoraria' | 'travel-voucher';
}

function Header({ title, itemType }: HeaderProps) {
    const icons = {
        procurement: <Briefcase className="h-8 w-8" />,
        honoraria: <Award className="h-8 w-8" />,
        'travel-voucher': <Plane className="h-8 w-8" />,
    }
  return (
    <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-4">
            {icons[itemType]}
            <h1 className="text-2xl font-bold font-headline">{title}</h1>
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

export interface FilterState {
    projectTypes: ProjectType[];
    amountRange: [number, number];
    progressRange: [number, number];
    statuses: Status[];
}

interface FiltersProps {
  onApplyFilters: (filters: FilterState) => void;
  maxAmount: number;
  initialFilters: FilterState;
  progressConfig: { label: string; max: number };
}

function Filters({ onApplyFilters, maxAmount, initialFilters, progressConfig }: FiltersProps) {
    const [open, setOpen] = useState(false);
    
    // Temporary states for filters inside the popover
    const [tempProjectTypes, setTempProjectTypes] = useState<ProjectType[]>(initialFilters.projectTypes);
    const [tempAmountRange, setTempAmountRange] = useState<[number, number]>([initialFilters.amountRange[0], initialFilters.amountRange[1]]);
    const [tempProgressRange, setTempProgressRange] = useState<[number, number]>(initialFilters.progressRange);
    const [tempStatuses, setTempStatuses] = useState<Status[]>(initialFilters.statuses);

    useEffect(() => {
        setTempAmountRange([initialFilters.amountRange[0], initialFilters.amountRange[1] === Infinity ? maxAmount : initialFilters.amountRange[1]])
    }, [initialFilters.amountRange, maxAmount])

    const handleProjectTypeToggle = (type: ProjectType) => {
        const newSelection = tempProjectTypes.includes(type)
            ? tempProjectTypes.filter(t => t !== type)
            : [...tempProjectTypes, type];
        setTempProjectTypes(newSelection);
    };

    const handleStatusToggle = (status: Status) => {
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
        setTempProgressRange([0, progressConfig.max]);
        setTempStatuses([]);
    };

    const activeFiltersCount = [
        initialFilters.projectTypes.length > 0 ? 1 : 0,
        initialFilters.amountRange[0] > 0 || initialFilters.amountRange[1] < maxAmount ? 1 : 0,
        initialFilters.progressRange[0] > 0 || initialFilters.progressRange[1] < progressConfig.max ? 1 : 0,
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
                            id={`filter-${type}`}
                            checked={tempProjectTypes.includes(type)} 
                            onCheckedChange={() => handleProjectTypeToggle(type)}
                        />
                        <Label htmlFor={`filter-${type}`} className="font-normal">{type}</Label>
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
                      id={`filter-${status}`}
                      checked={tempStatuses.includes(status)}
                      onCheckedChange={() => handleStatusToggle(status)}
                    />
                    <Label htmlFor={`filter-${status}`} className="font-normal capitalize">{status}</Label>
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
                <Label>{progressConfig.label}</Label>
                 <Slider
                    min={0}
                    max={progressConfig.max}
                    step={1}
                    value={tempProgressRange}
                    onValueChange={(value) => setTempProgressRange(value as [number, number])}
                 />
                 <div className="flex justify-between text-xs text-muted-foreground">
                     <span>Phase {tempProgressRange[0]}</span>
                     <span>Phase {tempProgressRange[1]}</span>
                 </div>
            </div>
            <Button onClick={handleApply} className="w-full">Apply Filters</Button>
          </div>
        </PopoverContent>
      </Popover>
    );
}

interface DashboardLayoutProps<T extends { id: string, status?: Status, isArchived?: boolean, amount: number, projectType: ProjectType }> {
  title: string;
  itemType: 'procurement' | 'honoraria' | 'travel-voucher';
  data: T[];
  loading: boolean;
  columns: ColumnDef<T>[];
  filterConfig: {
      search: {
          placeholder: string;
          keys: (keyof T)[];
      };
      progress: {
          label: string;
          max: number;
          getProgress: (item: T) => number;
      };
  };
  children: React.ReactNode;
  onStatusChange: (id: string, status: Status) => Promise<void>;
  onEdit: (item: T) => void;
  onDelete: (id: string) => Promise<void>;
  renderTabActions?: (activeTab: string, filteredData: T[]) => React.ReactNode;
}

export function DashboardLayout<T extends { id: string, status?: Status, isArchived?: boolean, amount: number, projectType: ProjectType }>({
  title,
  itemType,
  data,
  loading,
  columns,
  filterConfig,
  children,
  onStatusChange,
  onEdit,
  onDelete,
  renderTabActions
}: DashboardLayoutProps<T>) {

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('active');

  // Filter states
  const [maxAmount, setMaxAmount] = useState(100000);
  const [filters, setFilters] = useState<FilterState>({
    projectTypes: [],
    amountRange: [0, 100000],
    progressRange: [0, filterConfig.progress.max],
    statuses: [],
  });

  useEffect(() => {
    if (data.length > 0) {
      const max = Math.max(...data.map(p => p.amount), 100000);
      setMaxAmount(max);
      setFilters(f => ({ ...f, amountRange: [f.amountRange[0], max] }));
    }
  }, [data]);

  const filteredData = useMemo(() => {
    let filtered = data;
    
    // Search filter
    if (searchTerm) {
        filtered = filtered.filter(item => 
            filterConfig.search.keys.some(key => 
                String(item[key]).toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }

    // Project type filter
    if (filters.projectTypes.length > 0) {
        filtered = filtered.filter(p => filters.projectTypes.includes(p.projectType));
    }

    // Status filter
    if (filters.statuses.length > 0) {
        filtered = filtered.filter(p => p.status ? filters.statuses.includes(p.status) : false);
    }

    // Amount range filter
    filtered = filtered.filter(p => p.amount >= filters.amountRange[0] && p.amount <= filters.amountRange[1]);

    // Progress range filter
    filtered = filtered.filter(p => {
        const progress = filterConfig.progress.getProgress(p);
        return progress >= filters.progressRange[0] && progress <= filters.progressRange[1];
    });

    return filtered;
  }, [data, searchTerm, filters, filterConfig]);

  const getTabData = useCallback((tab: string) => {
    switch (tab) {
        case 'active':
            return filteredData.filter(p => p.status === 'active' && !p.isArchived);
        case 'completed':
            return filteredData.filter(p => p.status === 'completed' && !p.isArchived);
        case 'archived':
            return filteredData.filter(p => p.isArchived);
        case 'all':
        default:
            return filteredData;
    }
  }, [filteredData]);

  const activeData = getTabData('active');
  const completedData = getTabData('completed');
  const archivedData = getTabData('archived');
  const allData = getTabData('all');

  const actionConfig: ActionConfig<T> = {
      onEdit,
      onDelete,
      onStatusChange,
  };


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header title={title} itemType={itemType} />
      <main className="flex-1 p-4 sm:p-6 md:p-8 container mx-auto">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-3xl font-bold font-headline text-primary">{title}</h2>
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
               <Filters
                  onApplyFilters={setFilters}
                  maxAmount={maxAmount}
                  initialFilters={filters}
                  progressConfig={filterConfig.progress}
                />
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder={filterConfig.search.placeholder}
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {children}
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:grid-cols-4">
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
            <TabsContent value="active">
              <DataTable loading={loading} columns={columns} data={activeData} actionConfig={actionConfig} />
            </TabsContent>
             <TabsContent value="archived">
              <DataTable loading={loading} columns={columns} data={archivedData} actionConfig={actionConfig} />
            </TabsContent>
            <TabsContent value="completed">
              <DataTable loading={loading} columns={columns} data={completedData} actionConfig={actionConfig} />
            </TabsContent>
            <TabsContent value="all">
              <DataTable loading={loading} columns={columns} data={allData} actionConfig={actionConfig} />
            </TabsContent>
          </Tabs>
        </div>
        {renderTabActions?.(activeTab, getTabData(activeTab))}
      </main>
    </div>
  );
}
