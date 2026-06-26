const certs = [
  // ── Anthropic Academy ──
  { title: "Claude Code in Action",                   issuer: "Anthropic Academy", date: "Mar 2026", file: "pdf/certificate-6m2nfq2ge3ps-1774474974.pdf", icon: "🤖", type: "anthropic" },
  { title: "AI Fluency: Framework & Foundations",     issuer: "Anthropic Academy", date: "Apr 2026", file: "pdf/certificate-9sk4x2zuo2c6-1775172881.pdf", icon: "🤖", type: "anthropic", badge: "10/10" },
  { title: "Claude 101",                              issuer: "Anthropic Academy", date: "Apr 2026", file: "pdf/certificate-y2wq672nm5mq-1775240172.pdf", icon: "🤖", type: "anthropic" },
  { title: "Introduction to Agent Skills",            issuer: "Anthropic Academy", date: "Apr 2026", file: "pdf/certificate-iebnmqjfiycv-1775246077.pdf", icon: "🤖", type: "anthropic" },
  { title: "Introduction to Model Context Protocol",  issuer: "Anthropic Academy", date: "Apr 2026", file: "pdf/certificate-ukekddvraomc-1775255538.pdf", icon: "🤖", type: "anthropic" },
  { title: "Introduction to subagents",               issuer: "Anthropic Academy", date: "Apr 2026", file: "pdf/certificate-zxtw2d5u9797-1775578166.pdf", icon: "🤖", type: "anthropic" },
  { title: "Building with the Claude API",            issuer: "Anthropic Academy", date: "Apr 2026", file: "pdf/certificate-ftchffjwh66e-1775586811.pdf", icon: "🤖", type: "anthropic" },
  { title: "Model Context Protocol: Advanced Topics", issuer: "Anthropic Academy", date: "Apr 2026", file: "pdf/certificate-8kjqw4p326od-1775588457.pdf", icon: "🤖", type: "anthropic" },
  { title: "Introduction to Claude Cowork",           issuer: "Anthropic Academy", date: "Apr 2026", file: "pdf/certificate-km7a7esp3ke7-1775755349.pdf", icon: "🤖", type: "anthropic" },
  { title: "Claude Code 101",                         issuer: "Anthropic Academy", date: "Apr 2026", file: "pdf/certificate-y3a89fbpadwk-1775756321.pdf", icon: "🤖", type: "anthropic" },
  // ── Industry ──
  { title: "Sitecore 10 .NET Developer Certification", issuer: "Sitecore",  date: "Mar 2024", file: "pdf/Sitecore.pdf",                           icon: "🏗️", type: "sitecore" },
  { title: "Professional Scrum Developer I (PSD I)",   issuer: "Scrum.org", date: "Jan 2019", file: "pdf/Professional Scrum Developer I.pdf",     icon: "📋", type: "scrum" },
];

function buildCertsGrid() {
  const grid = document.getElementById('certsGrid');
  certs.forEach(c => {
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

document.addEventListener('DOMContentLoaded', () => {
  buildCertsGrid();
  // Trigger skill bar fill animations after a short paint delay
  setTimeout(() => document.body.classList.add('loaded'), 200);
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
