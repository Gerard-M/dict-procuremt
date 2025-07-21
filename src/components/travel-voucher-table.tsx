
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
import { ArrowUpDown, Edit, Loader2, MoreVertical, Trash2, CheckCircle, XCircle } from 'lucide-react';
import type { TravelVoucher, ProjectType } from "@/lib/types";
import { formatCurrency, cn } from "@/lib/utils";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type SortKey = keyof Omit<TravelVoucher, 'speakerName'> | 'progress';

interface TravelVoucherTableProps {
  vouchers: TravelVoucher[];
  onEdit: (voucher: TravelVoucher) => void;
  onStatusChange: (id: string, status: 'paid' | 'cancelled') => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const getProjectTypeStyles = (projectType?: ProjectType): string => {
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

export function TravelVoucherTable({ vouchers, onEdit, onDelete, onStatusChange }: TravelVoucherTableProps) {
  const [sortKey, setSortKey] = React.useState<SortKey>('createdAt');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('desc');
  const [isUpdating, setIsUpdating] = React.useState<string | null>(null);
  const [alertInfo, setAlertInfo] = React.useState<{ open: boolean; id?: string; type?: 'paid' | 'cancelled' | 'delete' }>({ open: false });

  const getProgress = (record: TravelVoucher) => {
    return record.phase.isCompleted ? 100 : 0;
  };

  const sortedVouchers = React.useMemo(() => {
    return [...vouchers].sort((a, b) => {
      let valA, valB;

      if (sortKey === 'progress') {
        valA = getProgress(a);
        valB = getProgress(b);
      } else {
        valA = a[sortKey as keyof TravelVoucher];
        valB = b[sortKey as keyof TravelVoucher];
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [vouchers, sortKey, sortDirection]);

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
  
  const openAlertDialog = (id: string, type: 'paid' | 'cancelled' | 'delete') => {
    setAlertInfo({ open: true, id, type });
  };

  const handleConfirmAction = async () => {
    if (!alertInfo.id || !alertInfo.type) return;

    setIsUpdating(alertInfo.id);
    if (alertInfo.type === 'paid' || alertInfo.type === 'cancelled') {
      await onStatusChange(alertInfo.id, alertInfo.type);
    } else if (alertInfo.type === 'delete') {
      await onDelete(alertInfo.id);
    }
    setAlertInfo({ open: false });
    setIsUpdating(null);
  };

  const getAlertContent = () => {
    if (!alertInfo.type) return { title: '', description: '' };
    switch (alertInfo.type) {
        case 'paid':
            return { title: 'Mark as Paid?', description: 'This action will mark the travel voucher as "Paid". This can be changed later if needed.' };
        case 'cancelled':
            return { title: 'Mark as Cancelled?', description: 'This will archive the travel voucher record. This can be changed later if needed.' };
        case 'delete':
            return { title: 'Are you absolutely sure?', description: 'This action cannot be undone. This will permanently delete the travel voucher record.' };
    }
  }


  if (vouchers.length === 0) {
    return (
      <Card className="mt-4">
        <CardContent className="p-10 text-center text-muted-foreground">
          No travel voucher records found for the selected filters.
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
                  <Button variant="ghost" onClick={() => handleSort('activityTitle')}>
                    Activity Title {renderSortArrow('activityTitle')}
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
                    Progress {renderSortArrow('progress')}
                  </Button>
                </TableHead>
                 <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('status')}>
                    Status {renderSortArrow('status')}
                  </Button>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedVouchers.map((record) => {
                const progress = getProgress(record);
                const projectDisplayName = record.projectType === 'OTHERS'
                  ? (record.otherProjectType || 'Others')
                  : record.projectType;

                return (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                        <Link href={`/travel-voucher/${record.id}`} className="hover:underline text-primary">
                            {record.activityTitle}
                        </Link>
                    </TableCell>
                    <TableCell>
                      { record.projectType &&
                        <Badge variant="outline" className={cn("w-fit", getProjectTypeStyles(record.projectType))}>
                            {projectDisplayName}
                        </Badge>
                      }
                    </TableCell>
                    <TableCell>{formatCurrency(record.amount)}</TableCell>
                    <TableCell>
                      <div className="w-40">
                        <Progress value={progress} className="h-2 bg-accent/20" />
                        <span className="text-xs text-muted-foreground">
                          {progress === 100 ? 'Completed' : 'In Progress'}
                        </span>
                      </div>
                    </TableCell>
                     <TableCell>
                        {record.status === 'paid' && <Badge variant="secondary" className="bg-green-100 text-green-800">Paid</Badge>}
                        {record.status === 'cancelled' && <Badge variant="destructive">Cancelled</Badge>}
                    </TableCell>
                    <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                            {isUpdating === record.id ? (
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
                                  <DropdownMenuItem onSelect={() => onEdit(record)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span>Edit</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onSelect={() => openAlertDialog(record.id, 'paid')} disabled={record.status === 'paid' || record.status === 'cancelled'}>
                                    <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                    <span>Mark as Paid</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onSelect={() => openAlertDialog(record.id, 'cancelled')} disabled={record.status === 'cancelled'}>
                                    <XCircle className="mr-2 h-4 w-4" />
                                    <span>Mark as Cancelled</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onSelect={() => openAlertDialog(record.id, 'delete')} className="text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Delete</span>
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
            <AlertDialogTitle>{getAlertContent().title}</AlertDialogTitle>
            <AlertDialogDescription>
              {getAlertContent().description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              className={cn((alertInfo.type === 'cancelled' || alertInfo.type === 'delete') && 'bg-destructive hover:bg-destructive/90')}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

    