import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-pdf-modal',
  standalone: true,
  imports: [],
  templateUrl: './pdf-modal.component.html'
})
export class PdfModalComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() subtitle = '';
  @Output() closed = new EventEmitter<void>();

  safeSrc: SafeResourceUrl = '';

  private _src = '';

  @Input() set src(value: string) {
    this._src = value;
    this.safeSrc = value ? this.sanitizer.bypassSecurityTrustResourceUrl(value) : '';
  }

  constructor(private sanitizer: DomSanitizer) {}

  @HostListener('document:keydown.escape')
  close(): void {
    this.closed.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.closed.emit();
    }
  }
}
