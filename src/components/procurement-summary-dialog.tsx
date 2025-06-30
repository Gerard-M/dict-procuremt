
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
                    <p className="mb-1">Signature:</p>
                    {signature.signatureDataUrl && (
                        <div className="h-10 flex items-center justify-center my-1">
                             <img src={signature.signatureDataUrl} alt="Signature" className="max-h-full max-w-full object-contain" />
                        </div>
                    )}
                </div>
                <div>
                    <p>Date: <span className="font-semibold">{signature.date ? format(new Date(signature.date), 'MM/dd/yyyy') : ''}</span></p>
                    <p>Remarks: <span className="font-semibold break-words">{signature.remarks}</span></p>
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
    
    // Renders a full table row for a given phase.
    const renderPhaseRow = (phase: ProcurementPhase) => {
        return (
            <tr key={phase.id}>
                <td className="border border-black p-2 align-top w-[50%]">{renderChecklist(phase.checklist)}</td>
                <td className="border border-black p-0 align-top w-[25%]">{renderSignature(phase.submittedBy)}</td>
                <td className="border border-black p-0 align-top w-[25%]">{renderSignature(phase.receivedBy)}</td>
            </tr>
        )
    };

    const projectTypes: Procurement['projectType'][] = ['ILCDB-DWIA', 'SPARK', 'TECH4ED-DTC', 'PROJECT CLICK', 'OTHERS'];

    return (
        <div ref={ref} className="bg-white text-black p-8 font-sans">
            <div className="w-[800px] mx-auto">
                 {/* Header */}
                <header className="flex justify-between items-center mb-6">
                    <div className="border-2 border-blue-800 rounded-full h-20 w-20 flex items-center justify-center flex-shrink-0">
                        <p className="text-blue-800 font-bold text-lg">ILCDB</p>
                    </div>
                    <div className="text-center mx-4">
                        <p className="font-bold text-lg leading-tight">DIGITAL TRANSFORMATION CENTERS</p>
                        <div className="bg-red-600 text-white font-bold text-xl p-1 mt-1 inline-block">TECH4ED</div>
                    </div>
                     <div className="border-2 border-yellow-500 rounded-full h-20 w-20 flex items-center justify-center flex-shrink-0">
                        <p className="text-yellow-500 font-bold text-lg">SPARK</p>
                    </div>
                </header>

                {/* Info Table */}
                <table className="w-full border-collapse border border-black text-sm">
                    <tbody>
                        <tr>
                            <td className="border border-black p-2 font-bold w-[30%]">PROJECT</td>
                            <td className="border border-black p-2" colSpan={2}>
                                <div className="flex items-center gap-x-4 flex-wrap">
                                    {projectTypes.map(pt => (
                                        <div key={pt} className="flex items-center gap-1.5">
                                            {procurement.projectType === pt ? <CheckSquare className="w-4 h-4 text-primary" /> : <Square className="w-4 h-4 text-muted-foreground" />}
                                            <label>{pt}</label>
                                        </div>
                                    ))}
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td className="border border-black p-2 font-bold">ACTIVITY / PROCUREMENT (SVP)</td>
                            <td className="border border-black p-2 font-semibold" colSpan={2}>{procurement.title}</td>
                        </tr>
                        <tr>
                            <td className="border border-black p-2 font-bold">AMOUNT</td>
                            <td className="border border-black p-2 font-semibold">{formatCurrency(procurement.amount)}</td>
                            <td className="border border-black p-2 font-bold">PR NUMBER: <span className="font-semibold">{procurement.prNumber}</span></td>
                        </tr>
                    </tbody>
                </table>

                {/* Main Content Table */}
                <table className="w-full border-collapse border-t-0 border border-black text-xs mt-[-1px]">
                     <thead>
                        <tr className="font-bold bg-gray-200 text-sm">
                            <td className="border border-black p-2 text-center w-[50%]">PARTICULARS</td>
                            <td className="border border-black p-2 text-center w-[25%]">SUBMITTED BY</td>
                            <td className="border border-black p-2 text-center w-[25%]">RECEIVED BY</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td rowSpan={3} className="border border-black p-2 font-bold align-middle text-center text-base">PRE-PROCUREMENT<br/>REQUIREMENTS</td>
                            {renderPhaseRow(procurement.phases[0]).props.children.slice(1)}
                        </tr>
                        {renderPhaseRow(procurement.phases[1])}
                        {renderPhaseRow(procurement.phases[2])}

                        <tr>
                            <td rowSpan={3} className="border border-black p-2 font-bold align-middle text-center text-base">POST-PROCUREMENT<br/>REQUIREMENTS</td>
                            {renderPhaseRow(procurement.phases[3]).props.children.slice(1)}
                        </tr>
                        {renderPhaseRow(procurement.phases[4])}
                        {renderPhaseRow(procurement.phases[5])}
                    </tbody>
                </table>
                
                <footer className="mt-8 text-sm">
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
            scale: 3,
            useCORS: true,
            backgroundColor: '#ffffff',
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
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
