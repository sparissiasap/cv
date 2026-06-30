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
  var SHARE_ICONS = {
    'bi-printer':    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1"/><path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1"/></svg>',
    'bi-linkedin':   '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z"/></svg>',
    'bi-twitter-x':  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z"/></svg>',
    'bi-whatsapp':   '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/></svg>',
    'bi-link-45deg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1 1 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4 4 0 0 1-.128-1.287z"/><path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243z"/></svg>'
  };

  function shareIcon(name) {
    return el('span', { class: 'share-icon', html: SHARE_ICONS[name] || '' });
  }

  function buildShareBar(items) {
    var bar = el('div', { class: 'share-bar' });
    (items || []).forEach(function (item) {
      if (item.type === 'divider') { bar.appendChild(el('div', { class: 'share-divider' })); return; }
      var btn;
      if (item.type === 'copy') {
        btn = el('button', { class: 'share-btn' });
        btn.addEventListener('click', function () { window.copyLink(); });
        app(btn,
          shareIcon(item.icon),
          el('span', { class: 'share-label', id: 'copyLabel', text: item.label })
        );
      } else if (item.type === 'print') {
        btn = el('button', { class: 'share-btn' });
        btn.addEventListener('click', function () { window.print(); });
        app(btn, shareIcon(item.icon), el('span', { class: 'share-label', text: item.label }));
      } else if (item.type === 'link') {
        btn = el('a', { class: 'share-btn', href: item.href, target: '_blank', rel: 'noopener noreferrer' });
        app(btn, shareIcon(item.icon), el('span', { class: 'share-label', text: item.label }));
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
