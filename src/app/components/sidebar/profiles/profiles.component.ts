import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { ProfilesSection } from '../../../models/cv-data.model';

@Component({
    selector: 'app-profiles',
    imports: [],
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './profiles.component.html'
})
export class ProfilesComponent {
  @Input() section!: ProfilesSection;
}
