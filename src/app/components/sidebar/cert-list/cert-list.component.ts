import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';
import { CertListSection } from '../../../models/cv-data.model';

@Component({
    selector: 'app-cert-list',
    imports: [NgClass],
    templateUrl: './cert-list.component.html'
})
export class CertListComponent {
  @Input() section!: CertListSection;
}
