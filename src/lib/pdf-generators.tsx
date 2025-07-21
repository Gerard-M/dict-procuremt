
'use client'

import React from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Procurement } from './types';
import { PDFDocument as ProcurementPDFDocument } from '@/components/procurement-summary-dialog';


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
