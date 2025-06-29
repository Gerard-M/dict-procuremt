import { getProcurementById } from '@/lib/data';
import { ProcurementDetailView } from '@/components/procurement-detail-view';
import { Briefcase, Home } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function ProcurementDetailPage({ params }: { params: { id: string } }) {
  const procurement = await getProcurementById(params.id);

  if (!procurement) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <Briefcase className="w-16 h-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold">Procurement Not Found</h1>
        <p className="text-muted-foreground">The procurement record you are looking for does not exist.</p>
        <Button asChild className="mt-4">
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    );
  }

  // The object from `getProcurementById` needs to be serializable.
  // Convert Date objects to string or number.
  const serializableProcurement = {
    ...procurement,
    createdAt: procurement.createdAt.toISOString(),
    updatedAt: procurement.updatedAt.toISOString(),
    phases: procurement.phases.map(phase => ({
      ...phase,
      submittedBy: phase.submittedBy ? { ...phase.submittedBy, date: phase.submittedBy.date?.toISOString() || null } : null,
      receivedBy: phase.receivedBy ? { ...phase.receivedBy, date: phase.receivedBy.date?.toISOString() || null } : null,
    })),
  };

  return <ProcurementDetailView initialProcurement={serializableProcurement} />;
}
