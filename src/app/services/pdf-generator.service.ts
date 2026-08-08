import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class PdfGeneratorService {
  constructor(private titleService: Title) {}

  async generatePDF(element: HTMLElement): Promise<void> {
    const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf'),
    ]);

    const pageTitle = this.titleService.getTitle() || 'Curriculum';
    const fileName = pageTitle.replace(/[^a-zA-Z0-9-_]/g, '_');

    // html2canvas can't render backdrop-filter or gradient-clipped text, and it
    // captures whatever animation frame is on-screen. `pdf-capture-mode` (styles.scss)
    // strips those out first so the snapshot matches the site instead of looking broken.
    document.body.classList.add('pdf-capture-mode');
    await document.fonts.ready;
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    // Recorded before rasterizing: the vertical span (relative to `element`'s top,
    // in CSS px) of every block that must never be sliced across a page break —
    // one job entry, one cert card, etc. `.card` itself is deliberately excluded:
    // it wraps whole multi-page sections (e.g. all of Experience), so protecting
    // it would forbid ever splitting that section.
    const unsplittableSelector = '.timeline-item, .cert-item, .cert-card, .lang-item, .exp-bar, .stat-item';
    const elementTop = element.getBoundingClientRect().top;
    const elementHeight = element.getBoundingClientRect().height;
    const unsplittable = Array.from(element.querySelectorAll(unsplittableSelector)).map(el => {
      const r = el.getBoundingClientRect();
      return { top: r.top - elementTop, bottom: r.bottom - elementTop };
    });

    // A page break landing right after a section heading (e.g. "EXPERIENCE")
    // but before its content starts isn't inside any block above, so nothing
    // stops it from stranding the heading alone at the bottom of a page while
    // its content starts fresh on the next one. Extending the heading's own
    // span to cover the first item that follows it (e.g. the first job entry)
    // means a break anywhere across that whole gap gets pushed to before the
    // heading instead — same "too tall to protect, fall back to a hard cut"
    // escape valve as any other protected block if that first item alone is
    // taller than a page.
    for (const el of Array.from(element.querySelectorAll<HTMLElement>('.section-label'))) {
      const r = el.getBoundingClientRect();
      const top = r.top - elementTop;
      const firstItem = el.nextElementSibling?.querySelector<HTMLElement>(unsplittableSelector) ?? null;
      const bottom = firstItem
        ? firstItem.getBoundingClientRect().bottom - elementTop
        : r.bottom - elementTop;
      unsplittable.push({ top, bottom: Math.max(bottom, r.bottom - elementTop) });
    }

    // The block-level protection above (one job entry, one cert card...) still
    // leaves every individual line of running text — paragraphs, bullets — free
    // to be cut wherever the naive page height lands, which is often mid-line,
    // slicing a word (or even a single letter) in half between two pages. Every
    // wrapped line of text gets its own tiny unsplittable span too, so a break
    // can only ever land in the gap *between* two lines, never through one.
    {
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
        acceptNode: node => (node.textContent && node.textContent.trim().length > 0)
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_SKIP,
      });
      const range = document.createRange();
      let node: Node | null;
      while ((node = walker.nextNode())) {
        range.selectNodeContents(node);
        for (const r of Array.from(range.getClientRects())) {
          if (r.height === 0) continue;
          unsplittable.push({ top: r.top - elementTop, bottom: r.bottom - elementTop });
        }
      }
    }

    // html2canvas mis-crops the circular hero photo whenever the browser's
    // srcset selection lands on the 2x image (e.g. on a HiDPI display or a
    // scaled-up Windows display) — it gets the object-fit:cover math wrong for
    // that larger source, showing an off-center sliver of the photo instead of
    // the whole face. Forcing the 1x source (which always renders correctly)
    // during capture sidesteps that rather than fighting html2canvas's crop math.
    const photo = element.querySelector<HTMLImageElement>('.hero-photo');
    const restorePhoto = photo ? await this.forceOneXPhoto(photo) : null;

    // Two different shapes of the same html2canvas text-measuring bug:
    //
    // 1. Elements whose text fits on one line on the real site, but html2canvas
    //    wraps to a 2nd line anyway (its own width/character-metric estimate is
    //    just off) and then gets the box height wrong for that phantom 2nd
    //    line, so the next element overlaps it. Fix: give the box more room
    //    than it needs so even html2canvas's inflated estimate still fits on
    //    one line — safe here specifically because the real content never
    //    needed to wrap in the first place, so nothing is actually being hidden.
    // 2. Elements that *do* legitimately wrap to 2 lines on the real site (e.g.
    //    a long cert title with a badge). Forcing single-line there would just
    //    overflow the card instead of fixing anything, so instead lock the box
    //    to its real, already-correct measured height so html2canvas can't
    //    under-count it — see `.cert-card-title` below.
    const restoreWidths = Array.from(
      element.querySelectorAll<HTMLElement>('.edu-school-text')
    ).map(el => {
      const prevWidth = el.style.width;
      el.style.width = '160%';
      return () => { el.style.width = prevWidth; };
    });

    // `.job-bullets li` is running text like `.cert-card-title`, not a short
    // label — it's *meant* to wrap across several lines, so there's no width
    // to widen its way out of that. Same box-height under-count bug though:
    // a bullet with a bold run wrapping to 3-4 lines routinely comes out one
    // line short, so the next bullet's first line lands on top of it.
    const restoreHeights = Array.from(
      element.querySelectorAll<HTMLElement>('.cert-card-title, .job-bullets li')
    ).map(el => {
      // The under-count isn't always a rounding-error's worth of px — a bold
      // run wrapping mid-sentence can push html2canvas to paint a whole extra
      // *line* beyond what the real DOM wrapped to (e.g. "long-term" splits
      // across lines only in html2canvas's own layout). A flat few-px buffer
      // doesn't cover that, so pad by a full line-height instead: enough
      // headroom for one phantom extra line no matter the element's font size.
      const cs = getComputedStyle(el);
      const lineHeight = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.4 || 20;
      const height = el.getBoundingClientRect().height + lineHeight;
      const prevMinHeight = el.style.minHeight;
      el.style.minHeight = `${height}px`;
      return () => { el.style.minHeight = prevMinHeight; };
    });

    let canvas: HTMLCanvasElement;
    try {
      // foreignObjectRendering must stay off: it renders through a real <foreignObject>,
      // which fixes html2canvas's own text-measuring bugs but mis-positions the capture
      // whenever .page isn't flush against the left edge (i.e. any viewport wider than
      // .page's 990px max-width) — the whole PDF ends up blank except a sliver of content.
      canvas = await html2canvas(element, { scale: 2, backgroundColor: '#ffffff', useCORS: true, foreignObjectRendering: false });
    } finally {
      document.body.classList.remove('pdf-capture-mode');
      restorePhoto?.();
      restoreWidths.forEach(restore => restore());
      restoreHeights.forEach(restore => restore());
    }

    const pageWidthMM = 210;
    const pageHeightMM = 297;
    const marginMM = 10;
    const contentWidthMM = pageWidthMM - marginMM * 2;
    const contentHeightMM = pageHeightMM - marginMM * 2;

    const pxPerMM = canvas.width / contentWidthMM;
    const pageHeightPx = contentHeightMM * pxPerMM;

    // Convert the recorded CSS-px ranges into canvas-px ranges using the capture's
    // actual scale factor (should be ~2, i.e. the `scale` option above, but derived
    // rather than assumed so rounding in html2canvas's own measurement can't drift it).
    const scaleY = canvas.height / elementHeight;
    const breaks = unsplittable.map(r => ({ top: r.top * scaleY, bottom: r.bottom * scaleY }));

    // If the naive page break would land inside one of those blocks, move the break
    // to just before the earliest conflicting block instead — pushing it whole onto
    // the next page — unless the block is itself taller than a full page, in which
    // case there's no way to avoid splitting it and we fall back to the hard cut.
    const findBreak = (sourceY: number, idealEnd: number): number => {
      let cut = idealEnd;
      for (const b of breaks) {
        if (b.top < idealEnd && idealEnd < b.bottom && b.bottom - b.top <= pageHeightPx) {
          cut = Math.min(cut, b.top);
        }
      }
      return cut > sourceY ? cut : idealEnd;
    };

    const pdf = new jsPDF('p', 'mm', 'a4');
    let sourceY = 0;
    let firstPage = true;
    while (sourceY < canvas.height - 0.5) {
      if (!firstPage) pdf.addPage();
      firstPage = false;

      const idealEnd = Math.min(sourceY + pageHeightPx, canvas.height);
      const sliceEnd = idealEnd >= canvas.height - 0.5 ? canvas.height : findBreak(sourceY, idealEnd);
      const sliceHeightPx = Math.max(1, Math.round(sliceEnd - sourceY));

      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = sliceHeightPx;
      sliceCanvas.getContext('2d')!.drawImage(
        canvas, 0, sourceY, canvas.width, sliceHeightPx, 0, 0, canvas.width, sliceHeightPx
      );

      const sliceHeightMM = sliceHeightPx / pxPerMM;
      pdf.addImage(sliceCanvas.toDataURL('image/png'), 'PNG', marginMM, marginMM, contentWidthMM, sliceHeightMM);

      sourceY += sliceHeightPx;
    }

    pdf.save(`${fileName}.pdf`);
  }

  private async forceOneXPhoto(img: HTMLImageElement): Promise<() => void> {
    const originalSrc = img.getAttribute('src') ?? '';
    const originalSrcset = img.getAttribute('srcset');
    const oneXSrc = originalSrc.replace('.webp', '-1x.webp');

    img.removeAttribute('srcset');
    img.src = oneXSrc;
    if (!img.complete) {
      await new Promise<void>(resolve => {
        img.addEventListener('load', () => resolve(), { once: true });
        img.addEventListener('error', () => resolve(), { once: true });
      });
    }

    return () => {
      if (originalSrcset !== null) {
        img.setAttribute('srcset', originalSrcset);
      }
      img.src = originalSrc;
    };
  }
}
