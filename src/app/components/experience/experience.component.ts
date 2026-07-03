import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';
import { CvExperience } from '../../models/cv-data.model';

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [NgClass],
  templateUrl: './experience.component.html'
})
export class ExperienceComponent {
  @Input() experience!: CvExperience;
}
