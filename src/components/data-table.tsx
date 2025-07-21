
'use client';

import * as React from 'react';
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
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Edit, Loader2, MoreVertical, Trash2, CheckCircle, XCircle } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import type { Status } from '@/lib/types';
import { Skeleton } from './ui/skeleton';

export interface ColumnDef<TData> {
    accessorKey: keyof TData | string;
    header: React.ReactNode | ((...args: any[]) => React.ReactNode);
    cell?: ({ row }: { row: { original: TData, getValue: (key: string) => any } }) => React.ReactNode;
}

export interface ActionConfig<TData extends { id: string }> {
    onEdit?: (item: TData) => void;
    onDelete?: (id: string) => Promise<void>;
    onStatusChange?: (id: string, status: Status) => Promise<void>;
}

interface DataTableProps<TData extends { id: string, status?: Status }> {
    columns: ColumnDef<TData>[];
    data: TData[];
    loading: boolean;
    actionConfig?: ActionConfig<TData>;
}

export function DataTable<TData extends { id: string, status?: Status }>({ columns, data, loading, actionConfig }: DataTableProps<TData>) {
    const [sortKey, setSortKey] = React.useState<keyof TData | string>('createdAt');
    const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('desc');
    const [isUpdating, setIsUpdating] = React.useState<string | null>(null);
    const [alertInfo, setAlertInfo] = React.useState<{ open: boolean; id?: string; type?: Status | 'delete' }>({ open: false });

    const sortedData = React.useMemo(() => {
        if (!data) return [];
        return [...data].sort((a, b) => {
          const aVal = a[sortKey as keyof TData];
          const bVal = b[sortKey as keyof TData];
          
          if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
          if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
          return 0;
        });
    }, [data, sortKey, sortDirection]);

    const handleSort = (key: keyof TData | string) => {
        if (sortKey === key) {
          setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
          setSortKey(key);
          setSortDirection('asc');
        }
    };

    const renderSortArrow = (key: keyof TData | string) => {
        if (sortKey !== key) return <ArrowUpDown className="h-4 w-4 text-muted-foreground/50" />;
        return sortDirection === 'asc' ? '▲' : '▼';
    };

    const openAlertDialog = (id: string, type: Status | 'delete') => {
        setAlertInfo({ open: true, id, type });
    };

    const handleConfirmAction = async () => {
        if (!alertInfo.id || !alertInfo.type) return;

        setIsUpdating(alertInfo.id);
        if (alertInfo.type === 'delete') {
            await actionConfig?.onDelete?.(alertInfo.id);
        } else {
            await actionConfig?.onStatusChange?.(alertInfo.id, alertInfo.type);
        }
        setAlertInfo({ open: false });
        setIsUpdating(null);
    };

    const getAlertContent = () => {
        if (!alertInfo.type) return { title: '', description: '' };
        switch (alertInfo.type) {
            case 'paid':
                return { title: 'Mark as Paid?', description: 'This action will mark the item as "Paid". This can be changed later.' };
            case 'cancelled':
                return { title: 'Mark as Cancelled?', description: 'This will archive the record. This can be changed later.' };
            case 'delete':
                return { title: 'Are you absolutely sure?', description: 'This action cannot be undone and will permanently delete the record.' };
            default:
                return { title: '', description: '' };
        }
    }

    if (loading) {
        return <TableSkeleton />;
    }

    if (!data || data.length === 0) {
        return (
          <Card className="mt-4">
            <CardContent className="p-10 text-center text-muted-foreground">
              No records found for the selected filters.
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
                    {columns.map((column, index) => (
                      <TableHead key={index}>
                         {typeof column.header === 'function' ? column.header() : (
                           <Button variant="ghost" onClick={() => handleSort(column.accessorKey)}>
                             {column.header} {renderSortArrow(column.accessorKey)}
                           </Button>
                         )}
                      </TableHead>
                    ))}
                    {actionConfig && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedData.map((row) => (
                    <TableRow key={row.id}>
                      {columns.map((column, index) => (
                        <TableCell key={index}>
                          {column.cell ? column.cell({ row: { original: row, getValue: (key) => row[key as keyof TData] } }) : String(row[column.accessorKey as keyof TData] ?? '')}
                        </TableCell>
                      ))}
                      {actionConfig && (
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                               {isUpdating === row.id ? (
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
                                    {actionConfig.onEdit && <DropdownMenuItem onSelect={() => actionConfig.onEdit?.(row)}>
                                      <Edit className="mr-2 h-4 w-4" />
                                      <span>Edit</span>
                                    </DropdownMenuItem>}
                                    {actionConfig.onStatusChange && (
                                        <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onSelect={() => openAlertDialog(row.id, 'paid')} disabled={row.status === 'paid' || row.status === 'cancelled'}>
                                                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                                <span>Mark as Paid</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => openAlertDialog(row.id, 'cancelled')} disabled={row.status === 'cancelled'}>
                                                <XCircle className="mr-2 h-4 w-4" />
                                                <span>Mark as Cancelled</span>
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                    {actionConfig.onDelete && <><DropdownMenuSeparator />
                                    <DropdownMenuItem onSelect={() => openAlertDialog(row.id, 'delete')} className="text-destructive">
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      <span>Delete</span>
                                    </DropdownMenuItem></>}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
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


function TableSkeleton() {
    return (
        <div className="rounded-md border mt-4">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        {[...Array(5)].map((_, i) => (
                           <TableHead key={i}><Skeleton className="h-5 w-24" /></TableHead>
                        ))}
                         <TableHead className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {[...Array(4)].map((_, i) => (
                        <TableRow key={i} className="border-none">
                             {[...Array(5)].map((_, j) => (
                                <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                             ))}
                            <TableCell>
                                <div className="flex justify-end gap-2">
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
