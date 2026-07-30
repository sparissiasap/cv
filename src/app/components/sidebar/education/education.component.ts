import { Component, Input } from '@angular/core';
import { EducationSection } from '../../../models/cv-data.model';

@Component({
    selector: 'app-education',
    imports: [],
    templateUrl: './education.component.html'
})
export class EducationComponent {
  @Input() section!: EducationSection;
}
