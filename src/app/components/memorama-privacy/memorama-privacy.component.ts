import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-memorama-privacy',
    imports: [],
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './memorama-privacy.component.html'
})
export class MemoramaPrivacyComponent implements OnInit, OnDestroy {
  lastUpdated = '11 de agosto de 2026';

  ngOnInit(): void {
    document.body.classList.add('legal-theme');
  }

  ngOnDestroy(): void {
    document.body.classList.remove('legal-theme');
  }
}
