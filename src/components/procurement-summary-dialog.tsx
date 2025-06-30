
'use client';

import React, { useRef } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Loader2, CheckSquare, Briefcase, Calendar, FileText } from 'lucide-react';
import type { Procurement, ProcurementPhase } from '@/lib/types';
import { formatCurrency, cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Badge } from './ui/badge';

interface ProcurementSummaryDialogProps {
  procurement: Procurement;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PhaseSummaryCard = ({ phase }: { phase: ProcurementPhase }) => {
  const checkedItems = phase.checklist.filter(item => item.checked);

  return (
    <div className="bg-card text-card-foreground rounded-xl border shadow-sm flex flex-col h-full" style={{ breakInside: 'avoid' }}>
      <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="tracking-tight text-base font-bold text-primary">{phase.name}</h3>
        <Badge variant={phase.isCompleted ? 'default' : 'outline'} className={cn(phase.isCompleted && 'bg-green-600 text-white')}>
          {phase.isCompleted ? 'Completed' : 'In Progress'}
        </Badge>
      </div>
      
      <div className="p-6 pt-0 space-y-6">
        <div>
          <h4 className="font-semibold mb-2 text-foreground/80">Completed Items</h4>
          {checkedItems.length > 0 ? (
            <div className="space-y-2 text-sm max-h-48 overflow-y-auto pr-2">
              {checkedItems.map(item => (
                <div key={item.id} className="flex items-start gap-2.5">
                  <CheckSquare className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">No items have been completed.</p>
          )}
        </div>

        <div className="bg-muted/50 p-4 rounded-lg space-y-4">
          <div>
            <h5 className="font-semibold mb-3 text-sm text-foreground">Submitted By</h5>
            {phase.submittedBy ? (
              <div className="text-xs space-y-2 text-muted-foreground">
                {phase.submittedBy.signatureDataUrl && (
                  <div className="mb-2 border bg-white rounded-md p-1 h-20 flex items-center justify-center">
                    <img src={phase.submittedBy.signatureDataUrl} alt="Signature" className="max-h-full max-w-full object-contain" />
                  </div>
                )}
                <p><strong>Name:</strong> {phase.submittedBy.name}</p>
                <p><strong>Date:</strong> {phase.submittedBy.date ? format(new Date(phase.submittedBy.date), 'PPp') : 'N/A'}</p>
                {phase.submittedBy.remarks && <p><strong>Remarks:</strong> {phase.submittedBy.remarks}</p>}
              </div>
            ) : <p className="text-xs text-muted-foreground italic">Not yet submitted.</p>}
          </div>

          <div>
            <h5 className="font-semibold mb-3 text-sm text-foreground">Received By</h5>
            {phase.receivedBy ? (
               <div className="text-xs space-y-2 text-muted-foreground">
                {phase.receivedBy.signatureDataUrl && (
                  <div className="mb-2 border bg-white rounded-md p-1 h-20 flex items-center justify-center">
                    <img src={phase.receivedBy.signatureDataUrl} alt="Signature" className="max-h-full max-w-full object-contain" />
                  </div>
                )}
                <p><strong>Name:</strong> {phase.receivedBy.name}</p>
                <p><strong>Date:</strong> {phase.receivedBy.date ? format(new Date(phase.receivedBy.date), 'PPp') : 'N/A'}</p>
                {phase.receivedBy.remarks && <p><strong>Remarks:</strong> {phase.receivedBy.remarks}</p>}
              </div>
            ) : <p className="text-xs text-muted-foreground italic">Not yet received.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};


export function ProcurementSummaryDialog({ procurement, open, onOpenChange }: ProcurementSummaryDialogProps) {
  const summaryRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = React.useState(false);

  const handleDownloadPdf = async () => {
    const printArea = summaryRef.current;
    if (!printArea) return;

    setIsDownloading(true);

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageElements = Array.from(printArea.querySelectorAll<HTMLDivElement>('.pdf-page'));

    for (let i = 0; i < pageElements.length; i++) {
        const pageEl = pageElements[i];
        try {
            const canvas = await html2canvas(pageEl, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                windowWidth: 1400,
            });

            if (i > 0) {
                pdf.addPage();
            }

            const imgData = canvas.toDataURL('image/png');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgProps = pdf.getImageProperties(imgData);
            const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, Math.min(imgHeight, pdfHeight));

        } catch (error) {
            console.error(`Error generating page ${i + 1} of PDF:`, error);
            setIsDownloading(false);
            return;
        }
    }
    
    pdf.save(`procurement-summary-${procurement.prNumber}.pdf`);
    setIsDownloading(false);
  };

  const phasePairs = React.useMemo(() => 
    procurement.phases.reduce<[ProcurementPhase, ProcurementPhase | undefined][]>((acc, _, index, array) => {
      if (index % 2 === 0) {
        acc.push([array[index], array[index + 1]]);
      }
      return acc;
    }, []),
  [procurement.phases]);
  
  const PageHeader = () => (
     <>
        <div className="space-y-1 text-center mb-8">
            <Briefcase className="mx-auto h-10 w-10 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Procurement Process Report</h1>
            <p className="text-muted-foreground text-sm">ILCDB Procurement Management System</p>
            <p className="text-xs text-muted-foreground/80 pt-1">Generated on: {format(new Date(), 'PPP p')}</p>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm mb-8 p-6">
            <h2 className="text-lg font-semibold mb-4 text-primary flex items-center gap-2"><FileText className="h-5 w-5" />Procurement Details</h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                <div className="space-y-1">
                    <p className="font-medium text-muted-foreground">Title</p>
                    <p className="font-semibold text-foreground">{procurement.title}</p>
                </div>
                <div className="space-y-1">
                    <p className="font-medium text-muted-foreground">PR Number</p>
                    <p className="font-semibold text-foreground">{procurement.prNumber}</p>
                </div>
                <div className="space-y-1">
                    <p className="font-medium text-muted-foreground">Amount</p>
                    <p className="font-semibold text-foreground">{formatCurrency(procurement.amount)}</p>
                </div>
                 <div className="space-y-1">
                    <p className="font-medium text-muted-foreground">Project Type</p>
                    <p className="font-semibold text-foreground">{procurement.projectType === 'OTHERS' ? procurement.otherProjectType : procurement.projectType}</p>
                </div>
                 <div className="space-y-1">
                    <p className="font-medium text-muted-foreground">Status</p>
                    <p className="font-semibold text-foreground capitalize">{procurement.status}</p>
                </div>
                 <div className="space-y-1">
                    <p className="font-medium text-muted-foreground">Created</p>
                    <p className="font-semibold text-foreground">{format(procurement.createdAt, 'PPP')}</p>
                </div>
            </div>
        </div>
     </>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle>Procurement Process Summary</DialogTitle>
          <DialogDescription>
            A complete overview of the procurement process for {procurement.title}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="max-h-[80vh] overflow-y-auto p-2 border rounded-md bg-muted/30">
          <div ref={summaryRef} className="bg-white text-black font-sans">
             
            {/* Page 1 */}
            {phasePairs[0] && (
              <div className="pdf-page p-8">
                <PageHeader />
                <h2 className="text-base font-semibold mb-4 text-muted-foreground text-center">Phase Progress (1 & 2)</h2>
                <div className="grid grid-cols-2 gap-6">
                    {phasePairs[0][0] && <PhaseSummaryCard phase={phasePairs[0][0]} />}
                    {phasePairs[0][1] ? <PhaseSummaryCard phase={phasePairs[0][1]} /> : <div />}
                </div>
              </div>
            )}

            {/* Page 2 */}
            {phasePairs[1] && (
              <div className="pdf-page p-8">
                 <PageHeader />
                <h2 className="text-base font-semibold mb-4 text-muted-foreground text-center">Phase Progress (3 & 4)</h2>
                <div className="grid grid-cols-2 gap-6">
                    {phasePairs[1][0] && <PhaseSummaryCard phase={phasePairs[1][0]} />}
                    {phasePairs[1][1] ? <PhaseSummaryCard phase={phasePairs[1][1]} /> : <div />}
                </div>
              </div>
            )}
            
            {/* Page 3 */}
            {phasePairs[2] && (
              <div className="pdf-page p-8">
                 <PageHeader />
                 <h2 className="text-base font-semibold mb-4 text-muted-foreground text-center">Phase Progress (5 & 6)</h2>
                 <div className="grid grid-cols-2 gap-6">
                    {phasePairs[2][0] && <PhaseSummaryCard phase={phasePairs[2][0]} />}
                    {phasePairs[2][1] ? <PhaseSummaryCard phase={phasePairs[2][1]} /> : <div />}
                 </div>
              </div>
            )}

          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={handleDownloadPdf} disabled={isDownloading}>
            {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Download PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

