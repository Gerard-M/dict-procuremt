'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Edit, Loader2, CheckCircle, XCircle, MoreVertical } from 'lucide-react';
import type { Procurement, ProjectType } from "@/lib/types";
import { formatCurrency, cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";


type SortKey = keyof Procurement | 'progress';

interface ProcurementTableProps {
  procurements: Procurement[];
  onEdit: (procurement: Procurement) => void;
  onStatusChange: (id: string, status: 'paid' | 'cancelled') => Promise<void>;
}

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


export function ProcurementTable({ procurements, onEdit, onStatusChange }: ProcurementTableProps) {
  const [sortKey, setSortKey] = React.useState<SortKey>('createdAt');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('desc');
  const [isUpdating, setIsUpdating] = React.useState<string | null>(null);
  const [alertInfo, setAlertInfo] = React.useState<{ open: boolean; id?: string; status?: 'paid' | 'cancelled' }>({ open: false });

  const getProgress = (procurement: Procurement) => {
    const completedPhases = procurement.phases.filter(p => p.isCompleted).length;
    return (completedPhases / procurement.phases.length) * 100;
  };

  const sortedProcurements = React.useMemo(() => {
    return [...procurements].sort((a, b) => {
      let valA, valB;

      if (sortKey === 'progress') {
        valA = getProgress(a);
        valB = getProgress(b);
      } else {
        valA = a[sortKey as keyof Procurement];
        valB = b[sortKey as keyof Procurement];
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [procurements, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const renderSortArrow = (key: SortKey) => {
    if (sortKey !== key) return <ArrowUpDown className="h-4 w-4 text-muted-foreground/50" />;
    return sortDirection === 'asc' ? '▲' : '▼';
  };

  const handleStatusChangeClick = (id: string, status: 'paid' | 'cancelled') => {
    setAlertInfo({ open: true, id, status });
  };

  const handleConfirmStatusChange = async () => {
    if (alertInfo.id && alertInfo.status) {
      setIsUpdating(alertInfo.id);
      await onStatusChange(alertInfo.id, alertInfo.status);
      setAlertInfo({ open: false });
      setIsUpdating(null);
    }
  };


  if (procurements.length === 0) {
    return (
      <Card className="mt-4">
        <CardContent className="p-10 text-center text-muted-foreground">
          No procurements found.
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="mt-4">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('prNumber')}>
                      PR Number {renderSortArrow('prNumber')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('title')}>
                      Procurement Title {renderSortArrow('title')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('projectType')}>
                      Project Type {renderSortArrow('projectType')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('amount')}>
                      Amount {renderSortArrow('amount')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('progress')}>
                      Phase Progress {renderSortArrow('progress')}
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedProcurements.map((procurement) => {
                  const completedPhases = procurement.phases.filter(p => p.isCompleted).length;
                  const totalPhases = procurement.phases.length;
                  const progress = getProgress(procurement);
                  const projectDisplayName = procurement.projectType === 'OTHERS'
                    ? (procurement.otherProjectType || 'Others')
                    : procurement.projectType;
                  const canBeModified = procurement.status === 'active' || procurement.status === 'completed';

                  return (
                    <TableRow key={procurement.id}>
                      <TableCell className="font-medium">
                          <Link href={`/procurements/${procurement.id}`} className="hover:underline text-primary">
                              {procurement.prNumber}
                          </Link>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{procurement.title}</span>
                      </TableCell>
                      <TableCell>
                          <Badge variant="outline" className={cn("w-fit", getProjectTypeStyles(procurement.projectType))}>
                              {projectDisplayName}
                          </Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(procurement.amount)}</TableCell>
                      <TableCell>
                        <div className="w-40">
                          <Progress value={progress} className="h-2 bg-accent/20" />
                          <span className="text-xs text-muted-foreground">
                            {`Phase ${completedPhases} of ${totalPhases}`} ({Math.round(progress)}%)
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isUpdating === procurement.id ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                    <span className="sr-only">Actions</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onSelect={() => onEdit(procurement)} disabled={!canBeModified}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span>Edit</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onSelect={() => handleStatusChangeClick(procurement.id, 'paid')} disabled={!canBeModified}>
                                    <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                    <span>Mark as Paid</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onSelect={() => handleStatusChangeClick(procurement.id, 'cancelled')} disabled={!canBeModified} className="text-destructive">
                                    <XCircle className="mr-2 h-4 w-4" />
                                    <span>Mark as Cancelled</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <AlertDialog open={alertInfo.open} onOpenChange={(open) => setAlertInfo({ ...alertInfo, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will mark the procurement as "{alertInfo.status}". This can be changed later, but it will move the item to the corresponding tab.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmStatusChange}
              className={cn(alertInfo.status === 'cancelled' && 'bg-destructive hover:bg-destructive/90')}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
