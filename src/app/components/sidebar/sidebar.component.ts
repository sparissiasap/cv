import { Component, Input } from '@angular/core';
import { SidebarSection } from '../../models/cv-data.model';
import { ExpertiseComponent } from './expertise/expertise.component';
import { CertListComponent } from './cert-list/cert-list.component';
import { EducationComponent } from './education/education.component';
import { LanguagesComponent } from './languages/languages.component';
import { ProfilesComponent } from './profiles/profiles.component';
import { TextSectionComponent } from './text-section/text-section.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    ExpertiseComponent,
    CertListComponent,
    EducationComponent,
    LanguagesComponent,
    ProfilesComponent,
    TextSectionComponent
  ],
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent {
  @Input() sections: SidebarSection[] = [];
}
