
'use client'

import React from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Procurement } from './types';
import { PDFDocument as ProcurementPDFDocument } from '@/components/procurement-summary-dialog';

export async function generatePdf(elementRef: React.RefObject<HTMLDivElement>, filename: string) {
    const printArea = elementRef.current;
    if (!printArea) {
        throw new Error("PDF generation failed: element not found.");
    }
    
    // Temporarily set isForExport to true
    const originalContent = printArea.innerHTML;
    const exportDiv = document.createElement('div');
    exportDiv.innerHTML = originalContent;
    const pdfDocElement = exportDiv.firstElementChild as HTMLElement;
    if (pdfDocElement) {
        pdfDocElement.dataset.isExport = 'true';
    }

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
    const pageHeightInCanvas = (canvas.width / pdfWidth) * pdfHeight;
    
    let position = 0;
    while (position < canvas.height) {
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = pageHeightInCanvas;
        const pageCtx = pageCanvas.getContext('2d');
        if (pageCtx) {
            pageCtx.drawImage(canvas, 0, position, canvas.width, pageHeightInCanvas, 0, 0, canvas.width, pageHeightInCanvas);
            const pageImgData = pageCanvas.toDataURL('image/png');
            if (position > 0) {
                pdf.addPage();
            }
            pdf.addImage(pageImgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        }
        position += pageHeightInCanvas;
    }

    pdf.save(filename);
}


export async function generateBatchProcurementPdf(procurements: Procurement[]) {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'in',
      format: 'a4',
    });
  
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '-9999px';
    document.body.appendChild(tempContainer);
  
    for (let i = 0; i < procurements.length; i++) {
      const procurement = procurements[i];
      const componentHtml = renderToStaticMarkup(
        <ProcurementPDFDocument procurement={procurement} isForExport={true} />
      );
  
      const pageElement = document.createElement('div');
      pageElement.innerHTML = componentHtml;
      tempContainer.appendChild(pageElement);
  
      const canvas = await html2canvas(pageElement, {
        useCORS: true,
        backgroundColor: '#ffffff',
        scale: 2,
        width: pageElement.scrollWidth,
        height: pageElement.scrollHeight,
      });
  
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
  
      if (i > 0) {
        pdf.addPage();
      }
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  
      tempContainer.removeChild(pageElement);
    }
  
    document.body.removeChild(tempContainer);
    pdf.save(`procurement-batch-${new Date().toISOString().split('T')[0]}.pdf`);
}
