import { Component, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-language-toggle',
  standalone: true,
  imports: [],
  templateUrl: './language-toggle.component.html'
})
export class LanguageToggleComponent {
  @Input() availableLangs: string[] = [];
  @Input() currentLang = '';

  constructor(private router: Router, private route: ActivatedRoute) {}

  switchLang(lang: string): void {
    document.documentElement.style.transition = 'opacity 0.2s ease';
    document.documentElement.style.opacity = '0';
    setTimeout(() => {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { lang },
        queryParamsHandling: 'merge'
      });
      document.documentElement.style.opacity = '1';
    }, 210);
  }
}
