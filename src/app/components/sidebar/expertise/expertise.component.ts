import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { NgClass, NgStyle } from '@angular/common';
import { ExpertiseSection } from '../../../models/cv-data.model';

@Component({
    selector: 'app-expertise',
    imports: [],
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './expertise.component.html'
})
export class ExpertiseComponent {
  @Input() section!: ExpertiseSection;
}
