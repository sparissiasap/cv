import { Component, OnInit, OnDestroy, inject, DOCUMENT, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';

interface FeatureCard {
  icon: string;
  title: string;
  text: string;
}

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.ticketscanandsave.ticketscanandsave';
const BASE_URL = 'https://sergioparissi.is-a.dev';
const PAGE_URL = `${BASE_URL}/misfinanzas/`;
const OG_IMAGE = `${BASE_URL}/assets/MisFinanzas/og-image.webp`;
const PAGE_TITLE = 'MisFinanzas — App de Control de Gastos y Ahorro | Sergio Parissi';
const PAGE_DESCRIPTION = 'Escanea tickets, controla tus gastos, ahorra y paga tus deudas sin complicarte. App gratuita para Android, sin hojas de cálculo.';

@Component({
    selector: 'app-misfinanzas',
    imports: [RouterLink],
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './misfinanzas.component.html'
})
export class MisfinanzasComponent implements OnInit, OnDestroy {
  readonly playStoreUrl = PLAY_STORE_URL;

  readonly features: FeatureCard[] = [
    { icon: '📷', title: 'Escanea y olvídate de teclear', text: 'Toma una foto de tu ticket y reconozco automáticamente el monto, el comercio, la categoría y la fecha.' },
    { icon: '🧾', title: 'Lee códigos QR de tickets CFDI', text: 'Escanea el QR de tu ticket con factura electrónica del SAT y te lleno los datos automáticamente. Siempre gratis.' },
    { icon: '💰', title: 'Ingresos, deudas y metas', text: 'Registra tus ingresos, lleva el control de deudas y pagos a plazos, y crea metas de ahorro con seguimiento de progreso.' },
    { icon: '🗣️', title: 'Pregúntame en tu idioma', text: '"¿Cuánto gasté en gasolina este mes?" o "¿cuál es mi neto?" — te respondo al instante.' },
    { icon: '📊', title: 'Tu resumen financiero', text: 'Consulta tu gasto por categoría y por mes, exporta tus tickets en CSV o PDF, y genera un reporte anual.' },
    { icon: '🔔', title: 'Recordatorios que te cuidan', text: 'Te aviso si no has subido tickets del día, cuando cumples una meta de ahorro, o si se acerca una fecha límite.' },
    { icon: '📴', title: 'Funciona sin conexión', text: 'Registra tickets aunque no tengas internet; se sincronizan solos en cuanto vuelves a conectarte.' },
    { icon: '🌎', title: 'En tu idioma', text: 'Disponible en español, inglés, francés, alemán y portugués. Modo claro, oscuro o automático.' },
  ];

  readonly proFeatures: string[] = [
    'Sin anuncios.',
    'Gráficas de tendencia de tus gastos.',
    'Filtros de búsqueda por comercio, categoría, forma de pago y fecha.',
    'Catálogo de categorías y comercios personalizado.',
    'Movimientos recurrentes automáticos (renta, nómina, suscripciones).',
    'Presupuestos por categoría, con aviso si te acercas o pasas el límite.',
    'Comparativa de gasto mes contra mes.',
    'Widget de pantalla de inicio con tu gasto del mes.',
    'Respaldo completo en ZIP para guardar en Google Drive, OneDrive o Dropbox.',
  ];

  private titleService = inject(Title);
  private metaService = inject(Meta);
  private doc = inject(DOCUMENT);

  ngOnInit(): void {
    document.body.classList.add('menu-theme');
    document.body.classList.add('misfinanzas-theme');

    this.titleService.setTitle(PAGE_TITLE);
    this.metaService.updateTag({ name: 'description', content: PAGE_DESCRIPTION });
    this.metaService.updateTag({ property: 'og:type', content: 'website' });
    this.metaService.updateTag({ property: 'og:title', content: PAGE_TITLE });
    this.metaService.updateTag({ property: 'og:description', content: PAGE_DESCRIPTION });
    this.metaService.updateTag({ property: 'og:url', content: PAGE_URL });
    this.metaService.updateTag({ property: 'og:image', content: OG_IMAGE });
    this.metaService.updateTag({ property: 'og:image:width', content: '1200' });
    this.metaService.updateTag({ property: 'og:image:height', content: '630' });
    this.metaService.updateTag({ property: 'og:locale', content: 'es_ES' });
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:title', content: PAGE_TITLE });
    this.metaService.updateTag({ name: 'twitter:description', content: PAGE_DESCRIPTION });
    this.metaService.updateTag({ name: 'twitter:image', content: OG_IMAGE });
    this.setCanonical(PAGE_URL);
    this.doc.documentElement.lang = 'es';
  }

  ngOnDestroy(): void {
    document.body.classList.remove('menu-theme');
    document.body.classList.remove('misfinanzas-theme');
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
}
