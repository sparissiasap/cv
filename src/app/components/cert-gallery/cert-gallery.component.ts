import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { NgClass } from '@angular/common';
import { CertGallery, CertGalleryItem } from '../../models/cv-data.model';

export interface ModalData {
  src: string;
  title: string;
  subtitle: string;
}

@Component({
    selector: 'app-cert-gallery',
    imports: [NgClass],
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './cert-gallery.component.html'
})
export class CertGalleryComponent {
  @Input() gallery!: CertGallery;
  @Input() assetsBase = '';
  @Output() openModal = new EventEmitter<ModalData>();

  open(cert: CertGalleryItem): void {
    this.openModal.emit({
      src: this.assetsBase + cert.file,
      title: cert.title,
      subtitle: cert.issuer + ' · ' + cert.date
    });
  }
}
