
"use client"

import { useState, useMemo, useEffect, useCallback } from "react";
import type { Procurement, ProjectType, Status } from "@/lib/types";
import { getProcurements, updateProcurement, deleteProcurement } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout, type FilterState } from "@/components/dashboard-layout";
import { DataTable, type ColumnDef } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, cn } from "@/lib/utils";
import Link from "next/link";
import { CreateProcurementDialog } from "./create-procurement-dialog";
import { Button } from "./ui/button";
import { Download, Loader2 } from "lucide-react";
import { generateBatchProcurementPdf } from "@/lib/pdf";


const getProjectTypeStyles = (projectType: ProjectType): string => {
  switch (projectType) {
    case 'ILCDB-DWIA':
      return 'bg-primary/10 text-primary border-primary/20';
    case 'SPARK':
      return 'bg-accent/10 text-[hsl(var(--accent))] border-accent/20';
    case 'TECH4ED-DTC':
      return 'bg-chart-2/20 text-[hsl(var(--chart-2))] border-chart-2/30';
    case 'PROJECT CLICK':
      return 'bg-chart-4/20 text-[hsl(var(--chart-4))] border-chart-4/30';
    case 'OTHERS':
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
};

const getProgress = (procurement: Procurement) => {
    if (!procurement.phases) return 0;
    const completedPhases = procurement.phases.filter(p => p.isCompleted).length;
    return (completedPhases / procurement.phases.length) * 100;
};

export function Dashboard() {
  const [procurements, setProcurements] = useState<Procurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [procurementToEdit, setProcurementToEdit] = useState<Procurement | null>(null);
  const { toast } = useToast();
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const fetchProcurements = useCallback(async () => {
    setLoading(true);
    const data = await getProcurements();
    setProcurements(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProcurements();
  }, [fetchProcurements]);

  const handleProcurementCreated = (newProcurement: Procurement) => {
    setProcurements(prev => [newProcurement, ...prev]);
  };

  const handleProcurementUpdated = (updatedProcurement: Procurement) => {
    setProcurements(prev => prev.map(p => p.id === updatedProcurement.id ? updatedProcurement : p));
    setProcurementToEdit(null);
  };

  const handleStatusChange = async (id: string, status: Status) => {
    try {
      const updates: Partial<Procurement> = { status };
      if (status === 'cancelled') {
        updates.isArchived = true;
      }
      const updatedProcurement = await updateProcurement(id, updates);
      if (updatedProcurement) {
        setProcurements(prev => prev.map(p => p.id === id ? updatedProcurement : p));
        toast({ title: "Success", description: `Procurement has been marked as ${status}.` });
      }
    } catch (error) {
      toast({ title: "Error", description: `Failed to update procurement status.`, variant: "destructive" });
    }
  };

  const handleProcurementDelete = async (id: string) => {
    try {
      await deleteProcurement(id);
      setProcurements(prev => prev.filter(p => p.id !== id));
      toast({ title: "Success", description: `Procurement record has been deleted.` });
    } catch (error) {
      toast({ title: "Error", description: `Failed to delete procurement.`, variant: "destructive" });
    }
  };

  const openEditDialog = (procurement: Procurement) => {
    setProcurementToEdit(procurement);
  };
  
  const columns: ColumnDef<Procurement>[] = useMemo(() => [
    {
      accessorKey: "prNumber",
      header: "PR Number",
      cell: ({ row }) => <Link href={`/procurements/${row.original.id}`} className="hover:underline text-primary">{row.getValue("prNumber")}</Link>
    },
    { accessorKey: "title", header: "Procurement Title" },
    { 
      accessorKey: "projectType", 
      header: "Project Type",
      cell: ({ row }) => {
        const record = row.original;
        const projectDisplayName = record.projectType === 'OTHERS' ? (record.otherProjectType || 'Others') : record.projectType;
        return <Badge variant="outline" className={cn("w-fit", getProjectTypeStyles(record.projectType))}>{projectDisplayName}</Badge>
      }
    },
    { 
      accessorKey: "amount", 
      header: "Amount",
      cell: ({ row }) => formatCurrency(row.getValue("amount"))
    },
    { 
      accessorKey: "phases", 
      header: "Phase Progress",
      cell: ({ row }) => {
          if (!row.original.phases) return null;
          const completedPhases = row.original.phases.filter(p => p.isCompleted).length;
          const totalPhases = row.original.phases.length;
          const progress = getProgress(row.original);
          return (
            <div className="w-40">
              <Progress value={progress} className="h-2 bg-accent/20" />
              <span className="text-xs text-muted-foreground">
                {`Phase ${completedPhases} of ${totalPhases}`} ({Math.round(progress)}%)
              </span>
            </div>
          )
      }
    },
    { 
      accessorKey: "status", 
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as Status;
        if (status === 'paid') return <Badge variant="secondary" className="bg-green-100 text-green-800">Paid</Badge>;
        if (status === 'cancelled') return <Badge variant="destructive">Cancelled</Badge>;
        return null;
      }
    }
  ], []);

  const filterConfig = useMemo(() => ({
    search: {
        placeholder: "Search by title or PR...",
        keys: ["title", "prNumber"],
    },
    progress: {
        label: "Progress (Phases Completed)",
        max: 6,
        getProgress: (item: Procurement) => item.phases?.filter(p => p.isCompleted).length || 0,
    }
  }), []);
  
  const handleDownloadAll = async (filteredData: Procurement[]) => {
      setIsDownloadingPdf(true);
      try {
          await generateBatchProcurementPdf(filteredData);
      } catch (error) {
          console.error("Failed to generate batch PDF:", error);
          toast({ title: "Error", description: "Could not generate PDF.", variant: 'destructive' });
      } finally {
          setIsDownloadingPdf(false);
      }
  };

  const renderTabActions = (activeTab: string, filteredData: Procurement[]) => {
    if (activeTab === 'all' && filteredData.length > 0) {
      return (
        <Button
          onClick={() => handleDownloadAll(filteredData)}
          disabled={isDownloadingPdf}
          className="fixed bottom-6 right-6 z-50 rounded-full h-14 w-14 p-4 shadow-lg"
        >
          {isDownloadingPdf ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <Download className="h-6 w-6" />
          )}
          <span className="sr-only">Download All</span>
        </Button>
      );
    }
    return null;
  };


  return (
    <DashboardLayout
      title="Procurement Dashboard"
      itemType="procurement"
      data={procurements}
      loading={loading}
      columns={columns}
      filterConfig={filterConfig}
      onStatusChange={handleStatusChange}
      onEdit={openEditDialog}
      onDelete={handleProcurementDelete}
      renderTabActions={renderTabActions}
    >
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
            <Button>Create New</Button>
        </CreateProcurementDialog>
    </DashboardLayout>
  );
}
