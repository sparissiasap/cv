import { Component, Input } from '@angular/core';
import { LanguagesSection } from '../../../models/cv-data.model';

@Component({
  selector: 'app-languages',
  standalone: true,
  imports: [],
  templateUrl: './languages.component.html'
})
export class LanguagesComponent {
  @Input() section!: LanguagesSection;
}
