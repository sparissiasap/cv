import { DomSanitizer } from '@angular/platform-browser';
import { ShareBarComponent } from './share-bar.component';
import { ShareBarItem } from '../../models/cv-data.model';
import { PdfGeneratorService } from '../../services/pdf-generator.service';

const mockSanitizer = { bypassSecurityTrustHtml: jest.fn((v: string) => v) } as unknown as DomSanitizer;
const mockPdfService = { generatePDF: jest.fn() } as unknown as PdfGeneratorService;

describe('ShareBarComponent', () => {
  let component: ShareBarComponent;

  beforeEach(() => {
    component = new ShareBarComponent(mockSanitizer, mockPdfService);
  });

  it('isButton con item tipo "print" → retorna true', () => {
    const item = { type: 'print', icon: 'bi-printer', label: 'Imprimir' } as ShareBarItem;
    expect(component.isButton(item)).toBe(true);
  });

  it('isButton con item tipo "divider" → retorna false', () => {
    const item = { type: 'divider' } as ShareBarItem;
    expect(component.isButton(item)).toBe(false);
  });

  it('copyLink → llama clipboard.writeText con shareUrl y cambia copyLabel', async () => {
    const writeTextMock = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      writable: true,
      configurable: true,
    });

    component.shareUrl = 'https://sparissiasap.github.io/cv/sergio';
    await component.copyLink();

    expect(writeTextMock).toHaveBeenCalledWith('https://sparissiasap.github.io/cv/sergio');
    expect(component.copyLabel).toBe('✓ Copiado');
  });
});
