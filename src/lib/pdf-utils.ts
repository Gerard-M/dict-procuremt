
'use client'

import React from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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
