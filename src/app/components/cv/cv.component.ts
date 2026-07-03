import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { CvDataService } from '../../services/cv-data.service';
import { CvData } from '../../models/cv-data.model';
import { ModalData } from '../cert-gallery/cert-gallery.component';
import { HeroComponent } from '../hero/hero.component';
import { ExperienceComponent } from '../experience/experience.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { CertGalleryComponent } from '../cert-gallery/cert-gallery.component';
import { PdfModalComponent } from '../pdf-modal/pdf-modal.component';
import { ShareBarComponent } from '../share-bar/share-bar.component';
import { LanguageToggleComponent } from '../language-toggle/language-toggle.component';

@Component({
  selector: 'app-cv',
  standalone: true,
  imports: [
    HeroComponent,
    ExperienceComponent,
    SidebarComponent,
    CertGalleryComponent,
    PdfModalComponent,
    ShareBarComponent,
    LanguageToggleComponent
  ],
  templateUrl: './cv.component.html'
})
export class CvComponent implements OnInit, OnDestroy {
  cvData: CvData | null = null;
  loading = true;
  profile = '';
  assetsBase = '';
  currentLang = '';

  modalOpen = false;
  modalSrc = '';
  modalTitle = '';
  modalSubtitle = '';

  private sub?: Subscription;

  constructor(private route: ActivatedRoute, private cvDataService: CvDataService) {}

  ngOnInit(): void {
    this.profile = this.route.snapshot.data['profile'] as string;
    this.assetsBase = `assets/${this.profile}/`;
    document.body.classList.add(`theme-${this.profile.toLowerCase()}`);

    this.sub = this.route.queryParams.pipe(
      switchMap(params => {
        this.loading = true;
        this.currentLang = params['lang'] || '';
        return this.cvDataService.loadProfile(this.profile, params['lang']);
      })
    ).subscribe({
      next: (data) => {
        this.cvData = data;
        this.currentLang = this.currentLang || data.meta?.lang || '';
        this.loading = false;
        if (data.meta?.pageTitle) document.title = data.meta.pageTitle;
        setTimeout(() => document.body.classList.add('loaded'), 200);
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    document.body.classList.remove('loaded');
    document.body.classList.remove(`theme-${this.profile.toLowerCase()}`);
    document.documentElement.style.opacity = '1';
  }

  openModal(data: ModalData): void {
    this.modalSrc = data.src;
    this.modalTitle = data.title;
    this.modalSubtitle = data.subtitle;
    this.modalOpen = true;
  }

  closeModal(): void {
    this.modalOpen = false;
    this.modalSrc = '';
  }

  get shareUrl(): string {
    if (!this.cvData) return window.location.href;
    const url = this.cvData.meta?.shareUrl || window.location.href;
    return this.currentLang ? `${url}?lang=${this.currentLang}` : url;
  }
}
