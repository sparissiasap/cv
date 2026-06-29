// Requires window.CERTS to be defined before DOMContentLoaded

function buildCertsGrid() {
  const grid = document.getElementById('certsGrid');
  if (!grid || !window.CERTS) return;
  window.CERTS.forEach(c => {
    const badgeHTML = c.badge
      ? ` <span style="font-size:7.5pt;background:#d1f0dc;color:#1a7f37;border-radius:10px;padding:1px 7px;font-weight:700;">${c.badge}</span>`
      : '';
    const card = document.createElement('div');
    card.className = 'cert-card';
    card.innerHTML = `
      <div class="cert-card-icon ${c.type}">${c.icon}</div>
      <div class="cert-card-title">${c.title}${badgeHTML}</div>
      <div class="cert-card-meta">${c.issuer} &nbsp;·&nbsp; ${c.date}</div>
      <button class="cert-card-btn"
        onclick="openModal(event, '${c.file}', '${c.title}', '${c.issuer} · ${c.date}')">
        View Certificate ↗
      </button>`;
    grid.appendChild(card);
  });
}

function openModal(e, file, title, subtitle) {
  e.stopPropagation();
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalSubtitle').textContent = subtitle;
  document.getElementById('modalFrame').src = file;
  document.getElementById('modalOverlay').classList.add('open');
}

function closeModal(e) {
  if (!e || e.target === document.getElementById('modalOverlay') || e.currentTarget?.classList?.contains('modal-close')) {
    document.getElementById('modalOverlay').classList.remove('open');
    document.getElementById('modalFrame').src = '';
  }
}

function copyLink() {
  const url = window.CV_SHARE_URL || window.location.href;
  const label = document.getElementById('copyLabel');
  navigator.clipboard.writeText(url).then(() => {
    label.textContent = '✓ Copiado';
    setTimeout(() => { label.textContent = 'Copiar enlace'; }, 2000);
  }).catch(() => {
    prompt('Copia este enlace:', url);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  buildCertsGrid();
  setTimeout(() => document.body.classList.add('loaded'), 200);
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
