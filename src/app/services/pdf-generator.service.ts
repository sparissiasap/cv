import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
 
@Injectable({
  providedIn: 'root'
})
export class PdfGeneratorService {
  constructor(private titleService: Title) {}
 
  async generatePDF(element: HTMLElement): Promise<void> {
    const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf'),
    ]);
 
    const pageTitle = this.titleService.getTitle() || 'Curriculum';
    const fileName = pageTitle.replace(/[^a-zA-Z0-9-_]/g, '_');
 
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
 
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
 
    let heightLeft = imgHeight;
    let position = 0;
 
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
 
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
 
    pdf.save(`${fileName}.pdf`);
  }
}