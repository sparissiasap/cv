import { Component, Input } from '@angular/core';
import { TextSection } from '../../../models/cv-data.model';

@Component({
    selector: 'app-text-section',
    imports: [],
    template: `
    <div class="card">
      <div class="section-label">{{ section.label }}</div>
      <div style="font-size:9pt;color:var(--t2);line-height:1.6;">{{ section.content }}</div>
    </div>
  `
})
export class TextSectionComponent {
  @Input() section!: TextSection;
}
