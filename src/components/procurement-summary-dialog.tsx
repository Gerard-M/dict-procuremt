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
import { Download, Loader2, CheckSquare, Square } from 'lucide-react';
import type { Procurement, ProcurementPhase } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';

interface ProcurementSummaryDialogProps {
  procurement: Procurement;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PhaseSummaryCard = ({ phase }: { phase: ProcurementPhase }) => (
  <div className="border border-gray-300 p-4 rounded-lg flex flex-col h-full text-xs">
    <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-200">
      <h3 className="text-base font-bold text-gray-800">{phase.name}</h3>
      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${phase.isCompleted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
        {phase.isCompleted ? 'Completed' : 'In Progress'}
      </span>
    </div>
    
    {phase.checklist && phase.checklist.length > 0 && (
      <div className="mb-4">
        <h4 className="font-bold mb-2 text-gray-700">Checklist</h4>
        <div className="space-y-1.5 text-gray-600 max-h-48 overflow-y-auto pr-2">
          {phase.checklist.map(item => (
            <div key={item.id} className="flex items-start gap-2">
              {item.checked ? <CheckSquare className="w-3.5 h-3.5 text-green-700 flex-shrink-0 mt-0.5" /> : <Square className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />}
              <span className={item.checked ? 'text-gray-900' : 'text-gray-500'}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    )}
    
    <div className="mt-auto pt-4 border-t border-gray-200">
      <h4 className="font-bold mb-2 text-gray-700">Signatures</h4>
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
          <h5 className="font-bold mb-2 text-gray-600">Submitted By</h5>
          {phase.submittedBy ? (
            <div className="space-y-2">
              {phase.submittedBy.signatureDataUrl && (
                <div className="mt-1 border bg-white rounded-md p-1 h-24 flex items-center justify-center">
                  <img src={phase.submittedBy.signatureDataUrl} alt="Signature" className="max-h-full max-w-full object-contain" />
                </div>
              )}
              <p><strong>Name:</strong> {phase.submittedBy.name}</p>
              <p><strong>Date:</strong> {phase.submittedBy.date ? format(new Date(phase.submittedBy.date), 'PPpp') : 'N/A'}</p>
              <p><strong>Remarks:</strong> {phase.submittedBy.remarks || 'None'}</p>
            </div>
          ) : <p className="text-gray-400 italic">Not yet submitted.</p>}
        </div>
        <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
          <h5 className="font-bold mb-2 text-gray-600">Received By</h5>
          {phase.receivedBy ? (
            <div className="space-y-2">
              {phase.receivedBy.signatureDataUrl && (
                <div className="mt-1 border bg-white rounded-md p-1 h-24 flex items-center justify-center">
                  <img src={phase.receivedBy.signatureDataUrl} alt="Signature" className="max-h-full max-w-full object-contain" />
                </div>
              )}
              <p><strong>Name:</strong> {phase.receivedBy.name}</p>
              <p><strong>Date:</strong> {phase.receivedBy.date ? format(new Date(phase.receivedBy.date), 'PPpp') : 'N/A'}</p>
              <p><strong>Remarks:</strong> {phase.receivedBy.remarks || 'None'}</p>
            </div>
          ) : <p className="text-gray-400 italic">Not yet received.</p>}
        </div>
      </div>
    </div>
  </div>
);


export function ProcurementSummaryDialog({ procurement, open, onOpenChange }: ProcurementSummaryDialogProps) {
  const summaryRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = React.useState(false);

  const handleDownloadPdf = () => {
    const input = summaryRef.current;
    if (!input) return;

    setIsDownloading(true);

    html2canvas(input, { 
        scale: 2, 
        useCORS: true, 
        backgroundColor: '#ffffff',
        windowWidth: 1400 // Use a fixed width for consistent rendering
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasWidth / canvasHeight;
      const imgHeight = pdfWidth / ratio;
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`procurement-summary-${procurement.prNumber}.pdf`);
      setIsDownloading(false);
    }).catch(() => {
        setIsDownloading(false);
    });
  };

  const phasePairs = React.useMemo(() => 
    procurement.phases.reduce<[ProcurementPhase, ProcurementPhase | undefined][]>((acc, _, index, array) => {
      if (index % 2 === 0) {
        acc.push([array[index], array[index + 1]]);
      }
      return acc;
    }, []),
  [procurement.phases]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle>Procurement Process Summary</DialogTitle>
          <DialogDescription>
            A complete overview of the procurement process for {procurement.title}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="max-h-[80vh] overflow-y-auto p-1 border rounded-md bg-gray-100">
          <div ref={summaryRef} className="p-8 bg-white text-black font-serif">
             <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Procurement Process Report</h1>
                <p className="text-sm text-gray-500">ILCDB Procurement Management System</p>
                <p className="text-xs text-gray-400 mt-1">Generated on: {format(new Date(), 'PPP p')}</p>
             </div>
            
            <div className="mb-8 border-b-2 border-t-2 border-gray-300 py-4">
                <h2 className="text-lg font-bold text-gray-700 mb-3">Procurement Details</h2>
                <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm">
                    <div><strong className="text-gray-600 font-semibold">Title:</strong> {procurement.title}</div>
                    <div><strong className="text-gray-600 font-semibold">PR Number:</strong> {procurement.prNumber}</div>
                    <div><strong className="text-gray-600 font-semibold">Amount:</strong> {formatCurrency(procurement.amount)}</div>
                    <div><strong className="text-gray-600 font-semibold">Project Type:</strong> {procurement.projectType === 'OTHERS' ? procurement.otherProjectType : procurement.projectType}</div>
                    <div><strong className="text-gray-600 font-semibold">Status:</strong> <span className="capitalize font-medium">{procurement.status}</span></div>
                    <div><strong className="text-gray-600 font-semibold">Created:</strong> {format(procurement.createdAt, 'PPP')}</div>
                </div>
            </div>

            <h2 className="text-lg font-bold mb-4 text-gray-700">Phase Progress</h2>
            <div className="space-y-8">
                {phasePairs.map(([phase1, phase2], index) => (
                    <div key={index} className="grid grid-cols-2 gap-6" style={{ breakInside: 'avoid' }}>
                        {phase1 && <PhaseSummaryCard phase={phase1} />}
                        {phase2 ? <PhaseSummaryCard phase={phase2} /> : <div />}
                    </div>
                ))}
            </div>

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
