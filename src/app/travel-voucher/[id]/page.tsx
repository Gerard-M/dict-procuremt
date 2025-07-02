import { getTravelVoucherById } from '@/lib/data';
import { TravelVoucherDetailView } from '@/components/travel-voucher-detail-view';
import { Plane, Home } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function TravelVoucherDetailPage({ params }: { params: { id: string } }) {
  const travelVoucher = await getTravelVoucherById(params.id);

  if (!travelVoucher) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <Plane className="w-16 h-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold">Travel Voucher Not Found</h1>
        <p className="text-muted-foreground">The record you are looking for does not exist.</p>
        <Button asChild className="mt-4">
          <Link href="/travel-voucher">
            <Home className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    );
  }

  // The object from `getTravelVoucherById` needs to be serializable to pass to the client component.
  const serializableTravelVoucher = {
    ...travelVoucher,
    createdAt: travelVoucher.createdAt.toISOString(),
    updatedAt: travelVoucher.updatedAt.toISOString(),
    phase: {
      ...travelVoucher.phase,
      submittedBy: travelVoucher.phase.submittedBy ? { ...travelVoucher.phase.submittedBy, date: travelVoucher.phase.submittedBy.date?.toISOString() || null } : null,
      receivedBy: travelVoucher.phase.receivedBy ? { ...travelVoucher.phase.receivedBy, date: travelVoucher.phase.receivedBy.date?.toISOString() || null } : null,
    }
  };

  return <TravelVoucherDetailView initialTravelVoucher={serializableTravelVoucher} />;
}
