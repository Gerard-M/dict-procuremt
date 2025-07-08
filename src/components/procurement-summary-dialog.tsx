
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
import { Download, Loader2, Square, CheckSquare } from 'lucide-react';
import type { Procurement, ProcurementPhase, Signature, ChecklistItem } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';

interface ProcurementSummaryDialogProps {
  procurement: Procurement;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PDFDocument = React.forwardRef<HTMLDivElement, { procurement: Procurement }>(({ procurement }, ref) => {
    
    // Renders the signature block. Returns an empty div if no signature to maintain cell structure.
    const renderSignature = (signature: Signature | null) => {
        if (!signature || !signature.name) {
            return <div className="p-1 h-full box-border"></div>;
        }
        return (
            <div className="p-1 text-left text-[9px] flex flex-col justify-between h-full box-border">
                <div>
                    <p>Name: <span className="font-semibold">{signature.name}</span></p>
                </div>
                <div className="flex-grow my-1">
                    <p className="mb-1 text-[8px]">Signature:</p>
                    {signature.signatureDataUrl && (
                        <div className="h-10 flex items-center justify-center my-1">
                             <img src={signature.signatureDataUrl} alt="Signature" className="max-h-full max-w-full object-contain" />
                        </div>
                    )}
                </div>
                <div>
                    <p>Date: <span className="font-semibold">{signature.date ? format(new Date(signature.date), 'MM/dd/yyyy') : ''}</span></p>
                    <p className="font-semibold break-words"><span className="font-normal">Remarks:</span> {signature.remarks}</p>
                </div>
            </div>
        );
    };
    
    // Renders the checklist for a given phase.
    const renderChecklist = (checklist: ChecklistItem[]) => {
        return (
            <ul className="space-y-1 text-[10px] text-left">
                {checklist.map(item => (
                    <li key={item.id} className="flex items-start gap-1.5">
                        {item.checked ? <CheckSquare className="w-3 h-3 text-primary flex-shrink-0 mt-px" /> : <Square className="w-3 h-3 text-muted-foreground flex-shrink-0 mt-px" />}
                        <span>{item.label}</span>
                    </li>
                ))}
            </ul>
        );
    }

    const projectTypes: Procurement['projectType'][] = ['ILCDB-DWIA', 'SPARK', 'TECH4ED-DTC', 'PROJECT CLICK', 'OTHERS'];
    
    return (
        <div ref={ref} className="bg-white text-black p-8 font-sans">
            <div className="w-[800px] mx-auto">
                 {/* Header */}
                <header className="flex justify-between items-center mb-2">
                    <div className="border-2 border-blue-800 rounded-full h-12 w-12 flex items-center justify-center flex-shrink-0">
                        <p className="text-blue-800 font-bold text-xs">ILCDB</p>
                    </div>
                    <div className="text-center mx-2">
                        <p className="font-bold text-sm leading-tight">DIGITAL TRANSFORMATION CENTERS</p>
                        <div className="bg-red-600 text-white font-bold text-sm p-0.5 mt-1 inline-block">TECH4ED</div>
                    </div>
                     <div className="border-2 border-yellow-500 rounded-full h-12 w-12 flex items-center justify-center flex-shrink-0">
                        <p className="text-yellow-500 font-bold text-xs">SPARK</p>
                    </div>
                </header>

                {/* Info Table */}
                <table className="w-full border-collapse border border-black text-xs mb-2">
                    <tbody>
                        <tr>
                            <td className="border border-black p-1 font-bold" style={{width: '25%'}}>PROJECT</td>
                            <td className="border border-black p-1" colSpan={3}>
                                <div className="flex items-center gap-x-2 flex-wrap">
                                    {projectTypes.map(pt => (
                                        <div key={pt} className="flex items-center gap-1">
                                            {procurement.projectType === pt ? <CheckSquare className="w-3 h-3 text-primary" /> : <Square className="w-3 h-3 text-muted-foreground" />}
                                            <label className="text-xs font-semibold">{pt}</label>
                                        </div>
                                    ))}
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td className="border border-black p-1 font-bold">ACTIVITY / PROCUREMENT (SVP)</td>
                            <td className="border border-black p-1 font-semibold" colSpan={3}>{procurement.title}</td>
                        </tr>
                        <tr>
                            <td className="border border-black p-1 font-bold">AMOUNT</td>
                            <td className="border border-black p-1 font-semibold" style={{width: '35%'}}>{formatCurrency(procurement.amount)}</td>
                            <td className="border border-black p-1 font-bold" style={{width: '15%'}}>PR NUMBER:</td>
                            <td className="border border-black p-1 font-semibold" style={{width: '25%'}}>{procurement.prNumber}</td>
                        </tr>
                    </tbody>
                </table>

                {/* Main Content Table */}
                <table className="w-full border-collapse border border-black text-sm">
                     <thead>
                        <tr className="font-bold bg-gray-200 text-xs">
                            <td className="border border-black p-1 text-center" style={{width: '10%'}}>PHASE</td>
                            <td className="border border-black p-1 text-center" style={{width: '55%'}}>PARTICULARS</td>
                            <td className="border border-black p-1 text-center" style={{width: '17.5%'}}>SUBMITTED BY</td>
                            <td className="border border-black p-1 text-center" style={{width: '17.5%'}}>RECEIVED BY</td>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Pre-procurement */}
                        <tr>
                            <td colSpan={4} className="border border-black p-1 font-bold text-center text-sm bg-gray-100">
                                PRE-PROCUREMENT REQUIREMENTS
                            </td>
                        </tr>
                        {procurement.phases.slice(0, 3).map(phase => (
                            <tr key={phase.id}>
                                <td className="border border-black p-1 font-bold text-center align-middle">{phase.id}</td>
                                <td className="border border-black p-1 align-top">{renderChecklist(phase.checklist)}</td>
                                <td className="border border-black p-0 align-top">{renderSignature(phase.submittedBy)}</td>
                                <td className="border border-black p-0 align-top">{renderSignature(phase.receivedBy)}</td>
                            </tr>
                        ))}
                        {/* Post-procurement */}
                        <tr>
                            <td colSpan={4} className="border border-black p-1 font-bold text-center text-sm bg-gray-100">
                                POST-PROCUREMENT REQUIREMENTS
                            </td>
                        </tr>
                        {procurement.phases.slice(3, 6).map(phase => (
                            <tr key={phase.id}>
                                <td className="border border-black p-1 font-bold text-center align-middle">{phase.id}</td>
                                <td className="border border-black p-1 align-top">{renderChecklist(phase.checklist)}</td>
                                <td className="border border-black p-0 align-top">{renderSignature(phase.submittedBy)}</td>
                                <td className="border border-black p-0 align-top">{renderSignature(phase.receivedBy)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                <footer className="mt-4 text-[10px]">
                    <p>Procurement Number: 2025-___</p>
                </footer>
            </div>
        </div>
    );
});

PDFDocument.displayName = 'PDFDocument';


export function ProcurementSummaryDialog({ procurement, open, onOpenChange }: ProcurementSummaryDialogProps) {
  const summaryRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = React.useState(false);

  const handleDownloadPdf = async () => {
    const printArea = summaryRef.current;
    if (!printArea) return;

    setIsDownloading(true);

    try {
        const canvas = await html2canvas(printArea.querySelector('.w-\\[800px\\]') || printArea, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
        });

        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const page_width = pdf.internal.pageSize.getWidth();
        const page_height = pdf.internal.pageSize.getHeight();
        
        const marginX = 15;
        const marginY = 5; // Reduced top margin

        let content_width = page_width - (marginX * 2);
        
        const img_width = canvas.width;
        const img_height = canvas.height;
        const aspect_ratio = img_height / img_width;

        let content_height = content_width * aspect_ratio;

        // Check if content is taller than the page allows and scale if necessary
        if (content_height > page_height - (marginY * 2)) {
            content_height = page_height - (marginY * 2);
            content_width = content_height / aspect_ratio;
        }

        // Center the content horizontally
        const finalX = (page_width - content_width) / 2;

        pdf.addImage(imgData, 'PNG', finalX, marginY, content_width, content_height, undefined, 'FAST');
        pdf.save(`procurement-summary-${procurement.prNumber}.pdf`);

    } catch (error) {
        console.error(`Error generating PDF:`, error);
    } finally {
        setIsDownloading(false);
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-7xl">
        <DialogHeader>
          <DialogTitle>Procurement Process Summary</DialogTitle>
          <DialogDescription>
            A complete overview of the procurement process for {procurement.title}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="max-h-[80vh] overflow-y-auto p-2 border rounded-md bg-muted">
            <div className="p-4 bg-gray-200">
                <PDFDocument ref={summaryRef} procurement={procurement} />
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
