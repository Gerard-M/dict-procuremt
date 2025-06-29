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
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from 'lucide-react';
import type { Procurement } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

type SortKey = keyof Procurement | 'progress';

export function ProcurementTable({ procurements }: { procurements: Procurement[] }) {
  const [sortKey, setSortKey] = React.useState<SortKey>('createdAt');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('desc');

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
                  <Button variant="ghost" onClick={() => handleSort('amount')}>
                    Amount {renderSortArrow('amount')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('progress')}>
                    Phase Progress {renderSortArrow('progress')}
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedProcurements.map((procurement) => {
                const completedPhases = procurement.phases.filter(p => p.isCompleted).length;
                const totalPhases = procurement.phases.length;
                const progress = getProgress(procurement);

                return (
                  <TableRow key={procurement.id}>
                    <TableCell className="font-medium">
                        <Link href={`/procurements/${procurement.id}`} className="hover:underline text-primary">
                            {procurement.prNumber}
                        </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{procurement.title}</span>
                        <Badge variant="secondary" className="w-fit mt-1">{procurement.projectType}</Badge>
                      </div>
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
