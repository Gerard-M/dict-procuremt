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
import type { Procurement } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';

interface ProcurementSummaryDialogProps {
  procurement: Procurement;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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
        backgroundColor: '#ffffff'
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Procurement Process Summary</DialogTitle>
          <DialogDescription>
            A complete overview of the procurement process for {procurement.title}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="max-h-[70vh] overflow-y-auto p-1 border rounded-md">
          <div ref={summaryRef} className="p-6 bg-white text-black font-sans">
             <h1 className="text-2xl font-bold text-center mb-2 text-gray-800">Procurement Summary</h1>
             <p className="text-center text-sm text-gray-500 mb-6">ILCDB Procurement System</p>
            
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-6 border-b border-gray-200 pb-4 text-sm">
                <div><strong className="text-gray-600">Title:</strong> {procurement.title}</div>
                <div><strong className="text-gray-600">PR Number:</strong> {procurement.prNumber}</div>
                <div><strong className="text-gray-600">Amount:</strong> {formatCurrency(procurement.amount)}</div>
                <div><strong className="text-gray-600">Project Type:</strong> {procurement.projectType === 'OTHERS' ? procurement.otherProjectType : procurement.projectType}</div>
                <div><strong className="text-gray-600">Status:</strong> <span className="capitalize">{procurement.status}</span></div>
                <div><strong className="text-gray-600">Created:</strong> {format(procurement.createdAt, 'PPP')}</div>
            </div>

            <h2 className="text-xl font-semibold mb-4 text-gray-700">Phase Progress</h2>
            <div className="space-y-6">
                {procurement.phases.map(phase => (
                    <div key={phase.id} className="border border-gray-200 p-4 rounded-lg shadow-sm">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-lg font-semibold text-gray-800">{phase.name}</h3>
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${phase.isCompleted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {phase.isCompleted ? 'Completed' : 'In Progress'}
                            </span>
                        </div>
                        
                        {phase.checklist && phase.checklist.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <h4 className="font-semibold mb-2 text-gray-600">Checklist</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                                    {phase.checklist.map(item => (
                                        <div key={item.id} className="flex items-start gap-2">
                                            {item.checked ? <CheckSquare className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" /> : <Square className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />}
                                            <span className={item.checked ? 'text-gray-800' : 'text-gray-500'}>{item.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <h4 className="font-semibold mb-2 text-gray-600">Signatures</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                               <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
                                    <h5 className="font-semibold mb-2 text-gray-600">Submitted By</h5>
                                    {phase.submittedBy ? (
                                        <div className="space-y-2">
                                            {phase.submittedBy.signatureDataUrl && (
                                                <div>
                                                    <p className="text-xs font-medium text-gray-500">Signature</p>
                                                    <div className="mt-1 border bg-white rounded-md p-1">
                                                        <img src={phase.submittedBy.signatureDataUrl} alt="Signature" className="h-20 w-full object-contain" />
                                                    </div>
                                                </div>
                                            )}
                                            <div>
                                                <p><strong>Name:</strong> {phase.submittedBy.name}</p>
                                                <p><strong>Date:</strong> {phase.submittedBy.date ? format(new Date(phase.submittedBy.date), 'PPP') : 'N/A'}</p>
                                                <p><strong>Remarks:</strong> {phase.submittedBy.remarks || 'None'}</p>
                                            </div>
                                        </div>
                                    ) : <p className="text-gray-400">Not yet submitted.</p>}
                               </div>
                               <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
                                    <h5 className="font-semibold mb-2 text-gray-600">Received By</h5>
                                    {phase.receivedBy ? (
                                        <div className="space-y-2">
                                            {phase.receivedBy.signatureDataUrl && (
                                                <div>
                                                    <p className="text-xs font-medium text-gray-500">Signature</p>
                                                    <div className="mt-1 border bg-white rounded-md p-1">
                                                        <img src={phase.receivedBy.signatureDataUrl} alt="Signature" className="h-20 w-full object-contain" />
                                                    </div>
                                                </div>
                                            )}
                                            <div>
                                                <p><strong>Name:</strong> {phase.receivedBy.name}</p>
                                                <p><strong>Date:</strong> {phase.receivedBy.date ? format(new Date(phase.receivedBy.date), 'PPP') : 'N/A'}</p>
                                                <p><strong>Remarks:</strong> {phase.receivedBy.remarks || 'None'}</p>
                                            </div>
                                        </div>
                                    ) : <p className="text-gray-400">Not yet received.</p>}
                               </div>
                            </div>
                        </div>
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
