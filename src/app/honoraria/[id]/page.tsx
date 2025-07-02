import { getHonorariaById } from '@/lib/data';
import { HonorariaDetailView } from '@/components/honoraria-detail-view';
import { Award, Home } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function HonorariaDetailPage({ params }: { params: { id: string } }) {
  const honoraria = await getHonorariaById(params.id);

  if (!honoraria) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <Award className="w-16 h-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold">Honoraria Record Not Found</h1>
        <p className="text-muted-foreground">The record you are looking for does not exist.</p>
        <Button asChild className="mt-4">
          <Link href="/honoraria">
            <Home className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    );
  }

  // The object from `getHonorariaById` needs to be serializable to pass to the client component.
  const serializableHonoraria = {
    ...honoraria,
    createdAt: honoraria.createdAt.toISOString(),
    updatedAt: honoraria.updatedAt.toISOString(),
    phase: {
      ...honoraria.phase,
      submittedBy: honoraria.phase.submittedBy ? { ...honoraria.phase.submittedBy, date: honoraria.phase.submittedBy.date?.toISOString() || null } : null,
      receivedBy: honoraria.phase.receivedBy ? { ...honoraria.phase.receivedBy, date: honoraria.phase.receivedBy.date?.toISOString() || null } : null,
    }
  };

  return <HonorariaDetailView initialHonoraria={serializableHonoraria} />;
}
