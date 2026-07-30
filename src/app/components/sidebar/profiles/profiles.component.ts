import { Component, Input } from '@angular/core';
import { ProfilesSection } from '../../../models/cv-data.model';

@Component({
    selector: 'app-profiles',
    imports: [],
    templateUrl: './profiles.component.html'
})
export class ProfilesComponent {
  @Input() section!: ProfilesSection;
}
