import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { LanguagesSection } from '../../../models/cv-data.model';

@Component({
    selector: 'app-languages',
    imports: [],
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './languages.component.html'
})
export class LanguagesComponent {
  @Input() section!: LanguagesSection;
}
