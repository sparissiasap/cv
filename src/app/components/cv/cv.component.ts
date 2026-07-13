import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
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
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private doc = inject(DOCUMENT);

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
        this.updateSeoTags(data);
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

  private updateSeoTags(data: CvData): void {
    const m = data.meta;
    if (m?.pageTitle) this.titleService.setTitle(m.pageTitle);
    if (m?.description) this.metaService.updateTag({ name: 'description', content: m.description });
    const shareUrl = this.currentLang ? `${m.shareUrl}?lang=${this.currentLang}` : m.shareUrl;
    if (shareUrl) {
      this.metaService.updateTag({ property: 'og:url', content: shareUrl });
      this.metaService.updateTag({ property: 'og:title', content: m.pageTitle });
      this.metaService.updateTag({ property: 'og:description', content: m.description });
      this.setCanonical(shareUrl);
    }
    const ogImage = m?.ogImage
      ? `https://sergioparissi.is-a.dev/assets/${this.profile}/${m.ogImage}`
      : `https://sergioparissi.is-a.dev/assets/${this.profile}/perfil.jpg`;
    this.metaService.updateTag({ property: 'og:image', content: ogImage });
    this.updateHreflang(this.profile.toLowerCase());
  }

  private updateHreflang(slug: string): void {
    this.doc.querySelectorAll('link[hreflang]').forEach(el => el.remove());
    const BASE = 'https://sergioparissi.is-a.dev';
    [
      { lang: 'es',        href: `${BASE}/${slug}` },
      { lang: 'en',        href: `${BASE}/${slug}?lang=en` },
      { lang: 'x-default', href: `${BASE}/${slug}` },
    ].forEach(({ lang, href }) => {
      const link = this.doc.createElement('link');
      link.rel = 'alternate';
      link.setAttribute('hreflang', lang);
      link.href = href;
      this.doc.head.appendChild(link);
    });
  }

  private setCanonical(url: string): void {
    let link = this.doc.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', url);
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
