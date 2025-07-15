
'use client';

import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
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
  isForExport?: boolean;
}

const PDFDocument = React.forwardRef<HTMLDivElement, { procurement: Procurement; isForExport?: boolean }>(({ procurement, isForExport }, ref) => {
    
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
            return <div style={{ height: '100%', boxSizing: 'border-box', padding: '8px' }}></div>;
        }
        return (
            <div style={{ padding: '8px', fontSize: '9px', textAlign: 'left', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', boxSizing: 'border-box' }}>
                <div style={{ wordWrap: 'break-word', boxSizing: 'border-box' }}>
                    <span>Name: </span>
                    <span style={{ fontWeight: '600' }}>{signature.name}</span>
                    {description && <div style={{fontSize: '8px', fontStyle: 'italic', color: '#333'}}>{description}</div>}
                </div>
                <div style={{ flexGrow: 1, margin: '2px 0', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
                    <span style={{ marginBottom: '1px' }}>Signature:</span>
                    {signature.signatureDataUrl && (
                        <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }}>
                             <img src={signature.signatureDataUrl} alt="Signature" style={{ maxHeight: '35px', maxWidth: '100%', objectFit: 'contain' }} />
                        </div>
                    )}
                </div>
                <div style={{boxSizing: 'border-box'}}>
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
            <div style={{ fontSize: '10px', textAlign: 'left', padding: '8px', boxSizing: 'border-box' }}>
                {checklist.map(item => (
                    <div key={item.id} style={{ padding: '1px 0', wordWrap: 'break-word', display: 'flex', alignItems: 'start', boxSizing: 'border-box' }}>
                        <span style={{ marginRight: '4px', minWidth: '12px' }}>{item.checked ? '☑' : '☐'}</span>
                        <span>{item.label}</span>
                    </div>
                ))}
            </div>
        );
    }
    
    const renderPhaseTable = (phases: Procurement['phases']) => {
        const tableHeader = (
            <thead>
                <tr style={{ fontWeight: 'bold', backgroundColor: '#E0E0E0', fontSize: '10px' }}>
                    <td style={{ border: '1px solid black', padding: isForExport ? '4px 8px' : '8px', textAlign: 'center', verticalAlign: 'middle', width: '10%', boxSizing: 'border-box' }}>PHASE</td>
                    <td style={{ border: '1px solid black', padding: isForExport ? '4px 8px' : '8px', textAlign: 'center', verticalAlign: 'middle', width: '40%', boxSizing: 'border-box' }}>PARTICULARS</td>
                    <td style={{ border: '1px solid black', padding: isForExport ? '4px 8px' : '8px', textAlign: 'center', verticalAlign: 'middle', width: '25%', boxSizing: 'border-box' }}>SUBMITTED BY</td>
                    <td style={{ border: '1px solid black', padding: isForExport ? '4px 8px' : '8px', textAlign: 'center', verticalAlign: 'middle', width: '25%', boxSizing: 'border-box' }}>RECEIVED BY</td>
                </tr>
            </thead>
        );

        return (
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', fontSize: '11px', tableLayout: 'fixed' }}>
                {tableHeader}
                <tbody>
                    {phases.map(phase => (
                        <tr key={phase.id}>
                            <td style={{ border: '1px solid black', padding: isForExport ? '4px 8px' : '8px', fontWeight: 'bold', textAlign: 'center', verticalAlign: 'middle', boxSizing: 'border-box' }}><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>{phase.id}</div></td>
                            <td style={{ border: '1px solid black', padding: '0', verticalAlign: 'top', boxSizing: 'border-box' }}>{renderChecklist(phase.checklist)}</td>
                            <td style={{ border: '1px solid black', padding: '0', verticalAlign: 'top', boxSizing: 'border-box' }}>{renderSignature(phase.submittedBy, getSignatureDescription(phase.id, 'submittedBy'))}</td>
                            <td style={{ border: '1px solid black', padding: '0', verticalAlign: 'top', boxSizing: 'border-box' }}>{renderSignature(phase.receivedBy, getSignatureDescription(phase.id, 'receivedBy'))}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    }

    const projectTypes: Procurement['projectType'][] = ['ILCDB-DWIA', 'SPARK', 'TECH4ED-DTC', 'PROJECT CLICK', 'OTHERS'];
    
    return (
        <div ref={ref} style={{ backgroundColor: 'white', color: 'black', fontFamily: 'Helvetica, sans-serif', width: '8.27in', minHeight: '11.69in', padding: '0.25in', boxSizing: 'border-box' }}>
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', paddingBottom: '0.25in', boxSizing: 'border-box' }}>
                 <header style={{ marginBottom: '16px', padding: '8px 0', width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                        <img src="/logos/ilcdb.png" alt="ILCDB Logo" style={{ height: '55px', width: 'auto' }} />
                        <img src="/logos/dtc.png" alt="DTC Logo" style={{ height: '55px', width: 'auto' }}/>
                        <img src="/logos/spark.png" alt="SPARK Logo" style={{ height: '55px', width: 'auto' }} />
                    </div>
                </header>

                <table style={{ width: '95%', borderCollapse: 'collapse', border: '1px solid black', fontSize: '12px', marginBottom: '16px', margin: '0 auto' }}>
                    <tbody>
                        <tr>
                            <td style={{ border: '1px solid black', padding: isForExport ? '4px 8px' : '8px', fontWeight: 'bold', width: '25%', verticalAlign: 'middle', boxSizing: 'border-box' }}>PROJECT</td>
                            <td style={{ border: '1px solid black', padding: isForExport ? '4px 8px' : '8px', boxSizing: 'border-box', verticalAlign: 'middle' }} colSpan={3}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexWrap: 'nowrap' }}>
                                    {projectTypes.map(pt => (
                                        <div key={pt} style={{ display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                                            <span style={{ fontSize: '14px', lineHeight: '1', display: 'inline-block' }}>{procurement.projectType === pt ? '☑' : '☐'}</span>
                                            <label style={{ fontSize: '12px', fontWeight: '600' }}>{pt}</label>
                                        </div>
                                    ))}
                                    {procurement.projectType === 'OTHERS' && <span style={{fontSize: '12px', whiteSpace: 'nowrap'}}>: {procurement.otherProjectType}</span>}
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td style={{ border: '1px solid black', padding: isForExport ? '4px 8px' : '8px', fontWeight: 'bold', whiteSpace: 'nowrap', verticalAlign: 'middle', boxSizing: 'border-box' }}>ACTIVITY / PROCUREMENT (SVP)</td>
                            <td style={{ border: '1px solid black', padding: isForExport ? '4px 8px' : '8px', fontWeight: '600', verticalAlign: 'middle', boxSizing: 'border-box' }} colSpan={3}>{procurement.title}</td>
                        </tr>
                        <tr>
                            <td style={{ border: '1px solid black', padding: isForExport ? '4px 8px' : '8px', fontWeight: 'bold', verticalAlign: 'middle', boxSizing: 'border-box' }}>AMOUNT</td>
                            <td style={{ border: '1px solid black', padding: isForExport ? '4px 8px' : '8px', fontWeight: '600', width: '35%', verticalAlign: 'middle', boxSizing: 'border-box' }}>{formatCurrency(procurement.amount)}</td>
                            <td style={{ border: '1px solid black', padding: isForExport ? '4px 8px' : '8px', fontWeight: 'bold', width: '15%', verticalAlign: 'middle', boxSizing: 'border-box' }}>PR NUMBER:</td>
                            <td style={{ border: '1px solid black', padding: isForExport ? '4px 8px' : '8px', fontWeight: '600', width: '25%', verticalAlign: 'middle', boxSizing: 'border-box' }}>{procurement.prNumber}</td>
                        </tr>
                    </tbody>
                </table>
                
                <div style={{ width: '95%', margin: '0 auto 16px auto', border: '1px solid black', padding: isForExport ? '7px 10px' : '8px', textAlign: 'center', backgroundColor: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <h3 style={{
                        fontWeight: 'bold',
                        fontSize: '13px',
                    }}>
                        PROCUREMENT&nbsp;&nbsp;&nbsp;REQUIREMENTS
                    </h3>
                </div>

                <div style={{ width: '95%', margin: '0 auto' }}>
                    {renderPhaseTable(procurement.phases)}
                </div>
                
                <footer style={{ marginTop: 'auto', paddingTop: '20px', fontSize: '12px', textAlign: 'left', width: '95%', margin: '0 auto' }}>
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
  const [isExporting, setIsExporting] = React.useState(false);

  const handleDownloadPdf = async () => {
    setIsExporting(true); // Trigger re-render with export styles
    setIsDownloading(true);

    // Short delay to allow the component to re-render with export styles
    await new Promise(resolve => setTimeout(resolve, 50));

    const printArea = summaryRef.current;
    if (!printArea) {
      setIsDownloading(false);
      setIsExporting(false);
      return;
    }

    try {
      const canvas = await html2canvas(printArea, {
        useCORS: true,
        backgroundColor: '#ffffff',
        scale: 2,
        width: printArea.scrollWidth,
        height: printArea.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'in',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const canvasAspectRatio = canvasWidth / canvasHeight;
      const pageAspectRatio = pdfWidth / pdfHeight;

      let imgHeight = pdfWidth / canvasAspectRatio;
      let imgWidth = pdfWidth;

      if(imgHeight < pdfHeight){
        imgHeight = pdfHeight;
        imgWidth = pdfHeight * canvasAspectRatio;
      }
      
      let position = 0;
      const pageHeightInCanvas = (canvasWidth / pdfWidth) * pdfHeight;
      
      while (position < canvasHeight) {
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvasWidth;
        pageCanvas.height = pageHeightInCanvas;
        const pageCtx = pageCanvas.getContext('2d');
        if (pageCtx) {
          pageCtx.drawImage(canvas, 0, position, canvasWidth, pageHeightInCanvas, 0, 0, canvasWidth, pageHeightInCanvas);
          const pageImgData = pageCanvas.toDataURL('image/png');
          if (position > 0) {
            pdf.addPage();
          }
          pdf.addImage(pageImgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        }
        position += pageHeightInCanvas;
      }

      pdf.save(`procurement-summary-${procurement.prNumber}.pdf`);

    } catch (error) {
        console.error('Error generating PDF:', error);
    } finally {
        setIsDownloading(false);
        setIsExporting(false); // Revert to preview styles
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
                <PDFDocument ref={summaryRef} procurement={procurement} isForExport={isExporting} />
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
