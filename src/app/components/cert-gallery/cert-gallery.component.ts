import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';

import { CertGallery, CertGalleryItem } from '../../models/cv-data.model';

export interface ModalData {
  src: string;
  title: string;
  subtitle: string;
}

export interface ModalOpenEvent {
  data: ModalData;
  trigger: HTMLElement;
}

@Component({
  selector: 'app-cert-gallery',
  imports: [],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './cert-gallery.component.html'
})
export class CertGalleryComponent {
  @Input() gallery!: CertGallery;
  @Input() assetsBase = '';

  @Output() openModal = new EventEmitter<ModalOpenEvent>();

  open(cert: CertGalleryItem, event: Event): void {
    const trigger = event.currentTarget as HTMLElement;

    this.openModal.emit({
      data: {
        src: this.assetsBase + cert.file,
        title: cert.title,
        subtitle: cert.issuer + ' · ' + cert.date
      },
      trigger
    });
  }
} 