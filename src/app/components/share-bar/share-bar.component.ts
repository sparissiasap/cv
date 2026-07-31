import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ShareBarItem } from '../../models/cv-data.model';
import { PdfGeneratorService } from '../../services/pdf-generator.service';

const SHARE_ICONS: Record<string, string> = {
  'bi-printer':    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1"/><path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1"/></svg>',
  'bi-file-pdf':   '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M4 0h5.293A1 1 0 0 1 10 .293L13.707 4a1 1 0 0 1 .293.707V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2m5.5 1.5v2a1 1 0 0 0 1 1h2zM4.165 13.668c.09.18.23.343.438.419.207.075.465.04.097-.056a3.3 3.3 0 0 0 .866-.356c.15-.09.308-.204.47-.336a10.9 10.9 0 0 0 .726-.677c.307-.319.605-.662.894-1.018a14 14 0 0 0 1.053-1.488 1.9 1.9 0 0 0 .31-.692c.045-.255-.02-.53-.2-.71-.18-.18-.455-.24-.71-.195-.255.045-.48.21-.57.45-.09.24-.045.51.12.69.165.18.39.27.615.3l.03.003c-.225.405-.48.81-.765 1.215-.285.405-.59.795-.915 1.17-.325.375-.665.735-1.02 1.08-.355.345-.72.665-1.095.96-.375.295-.755.56-1.14.795-.385.235-.77.435-1.155.6-.385.165-.77.29-1.155.375-.385.085-.77.125-1.155.125-.385 0-.77-.04-1.155-.125z"/></svg>',
  'bi-linkedin':   '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z"/></svg>',
  'bi-twitter-x':  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z"/></svg>',
  'bi-whatsapp':   '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/></svg>',
  'bi-link-45deg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1 1 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4 4 0 0 1-.128-1.287z"/><path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243z"/></svg>'
};

@Component({
    selector: 'app-share-bar',
    imports: [],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './share-bar.component.html'
})
export class ShareBarComponent {
  @Input() items: ShareBarItem[] = [];
  @Input() shareUrl = '';
  @Input() targetElement!: HTMLElement; // <- Recibe el elemento del CV

  copyLabel = 'Copiar enlace';
  private copyTimeout?: ReturnType<typeof setTimeout>;

  constructor(private sanitizer: DomSanitizer, private pdfService: PdfGeneratorService) {}

  getIcon(name: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(SHARE_ICONS[name] || '');
  }

  isButton(item: ShareBarItem): item is { type: 'print' | 'copy' | 'link'; icon: string; label: string; href?: string } {
    return item.type !== 'divider';
  }

  print(): void {
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const viewport = document.querySelector('meta[name="viewport"]') as HTMLMetaElement | null;

    if (isIOS && viewport) {
      const original = viewport.content;
      viewport.content = 'width=900';

      const restore = () => {
        viewport.content = original;
        window.removeEventListener('afterprint', restore);
      };
      window.addEventListener('afterprint', restore);

      setTimeout(() => window.print(), 100);
      return;
    }

    window.print();
  }

  copyLink(): void {
    const url = this.shareUrl || window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      this.copyLabel = '✓ Copiado';
      if (this.copyTimeout) clearTimeout(this.copyTimeout);
      this.copyTimeout = setTimeout(() => { this.copyLabel = 'Copiar enlace'; }, 2000);
    }).catch(() => {
      prompt('Copia este enlace:', url);
    });
  }

  // <- Método disparado por el botón PDF en share-bar.component.html
  downloadPDF(): void {
    if (this.targetElement) {
      this.pdfService.generatePDF(this.targetElement);
    }
  }
}