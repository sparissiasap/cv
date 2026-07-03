import { Component, Input } from '@angular/core';
import { NgClass, NgStyle } from '@angular/common';
import { ExpertiseSection } from '../../../models/cv-data.model';

@Component({
  selector: 'app-expertise',
  standalone: true,
  imports: [NgClass, NgStyle],
  templateUrl: './expertise.component.html'
})
export class ExpertiseComponent {
  @Input() section!: ExpertiseSection;
}
