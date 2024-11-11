import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

@Injectable({
  providedIn: 'root',
})
export class PdfExportService {
  exportToPDF(tableData: any[], columns: string[]) {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 10;
    const tableWidth = pageWidth - 2 * margin;
    const columnWidth = tableWidth / columns.length;

    // Header
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text('Multi-page grid with automatic page breaking', margin, margin);

    // Footer
    const addFooter = (pageNum: number, totalPages: number) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(
        `Page ${pageNum} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - 5,
        { align: 'center' },
      );
    };

    // Table settings
    const startY = 20;
    let y = startY;
    const rowHeight = 10;

    // Draw table header
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, y, tableWidth, rowHeight, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    columns.forEach((header, i) => {
      doc.text(header, margin + i * columnWidth + 2, y + 7, {
        maxWidth: columnWidth - 4,
      });
    });
    y += rowHeight;

    // Draw table rows
    doc.setFont('helvetica', 'normal');
    let pageNum = 1;
    tableData.forEach((row, rowIndex) => {
      if (y > pageHeight - 20) {
        addFooter(
          pageNum,
          Math.ceil(tableData.length / ((pageHeight - startY) / rowHeight)),
        );
        doc.addPage();
        pageNum++;
        y = startY;
        // Redraw header on new page
        doc.setFillColor(240, 240, 240);
        doc.rect(margin, y, tableWidth, rowHeight, 'F');
        doc.setFont('helvetica', 'bold');
        columns.forEach((header, i) => {
          doc.text(header, margin + i * columnWidth + 2, y + 7, {
            maxWidth: columnWidth - 4,
          });
        });
        y += rowHeight;
        doc.setFont('helvetica', 'normal');
      }

      // Alternate row background color
      if (rowIndex % 2 === 1) {
        doc.setFillColor(250, 250, 250);
        doc.rect(margin, y, tableWidth, rowHeight, 'F');
      }

      columns.forEach((col, i) => {
        const cellContent = String(row[col.toLowerCase()]);
        doc.text(cellContent, margin + i * columnWidth + 2, y + 7, {
          maxWidth: columnWidth - 4,
        });
      });
      y += rowHeight;
    });

    // Add footer to the last page
    addFooter(
      pageNum,
      Math.ceil(tableData.length / ((pageHeight - startY) / rowHeight)),
    );

    // Draw table borders
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.1);
    for (let i = 0; i <= columns.length; i++) {
      doc.line(margin + i * columnWidth, startY, margin + i * columnWidth, y);
    }
    for (let i = 0; i <= tableData.length + 1; i++) {
      const lineY = startY + i * rowHeight;
      if (lineY <= y) {
        doc.line(margin, lineY, margin + tableWidth, lineY);
      }
    }

    doc.save('product_table.pdf');
  }
}
