
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
import { Download, Loader2 } from 'lucide-react';
import type { Procurement, Signature, ChecklistItem } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';

interface ProcurementSummaryDialogProps {
  procurement: Procurement;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PDFDocument = React.forwardRef<HTMLDivElement, { procurement: Procurement }>(({ procurement }, ref) => {
    
    const getSignatureDescription = (phaseId: number, type: 'submittedBy' | 'receivedBy') => {
        if (type === 'submittedBy') {
            if (phaseId === 2 || phaseId === 5) return 'Supply Unit';
        }
        if (type === 'receivedBy') {
            switch (phaseId) {
                case 1: return 'Supply Unit/Assigned Personnel';
                case 3: return 'Budget Unit';
                case 4: return 'Supply Unit';
                case 6: return 'Accounting Unit';
            }
        }
        return null;
    };

    const renderSignature = (signature: Signature | null, description: string | null = null) => {
        if (!signature || !signature.name) {
            return <div style={{ height: '100%', boxSizing: 'border-box', verticalAlign: 'middle', textAlign: 'center' }}></div>;
        }
        return (
            <div style={{ padding: '2px', fontSize: '8px', textAlign: 'left', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', boxSizing: 'border-box' }}>
                <div style={{ wordWrap: 'break-word' }}>
                    <span>Name: </span>
                    <span style={{ fontWeight: '600' }}>{signature.name}</span>
                    {description && <div style={{fontSize: '7px', fontStyle: 'italic', color: '#333'}}>{description}</div>}
                </div>
                <div style={{ flexGrow: 1, margin: '2px 0', display: 'flex', flexDirection: 'column' }}>
                    <span style={{ marginBottom: '1px' }}>Signature:</span>
                    {signature.signatureDataUrl && (
                        <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                             <img src={signature.signatureDataUrl} alt="Signature" style={{ maxHeight: '30px', maxWidth: '100%', objectFit: 'contain' }} />
                        </div>
                    )}
                </div>
                <div>
                    <p style={{ margin: '0' }}>
                        <span>Date: </span>
                        <span style={{ fontWeight: '600' }}>{signature.date ? format(new Date(signature.date), 'MM/dd/yyyy') : ''}</span>
                    </p>
                    <p style={{ margin: '0', wordWrap: 'break-word' }}>
                        <span>Remarks: </span>
                        <span style={{ fontWeight: '600' }}>{signature.remarks}</span>
                    </p>
                </div>
            </div>
        );
    };
    
    const renderChecklist = (checklist: ChecklistItem[]) => {
        return (
            <div style={{ fontSize: '9px', textAlign: 'left', padding: '2px' }}>
                {checklist.map(item => (
                    <div key={item.id} style={{ padding: '0.5px 0', wordWrap: 'break-word', display: 'flex', alignItems: 'start' }}>
                        <span style={{ marginRight: '4px', minWidth: '12px' }}>{item.checked ? '☑' : '☐'}</span>
                        <span>{item.label}</span>
                    </div>
                ))}
            </div>
        );
    }
    
    const renderPhaseTable = (phases: Procurement['phases'], title: string) => {
        const tableHeader = (
            <thead>
                <tr style={{ fontWeight: 'bold', backgroundColor: '#E0E0E0', fontSize: '9px' }}>
                    <td style={{ border: '1px solid black', padding: '2px', textAlign: 'center', verticalAlign: 'middle', width: '10%' }}>PHASE</td>
                    <td style={{ border: '1px solid black', padding: '2px', textAlign: 'center', verticalAlign: 'middle', width: '40%' }}>PARTICULARS</td>
                    <td style={{ border: '1px solid black', padding: '2px', textAlign: 'center', verticalAlign: 'middle', width: '25%' }}>SUBMITTED BY</td>
                    <td style={{ border: '1px solid black', padding: '2px', textAlign: 'center', verticalAlign: 'middle', width: '25%' }}>RECEIVED BY</td>
                </tr>
            </thead>
        );

        return (
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', fontSize: '10px', tableLayout: 'fixed' }}>
                {tableHeader}
                <tbody>
                    {phases.map(phase => (
                        <tr key={phase.id}>
                            <td style={{ border: '1px solid black', padding: '2px', fontWeight: 'bold', textAlign: 'center', verticalAlign: 'middle' }}>{phase.id}</td>
                            <td style={{ border: '1px solid black', padding: '0', verticalAlign: 'top' }}>{renderChecklist(phase.checklist)}</td>
                            <td style={{ border: '1px solid black', padding: '0', verticalAlign: 'top' }}>{renderSignature(phase.submittedBy, getSignatureDescription(phase.id, 'submittedBy'))}</td>
                            <td style={{ border: '1px solid black', padding: '0', verticalAlign: 'top' }}>{renderSignature(phase.receivedBy, getSignatureDescription(phase.id, 'receivedBy'))}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    }

    const projectTypes: Procurement['projectType'][] = ['ILCDB-DWIA', 'SPARK', 'TECH4ED-DTC', 'PROJECT CLICK', 'OTHERS'];
    
    return (
        <div ref={ref} style={{ backgroundColor: 'white', color: 'black', fontFamily: 'Helvetica, sans-serif', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: '210mm', height: '297mm', padding: '10mm', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
                 <header style={{ marginBottom: '8px', padding: '8px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <tbody>
                            <tr>
                                <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '32px' }}>
                                        <img src="/logos/ilcdb.png" alt="ILCDB Logo" style={{ height: '55px', width: 'auto' }} />
                                        <img src="/logos/dtc.png" alt="DTC Logo" style={{ height: '55px', width: 'auto' }}/>
                                        <img src="/logos/spark.png" alt="SPARK Logo" style={{ height: '55px', width: 'auto' }} />
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                 </header>

                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', fontSize: '10px', marginBottom: '8px' }}>
                    <tbody>
                        <tr>
                            <td style={{ border: '1px solid black', padding: '4px', fontWeight: 'bold', width: '25%', verticalAlign: 'middle' }}>PROJECT</td>
                            <td style={{ border: '1px solid black', padding: '4px' }} colSpan={3}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'nowrap' }}>
                                    {projectTypes.map(pt => (
                                        <div key={pt} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <span style={{ fontSize: '12px' }}>{procurement.projectType === pt ? '☑' : '☐'}</span>
                                            <label style={{ fontSize: '10px', fontWeight: '600' }}>{pt}</label>
                                        </div>
                                    ))}
                                    {procurement.projectType === 'OTHERS' && <span style={{fontSize: '10px'}}>: {procurement.otherProjectType}</span>}
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td style={{ border: '1px solid black', padding: '4px', fontWeight: 'bold' }}>ACTIVITY / PROCUREMENT (SVP)</td>
                            <td style={{ border: '1px solid black', padding: '4px', fontWeight: '600' }} colSpan={3}>{procurement.title}</td>
                        </tr>
                        <tr>
                            <td style={{ border: '1px solid black', padding: '4px', fontWeight: 'bold' }}>AMOUNT</td>
                            <td style={{ border: '1px solid black', padding: '4px', fontWeight: '600', width: '35%' }}>{formatCurrency(procurement.amount)}</td>
                            <td style={{ border: '1px solid black', padding: '4px', fontWeight: 'bold', width: '15%' }}>PR NUMBER:</td>
                            <td style={{ border: '1px solid black', padding: '4px', fontWeight: '600', width: '25%' }}>{procurement.prNumber}</td>
                        </tr>
                    </tbody>
                </table>
                
                <h3 style={{ border: '1px solid black', padding: '3px 4px', fontWeight: 'bold', textAlign: 'center', verticalAlign: 'middle', fontSize: '11px', backgroundColor: '#F5F5F5', margin: '8px 0 8px 0' }}>
                    PROCUREMENT REQUIREMENTS
                </h3>
                {renderPhaseTable(procurement.phases, "PROCUREMENT REQUIREMENTS")}
                
                <footer style={{ marginTop: 'auto', fontSize: '10px', textAlign: 'left' }}>
                    <p style={{margin: 0}}>Procurement Number: 2025-___</p>
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
        const canvas = await html2canvas(printArea, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            windowWidth: printArea.scrollWidth,
            windowHeight: printArea.scrollHeight,
        });
        
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const canvasAspectRatio = canvasWidth / canvasHeight;
        const pdfAspectRatio = pdfWidth / pdfHeight;

        let renderWidth, renderHeight;

        if (canvasAspectRatio > pdfAspectRatio) {
            renderWidth = pdfWidth;
            renderHeight = pdfWidth / canvasAspectRatio;
        } else {
            renderHeight = pdfHeight;
            renderWidth = pdfHeight * canvasAspectRatio;
        }

        const xOffset = (pdfWidth - renderWidth) / 2;
        const yOffset = (pdfHeight - renderHeight) / 2;

        pdf.addImage(canvas.toDataURL('image/png', 1.0), 'PNG', xOffset, yOffset, renderWidth, renderHeight, undefined, 'FAST');
        pdf.save(`procurement-summary-${procurement.prNumber}.pdf`);

    } catch (error) {
        console.error('Error generating PDF:', error);
    } finally {
        setIsDownloading(false);
    }
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
        
        <div className="max-h-[80vh] overflow-y-auto p-2 border rounded-md bg-muted">
            <div className="bg-white">
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
