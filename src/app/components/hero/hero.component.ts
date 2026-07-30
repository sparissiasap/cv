import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { NgClass } from '@angular/common';
import { CvProfile } from '../../models/cv-data.model';

@Component({
    selector: 'app-hero',
    imports: [NgClass],
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './hero.component.html'
})
export class HeroComponent {
  @Input() profile!: CvProfile;
  @Input() assetsBase = '';

  isExternal(href: string): boolean {
    return href.startsWith('http') || href.startsWith('//');
  }
}
