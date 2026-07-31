import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  HostListener, 
  ChangeDetectionStrategy,
  ElementRef,
  ViewChild
} from '@angular/core';

import { A11yModule } from '@angular/cdk/a11y';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';


@Component({
    selector: 'app-pdf-modal',
    imports: [A11yModule],
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './pdf-modal.component.html'
})
export class PdfModalComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() subtitle = '';
  @Output() closed = new EventEmitter<void>();

  @ViewChild('modalBox')
  modalBox?: ElementRef<HTMLElement>;

  safeSrc: SafeResourceUrl = '';

  private _src = '';

  @Input() set src(value: string) {
    this._src = value;
    this.safeSrc = value ? this.sanitizer.bypassSecurityTrustResourceUrl(value) : '';
  }

  constructor(private sanitizer: DomSanitizer) {}

  //@HostListener('document:keydown.escape')
  close(): void {
    this.closed.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.closed.emit();
    }
  }
}
