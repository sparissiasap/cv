(function () {
  'use strict';

  var _langParam = new URLSearchParams(window.location.search).get('lang');

  // ── DOM helper ──────────────────────────────────────────────────
  function el(tag, attrs) {
    var e = document.createElement(tag);
    if (attrs) {
      Object.entries(attrs).forEach(function (kv) {
        var k = kv[0], v = kv[1];
        if (k === 'class') e.className = v;
        else if (k === 'html') e.innerHTML = v;
        else if (k === 'text') e.textContent = v;
        else e.setAttribute(k, v);
      });
    }
    for (var i = 2; i < arguments.length; i++) {
      var c = arguments[i];
      if (c instanceof Node) e.appendChild(c);
      else if (c != null) e.appendChild(document.createTextNode(String(c)));
    }
    return e;
  }

  function app(parent) {
    for (var i = 1; i < arguments.length; i++) {
      if (arguments[i]) parent.appendChild(arguments[i]);
    }
    return parent;
  }

  // ── Global functions ────────────────────────────────────────────
  window.openModal = function (e, file, title, subtitle) {
    if (e && e.stopPropagation) e.stopPropagation();
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalSubtitle').textContent = subtitle;
    document.getElementById('modalFrame').src = file;
    document.getElementById('modalOverlay').classList.add('open');
  };

  window.closeModal = function (e) {
    var overlay = document.getElementById('modalOverlay');
    if (!overlay) return;
    if (!e || e.target === overlay ||
        (e.currentTarget && e.currentTarget.classList.contains('modal-close'))) {
      overlay.classList.remove('open');
      document.getElementById('modalFrame').src = '';
    }
  };

  window.copyLink = function () {
    var url = window.CV_SHARE_URL || window.location.href;
    var label = document.getElementById('copyLabel');
    navigator.clipboard.writeText(url).then(function () {
      if (label) label.textContent = '✓ Copiado';
      setTimeout(function () { if (label) label.textContent = 'Copiar enlace'; }, 2000);
    }).catch(function () { prompt('Copia este enlace:', url); });
  };

  // ── Lang toggle ─────────────────────────────────────────────────
  function buildLangToggle(currentLang, availableLangs) {
    if (!availableLangs || availableLangs.length < 2) return null;
    var toggle = el('div', {});
    toggle.style.cssText = 'position:fixed;top:14px;right:14px;z-index:300;display:flex;gap:2px;background:rgba(8,10,18,0.78);border:1px solid rgba(255,255,255,0.13);border-radius:20px;padding:4px;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);box-shadow:0 2px 18px rgba(0,0,0,0.45);';
    availableLangs.forEach(function (lang) {
      var active = lang === currentLang;
      var btn = el('button', { class: 'cv-lang-btn', text: lang.toUpperCase() });
      btn.style.cssText = 'border:none;cursor:pointer;font-size:7.5pt;font-weight:700;font-family:inherit;padding:3px 11px;border-radius:14px;transition:all 0.2s;letter-spacing:0.4px;' +
        (active
          ? 'background:rgba(255,255,255,0.18);color:rgba(255,255,255,0.95);'
          : 'background:transparent;color:rgba(255,255,255,0.4);');
      if (!active) {
        btn.addEventListener('click', function () {
          document.documentElement.style.transition = 'opacity 0.2s ease';
          document.documentElement.style.opacity = '0';
          setTimeout(function () {
            var url = new URL(window.location.href);
            url.searchParams.set('lang', lang);
            window.location.href = url.toString();
          }, 210);
        });
      }
      toggle.appendChild(btn);
    });
    var s = document.createElement('style');
    s.textContent = '@media print{.cv-lang-toggle{display:none!important}}';
    document.head.appendChild(s);
    toggle.classList.add('cv-lang-toggle');
    return toggle;
  }

  // ── Hero ────────────────────────────────────────────────────────
  function buildHero(p) {
    var img = el('img', { class: 'hero-photo', src: (window.CV_ASSETS_BASE || '') + p.photo, alt: 'Foto de ' + p.name });
    if (p.photoPosition) img.style.objectPosition = p.photoPosition;

    var chips = el('div', { class: 'hero-chips' });
    (p.chips || []).forEach(function (t) { chips.appendChild(el('span', { text: t })); });

    var contact = el('nav', { class: 'hero-contact' });
    (p.contact || []).forEach(function (item) {
      var chip = item.href ? el('a', { class: 'contact-chip', href: item.href }) : el('span', { class: 'contact-chip' });
      if (item.href && (item.href.indexOf('http') === 0 || item.href.indexOf('//') === 0)) {
        chip.setAttribute('target', '_blank');
        chip.setAttribute('rel', 'noopener noreferrer');
      }
      app(chip, el('span', { class: 'icon', text: item.icon }), el('span', { text: item.text }));
      contact.appendChild(chip);
    });

    var stats = el('div', { class: 'hero-stats' });
    (p.stats || []).forEach(function (s) {
      stats.appendChild(app(el('div', { class: 'stat-item' }),
        el('div', { class: 'stat-number', text: s.number }),
        el('div', { class: 'stat-label', text: s.label })
      ));
    });

    return app(el('div', { class: 'hero' }), img,
      app(el('div', { class: 'hero-info' }),
        el('div', { class: 'hero-name', text: p.name }),
        el('div', { class: 'hero-title', text: p.title }),
        chips, contact, stats
      )
    );
  }

  // ── Summary card ────────────────────────────────────────────────
  function buildSummaryCard(s) {
    var card = el('div', { class: 'card' });
    card.appendChild(el('div', { class: 'section-label', text: s.label }));
    (s.paragraphs || []).forEach(function (html, i) {
      var p = el('p', { class: 'summary-text', html: html });
      if (i > 0) p.style.marginTop = '14px';
      card.appendChild(p);
    });
    return card;
  }

  // ── Experience card ─────────────────────────────────────────────
  function buildExperienceCard(exp) {
    var timeline = el('div', { class: 'timeline' });
    (exp.jobs || []).forEach(function (job) {
      var dotCol = app(el('div', { class: 'timeline-dot-col' }),
        el('div', { class: job.current ? 'timeline-dot current' : 'timeline-dot' }),
        el('div', { class: 'timeline-line' })
      );
      var left = app(el('div'),
        el('div', { class: 'job-title-text', text: job.title }),
        el('div', { class: 'job-company-text', text: job.company })
      );
      var right = app(el('div'),
        el('div', { class: 'job-date-text', text: job.dateRange }),
        el('div', { class: 'job-location-text', text: job.location || '' })
      );
      right.style.textAlign = 'right';
      var meta = app(el('div', { class: 'job-meta' }), left, right);
      var bullets = el('ul', { class: 'job-bullets' });
      (job.bullets || []).forEach(function (b) { bullets.appendChild(el('li', { html: b })); });
      var content = app(el('div', { class: 'timeline-content' }), meta, bullets);
      timeline.appendChild(app(el('div', { class: 'timeline-item' }), dotCol, content));
    });
    var card = el('div', { class: 'card' });
    app(card, el('div', { class: 'section-label', text: exp.label }), timeline);
    return card;
  }

  // ── Sidebar: expertise ──────────────────────────────────────────
  function buildExpertiseCard(s) {
    var card = el('div', { class: 'card' });
    card.appendChild(el('div', { class: 'section-label', text: s.label }));
    if (s.bars && s.bars.length) {
      var bars = el('div', { class: 'exp-bars' });
      s.bars.forEach(function (b) {
        var fill = el('div', { class: 'eb-fill' });
        fill.style.setProperty('--w', b.pct + '%');
        bars.appendChild(app(el('div', { class: 'exp-bar' }),
          app(el('div', { class: 'eb-meta' }),
            el('span', { class: 'eb-name', text: b.name }),
            el('span', { class: 'eb-tag', text: b.tag })
          ),
          app(el('div', { class: 'eb-track' }), fill)
        ));
      });
      card.appendChild(bars);
    }
    (s.skillGroups || []).forEach(function (g, i) {
      var grp = el('div', { class: 'skill-group' });
      if (i === 0 && s.bars && s.bars.length) grp.style.marginTop = '22px';
      else if (i > 0) grp.style.marginTop = '14px';
      grp.appendChild(el('div', { class: 'skill-group-label', text: g.label }));
      var pills = el('div', { class: 'skill-pills' });
      (g.skills || []).forEach(function (sk) {
        pills.appendChild(el('span', { class: sk.primary ? 'pill primary' : 'pill', text: sk.text }));
      });
      grp.appendChild(pills);
      card.appendChild(grp);
    });
    return card;
  }

  // ── Sidebar: cert list (certifications, training) ───────────────
  function buildCertListCard(s) {
    var card = el('div', { class: 'card' });
    card.appendChild(el('div', { class: 'section-label', text: s.label }));
    if (s.inProgressNote) {
      card.appendChild(el('div', { class: 'cert-in-progress', text: s.inProgressNote }));
    }
    (s.items || []).forEach(function (item) {
      var dot = el('div', { class: item.dot === 'gold' ? 'cert-dot gold' : 'cert-dot' });
      var nameEl = el('div', { class: 'cert-name-text', text: item.name });
      if (item.badge) {
        var badge = el('span', { text: item.badge });
        badge.style.cssText = 'font-size:7.5pt;background:#d1f0dc;color:#1a7f37;border-radius:10px;padding:1px 7px;font-weight:700;margin-left:5px;';
        nameEl.appendChild(badge);
      }
      var metaEl = el('div', { class: 'cert-meta', text: item.meta });
      if (item.verifyUrl) {
        metaEl.appendChild(document.createTextNode(' · '));
        metaEl.appendChild(el('a', { href: item.verifyUrl, text: 'Verify ↗', target: '_blank', rel: 'noopener noreferrer' }));
      }
      card.appendChild(app(el('div', { class: 'cert-item' }), dot,
        app(el('div', { class: 'cert-body' }), nameEl, metaEl)
      ));
    });
    return card;
  }

  // ── Sidebar: education ──────────────────────────────────────────
  function buildEduCard(s) {
    var card = el('div', { class: 'card' });
    card.appendChild(el('div', { class: 'section-label', text: s.label }));
    (s.items || []).forEach(function (item) {
      var block = el('div', { class: 'edu-block' });
      block.appendChild(el('div', { class: 'edu-degree-text', text: item.degree }));
      if (item.spec) block.appendChild(el('div', { class: 'edu-spec', text: item.spec }));
      block.appendChild(el('div', { class: 'edu-school-text', text: item.school }));
      block.appendChild(el('div', { class: 'edu-date-text', text: item.dateRange }));
      card.appendChild(block);
    });
    return card;
  }

  // ── Sidebar: languages ──────────────────────────────────────────
  function buildLangsCard(s) {
    var card = el('div', { class: 'card' });
    card.appendChild(el('div', { class: 'section-label', text: s.label }));
    (s.items || []).forEach(function (item, i) {
      var fill = el('div', { class: 'lang-fill' });
      fill.style.width = item.pct + '%';
      var li = app(el('div', { class: 'lang-item' }),
        app(el('div', { class: 'lang-top' }),
          el('span', { class: 'lang-name-text', text: item.name }),
          el('span', { class: 'lang-level-text', text: item.level })
        ),
        app(el('div', { class: 'lang-track' }), fill)
      );
      if (i > 0) li.style.marginTop = '14px';
      card.appendChild(li);
    });
    return card;
  }

  // ── Sidebar: profiles ───────────────────────────────────────────
  function buildProfilesCard(s) {
    var card = el('div', { class: 'card' });
    card.appendChild(el('div', { class: 'section-label', text: s.label }));
    var row = el('div', { class: 'link-row' });
    (s.items || []).forEach(function (item) {
      var a = el('a', { class: 'profile-link', href: item.href, target: '_blank', rel: 'noopener noreferrer' });
      a.textContent = item.icon + ' ' + item.text;
      row.appendChild(a);
    });
    card.appendChild(row);
    return card;
  }

  // ── Sidebar: text ───────────────────────────────────────────────
  function buildTextCard(s) {
    var card = el('div', { class: 'card' });
    card.appendChild(el('div', { class: 'section-label', text: s.label }));
    var p = el('div', { text: s.content });
    p.style.cssText = 'font-size:9pt;color:var(--c-text-muted,#6e6e73);line-height:1.6;';
    card.appendChild(p);
    return card;
  }

  function buildSidebarSection(s) {
    switch (s.type) {
      case 'expertise':      return buildExpertiseCard(s);
      case 'certifications': return buildCertListCard(s);
      case 'training':       return buildCertListCard(s);
      case 'education':      return buildEduCard(s);
      case 'languages':      return buildLangsCard(s);
      case 'profiles':       return buildProfilesCard(s);
      case 'text':           return buildTextCard(s);
      default:               return null;
    }
  }

  // ── Cert gallery ────────────────────────────────────────────────
  function buildCertGallery(cg) {
    if (!cg || !cg.certs || !cg.certs.length) return null;
    var section = el('div', { class: 'certs-section' });
    var lbl = el('div', { class: 'section-label', text: cg.label });
    lbl.style.cssText = 'padding:0 4px 16px;font-size:9pt;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;';
    section.appendChild(lbl);
    var grid = el('div', { class: 'certs-grid', id: 'certsGrid' });
    cg.certs.forEach(function (c) {
      var card = el('div', { class: 'cert-card' });
      card.appendChild(el('div', { class: 'cert-card-icon ' + (c.type || ''), text: c.icon }));
      var titleEl = el('div', { class: 'cert-card-title', text: c.title });
      if (c.badge) {
        var b = el('span', { text: c.badge });
        b.style.cssText = 'font-size:7.5pt;background:#d1f0dc;color:#1a7f37;border-radius:10px;padding:1px 7px;font-weight:700;margin-left:4px;';
        titleEl.appendChild(b);
      }
      card.appendChild(titleEl);
      card.appendChild(el('div', { class: 'cert-card-meta', text: c.issuer + ' · ' + c.date }));
      var btn = el('button', { class: 'cert-card-btn', text: 'View Certificate ↗' });
      (function (cert) {
        btn.addEventListener('click', function (e) {
          window.openModal(e, (window.CV_ASSETS_BASE || '') + cert.file, cert.title, cert.issuer + ' · ' + cert.date);
        });
      }(c));
      card.appendChild(btn);
      grid.appendChild(card);
    });
    section.appendChild(grid);
    return section;
  }

  // ── Modal ───────────────────────────────────────────────────────
  function buildModal() {
    var overlay = el('div', { class: 'modal-overlay', id: 'modalOverlay' });
    overlay.addEventListener('click', function (e) { window.closeModal(e); });
    var box = el('div', { class: 'modal-box' });
    box.addEventListener('click', function (e) { e.stopPropagation(); });
    var closeBtn = el('button', { class: 'modal-close', text: '✕' });
    closeBtn.addEventListener('click', function (e) { window.closeModal(e); });
    var body = app(el('div', { class: 'modal-body' }),
      el('iframe', { id: 'modalFrame', src: '', title: 'Visor de certificado' })
    );
    app(box,
      app(el('div', { class: 'modal-header' }),
        app(el('div'),
          el('div', { class: 'modal-title', id: 'modalTitle' }),
          el('div', { class: 'modal-subtitle', id: 'modalSubtitle' })
        ),
        closeBtn
      ),
      body
    );
    overlay.appendChild(box);
    return overlay;
  }

  // ── Share bar ───────────────────────────────────────────────────
  function buildShareBar(items) {
    var bar = el('div', { class: 'share-bar' });
    (items || []).forEach(function (item) {
      if (item.type === 'divider') { bar.appendChild(el('div', { class: 'share-divider' })); return; }
      var btn;
      if (item.type === 'copy') {
        btn = el('button', { class: 'share-btn' });
        btn.addEventListener('click', function () { window.copyLink(); });
        app(btn,
          el('span', { class: 'share-icon', text: item.icon }),
          el('span', { class: 'share-label', id: 'copyLabel', text: item.label })
        );
      } else if (item.type === 'print') {
        btn = el('button', { class: 'share-btn' });
        btn.addEventListener('click', function () { window.print(); });
        app(btn, el('span', { class: 'share-icon', text: item.icon }), el('span', { class: 'share-label', text: item.label }));
      } else if (item.type === 'link') {
        btn = el('a', { class: 'share-btn', href: item.href, target: '_blank', rel: 'noopener noreferrer' });
        app(btn, el('span', { class: 'share-icon', text: item.icon }), el('span', { class: 'share-label', text: item.label }));
      } else { return; }
      bar.appendChild(btn);
    });
    return bar;
  }

  // ── Loader ──────────────────────────────────────────────────────
  function buildJsonLd(data) {
    var p = data.profile || {};
    var email = '', phone = '', locality = '';
    (p.contact || []).forEach(function (c) {
      if (c.href && c.href.indexOf('mailto:') === 0) email = c.href.slice(7);
      else if (c.href && c.href.indexOf('tel:') === 0) phone = c.href.slice(4);
      else if (!c.href && c.text) locality = c.text;
    });
    var desc = '';
    if (data.summary && data.summary.paragraphs && data.summary.paragraphs.length) {
      desc = data.summary.paragraphs[0].replace(/<[^>]+>/g, '');
    }
    var sameAs = [];
    (data.sidebar || []).forEach(function (s) {
      if (s.type === 'profiles') (s.items || []).forEach(function (it) { if (it.href) sameAs.push(it.href); });
    });
    var person = { '@context': 'https://schema.org', '@type': 'Person', 'name': p.name, 'jobTitle': p.title, 'url': (data.meta || {}).shareUrl || window.location.href, 'description': desc };
    if (email) person.email = email;
    if (phone) person.telephone = phone;
    if (locality) person.address = { '@type': 'PostalAddress', 'addressLocality': locality, 'addressCountry': 'MX' };
    if (sameAs.length) person.sameAs = sameAs;
    var s = document.createElement('script');
    s.type = 'application/ld+json';
    s.text = JSON.stringify(person);
    document.head.appendChild(s);
  }

  function buildLoader() {
    var s = document.createElement('style');
    s.textContent =
      '@keyframes cv-spin{to{transform:rotate(360deg)}}' +
      '.cv-loader{position:fixed;inset:0;z-index:500;display:flex;flex-direction:column;' +
        'align-items:center;justify-content:center;gap:16px;pointer-events:none;}' +
      '.cv-loader.out{opacity:0;transition:opacity 0.35s ease;}';
    document.head.appendChild(s);
    var ring = document.createElement('div');
    ring.style.cssText = 'width:36px;height:36px;border:2.5px solid rgba(255,255,255,0.1);' +
      'border-top-color:rgba(255,255,255,0.65);border-radius:50%;animation:cv-spin 0.75s linear infinite;';
    var txt = document.createElement('div');
    txt.style.cssText = 'font-size:8pt;font-weight:500;color:rgba(255,255,255,0.28);' +
      'letter-spacing:1.5px;text-transform:uppercase;';
    txt.textContent = (_langParam || window.CV_LANG_DEFAULT || 'es') === 'en' ? 'Loading' : 'Cargando';
    var loader = document.createElement('div');
    loader.className = 'cv-loader';
    loader.appendChild(ring);
    loader.appendChild(txt);
    return loader;
  }

  // ── Main ────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    var loader = buildLoader();
    document.body.appendChild(loader);

    var base = window.CV_ASSETS_BASE || '';
    var dataFile = base + (_langParam ? ('data.' + _langParam + '.json') : 'data.json');
    fetch(dataFile)
      .then(function (r) { return r.ok ? r : fetch(base + 'data.json'); })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var meta = data.meta || {};
        if (meta.pageTitle) document.title = meta.pageTitle;
        if (meta.lang) document.documentElement.lang = meta.lang;
        if (meta.description) {
          var m = document.querySelector('meta[name="description"]');
          if (!m) { m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); }
          m.content = meta.description;
        }
        var canonicalUrl = _langParam ? (meta.shareUrl + '?lang=' + _langParam) : meta.shareUrl;
        if (canonicalUrl) {
          var cLink = document.querySelector('link[rel="canonical"]');
          if (!cLink) { cLink = document.createElement('link'); cLink.rel = 'canonical'; document.head.appendChild(cLink); }
          cLink.href = canonicalUrl;
          window.CV_SHARE_URL = canonicalUrl;
        }
        buildJsonLd(data);

        var page = el('div', { class: 'page' });
        if (data.profile) page.appendChild(buildHero(data.profile));

        var mainCol = el('div', { class: 'main-col' });
        if (data.summary) mainCol.appendChild(buildSummaryCard(data.summary));
        if (data.experience) mainCol.appendChild(buildExperienceCard(data.experience));

        var sideCol = el('div', { class: 'sidebar-col' });
        (data.sidebar || []).forEach(function (s) {
          var sec = buildSidebarSection(s);
          if (sec) sideCol.appendChild(sec);
        });

        page.appendChild(app(el('div', { class: 'grid' }), mainCol, sideCol));

        var gallery = buildCertGallery(data.certGallery);
        if (gallery) page.appendChild(gallery);

        page.appendChild(buildModal());
        document.body.appendChild(page);

        if (data.shareBar) document.body.appendChild(buildShareBar(data.shareBar));

        var toggle = buildLangToggle(meta.lang, meta.availableLangs);
        if (toggle) document.body.appendChild(toggle);

        loader.classList.add('out');
        setTimeout(function () { if (loader.parentNode) loader.parentNode.removeChild(loader); }, 380);
        setTimeout(function () { document.body.classList.add('loaded'); }, 200);
      })
      .catch(function (err) {
        console.error('cv-renderer: failed to load data.json', err);
        if (loader.parentNode) loader.parentNode.removeChild(loader);
      });
  });

  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') window.closeModal(); });
}());
