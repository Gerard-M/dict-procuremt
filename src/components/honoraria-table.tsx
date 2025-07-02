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
import { ArrowUpDown, Edit, Loader2, Trash2 } from 'lucide-react';
import type { Honoraria } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type SortKey = keyof Honoraria | 'progress';

interface HonorariaTableProps {
  honoraria: Honoraria[];
  onEdit: (honoraria: Honoraria) => void;
  onDelete: (id: string) => Promise<void>;
}

export function HonorariaTable({ honoraria, onEdit, onDelete }: HonorariaTableProps) {
  const [sortKey, setSortKey] = React.useState<SortKey>('createdAt');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('desc');
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null);

  const getProgress = (record: Honoraria) => {
    return record.phase.isCompleted ? 100 : 0;
  };

  const sortedHonoraria = React.useMemo(() => {
    return [...honoraria].sort((a, b) => {
      let valA, valB;

      if (sortKey === 'progress') {
        valA = getProgress(a);
        valB = getProgress(b);
      } else {
        valA = a[sortKey as keyof Honoraria];
        valB = b[sortKey as keyof Honoraria];
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [honoraria, sortKey, sortDirection]);

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
  
  const handleDeleteConfirm = async (id: string) => {
    setIsDeleting(id);
    await onDelete(id);
  };

  if (honoraria.length === 0) {
    return (
      <Card className="mt-4">
        <CardContent className="p-10 text-center text-muted-foreground">
          No honoraria records found.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('speakerName')}>
                    Speaker Name {renderSortArrow('speakerName')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('activityTitle')}>
                    Activity Title {renderSortArrow('activityTitle')}
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
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedHonoraria.map((record) => {
                const progress = getProgress(record);

                return (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                        <Link href={`/honoraria/${record.id}`} className="hover:underline text-primary">
                            {record.speakerName}
                        </Link>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{record.activityTitle}</span>
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
                    <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => onEdit(record)}>
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                            </Button>
                             <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" disabled={isDeleting === record.id}>
                                  {isDeleting === record.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the honoraria record.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteConfirm(record.id)} className="bg-destructive hover:bg-destructive/90">
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
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
  );
}
