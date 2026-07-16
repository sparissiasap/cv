import { DomSanitizer } from '@angular/platform-browser';
import { PdfModalComponent } from './pdf-modal.component';

const mockSanitizer = () =>
  ({ bypassSecurityTrustResourceUrl: jest.fn((v: string) => v) }) as unknown as DomSanitizer;

describe('PdfModalComponent', () => {
  let component: PdfModalComponent;
  let sanitizer: { bypassSecurityTrustResourceUrl: jest.Mock };

  beforeEach(() => {
    sanitizer = { bypassSecurityTrustResourceUrl: jest.fn((v: string) => v) };
    component = new PdfModalComponent(sanitizer as unknown as DomSanitizer);
  });

  it('src setter con valor → llama bypassSecurityTrustResourceUrl', () => {
    component.src = 'assets/cert.pdf';
    expect(sanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith('assets/cert.pdf');
  });

  it('src setter vacío → safeSrc queda vacío', () => {
    component.src = '';
    expect(component.safeSrc).toBe('');
  });

  it('close() → emite evento closed', () => {
    const emitted = jest.fn();
    component.closed.subscribe(emitted);
    component.close();
    expect(emitted).toHaveBeenCalled();
  });

  it('onOverlayClick sobre modal-overlay → emite closed', () => {
    const emitted = jest.fn();
    component.closed.subscribe(emitted);
    const div = document.createElement('div');
    div.classList.add('modal-overlay');
    component.onOverlayClick({ target: div } as unknown as MouseEvent);
    expect(emitted).toHaveBeenCalled();
  });

  it('onOverlayClick sobre otro elemento → no emite closed', () => {
    const emitted = jest.fn();
    component.closed.subscribe(emitted);
    const div = document.createElement('div');
    component.onOverlayClick({ target: div } as unknown as MouseEvent);
    expect(emitted).not.toHaveBeenCalled();
  });
});
