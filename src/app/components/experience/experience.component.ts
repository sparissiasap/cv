import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { NgClass } from '@angular/common';
import { CvExperience } from '../../models/cv-data.model';

@Component({
    selector: 'app-experience',
    imports: [NgClass],
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './experience.component.html'
})
export class ExperienceComponent {
  @Input() experience!: CvExperience;
}
