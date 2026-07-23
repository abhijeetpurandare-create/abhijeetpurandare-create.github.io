(function(){
  "use strict";
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const esc = (s) => (s == null ? "" : String(s));

  const PROJECT_ORDER = ["lmfe", "hyperlocal"];
  let currentProject = "lmfe";
  let lightboxState = { evidenceKeys: [], index: 0, activePin: null };

  /* ---------------- rendering ---------------- */

  function sevLabel(s){ return s === "critical" ? "Critical" : s === "major" ? "Major" : "Minor"; }

  function renderProject(key){
    const data = SITE_DATA[key];
    const main = $("#main");
    main.innerHTML = "";
    main.appendChild(renderHero(data));
    main.appendChild(renderExec(data));
    // Build pill tabs + stage panels
    const stagesContainer = document.createElement("div");
    stagesContainer.className = "stages-tabbed";
    const pillBar = document.createElement("div");
    pillBar.className = "stage-pills";
    data.stages.forEach((stage, i) => {
      const pill = document.createElement("button");
      pill.className = "stage-pill" + (i === 0 ? " active" : "");
      pill.setAttribute("data-stage-index", i);
      pill.textContent = stage.code;
      pillBar.appendChild(pill);
    });
    stagesContainer.appendChild(pillBar);
    data.stages.forEach((stage, i) => {
      const panel = renderStage(data, stage, i);
      panel.classList.add("stage-panel");
      if (i !== 0) panel.style.display = "none";
      stagesContainer.appendChild(panel);
    });
    main.appendChild(stagesContainer);
    wireStagesTabs();
    renderRail(data);
    renderFooter(data);
    wireEvidenceThumbs(data);
    wireExpandButtons();
    setupScrollSpy();
  }

  function renderHero(data){
    const totals = computeTotals(data);
    const el = document.createElement("section");
    el.className = "hero";
    el.innerHTML = `
      <div class="eyebrow">${esc(data.tag)} \u2014 research artifact</div>
      <h1>${esc(data.heroTitle)}</h1>
      <p class="hero-abstract">${esc(data.heroAbstract)}</p>
      <div class="stat-strip">${totals.stats.map(s => `
        <div class="stat"><span class="num" data-countup="${s.value}">0</span><span class="lbl">${esc(s.label)}</span></div>
      `).join("")}</div>
      ${data.correctionNote ? `<div class="stat-note">\u25B8 ${esc(data.correctionNote)}</div>` : ""}
    `;
    requestAnimationFrame(() => animateCountups(el));
    return el;
  }

  function computeTotals(data){
    if (data.pendingDetail){
      const t = data.stages.reduce((a, s) => {
        a.issues += s.counts.issues; a.challenges += s.counts.challenges;
        a.metrics += s.counts.metrics; a.opportunities += s.counts.opportunities;
        return a;
      }, { issues: 0, challenges: 0, metrics: 0, opportunities: 0 });
      return { stats: [
        { value: 8, label: "App sections evaluated" },
        { value: t.issues, label: "Heuristic issues (itemised)" },
        { value: t.challenges, label: "Design challenges" },
        { value: t.metrics, label: "Metrics identified" },
        { value: t.opportunities, label: "Opportunity areas" }
      ]};
    }
    const t = data.stages.reduce((a, s) => {
      a.touchpoints += s.touchpoints.length; a.challenges += s.challenges.length;
      a.metrics += s.metrics.length; a.opportunities += s.opportunities.length;
      return a;
    }, { touchpoints: 0, challenges: 0, metrics: 0, opportunities: 0 });
    return { stats: [
      { value: data.stages.length, label: "Journey stages" },
      { value: t.touchpoints, label: "Touchpoints mapped" },
      { value: t.challenges, label: "Design challenges" },
      { value: t.metrics, label: "Metrics identified" },
      { value: t.opportunities, label: "Opportunity areas" }
    ]};
  }

  function animateCountups(scope){
    $$("[data-countup]", scope).forEach(node => {
      const target = parseInt(node.getAttribute("data-countup"), 10) || 0;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches){ node.textContent = target; return; }
      const start = performance.now(), dur = 600;
      function tick(now){
        const p = Math.min(1, (now - start) / dur);
        node.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }

  function renderExec(data){
    const el = document.createElement("section");
    el.className = "exec";
    // Show top 7 challenges (one per high-level finding) and top 7 opportunities as cards
    const topChallenges = [
      { icon: "\uD83D\uDD17", title: "Onboarding is fragmented and confusing", severity: "critical" },
      { icon: "\uD83C\uDF10", title: "No multilingual support for low-literacy riders", severity: "major" },
      { icon: "\uD83D\uDCCB", title: "Shipment list lacks information hierarchy", severity: "major" },
      { icon: "\uD83D\uDDFA\uFE0F", title: "No route optimization for deliveries", severity: "critical" },
      { icon: "\uD83D\uDCB3", title: "Payment and verification flows break mid-delivery", severity: "critical" },
      { icon: "\u274C", title: "Cancellation flow is unreliable", severity: "major" },
      { icon: "\uD83D\uDCCA", title: "Earnings and summary screens lack clarity", severity: "major" }
    ];
    const topOpps = [
      { icon: "\uD83E\uDDED", title: "Unified guided onboarding wizard" },
      { icon: "\uD83D\uDDE3\uFE0F", title: "Multilingual support and accessibility" },
      { icon: "\uD83D\uDCCD", title: "Smart shipment list with route optimization" },
      { icon: "\uD83D\uDCB0", title: "Streamlined COD payment flow" },
      { icon: "\uD83D\uDD04", title: "Reliable cancellation with OTP fallbacks" },
      { icon: "\uD83D\uDCB5", title: "Transparent earnings and filtering" },
      { icon: "\u2705", title: "Guided end-of-day reconciliation flow" }
    ];
    el.innerHTML = `
      <h2 style="font-family:var(--display);font-weight:700;font-size:44px;line-height:1.06;letter-spacing:-.01em;text-transform:none">Top 10 Recommendations From Design Team</h2>
      <div class="exec-grid">
        <div>
          <div class="exec-col-title">Challenges</div>
          <div class="exec-cards">${topChallenges.map(c => `
            <div class="exec-card challenge"><span class="exec-card-icon">${c.icon}</span><span class="exec-card-title">${esc(c.title)}</span><span class="sev ${c.severity}">${sevLabel(c.severity)}</span></div>
          `).join("")}</div>
        </div>
        <div>
          <div class="exec-col-title">Possible solutions</div>
          <div class="exec-cards">${topOpps.map(o => `
            <div class="exec-card opportunity"><span class="exec-card-icon">${o.icon}</span><span class="exec-card-title">${esc(o.title)}</span></div>
          `).join("")}</div>
        </div>
      </div>`;
    return el;
  }

  function renderStage(data, stage, i){
    const el = document.createElement("section");
    el.className = "stage";
    el.id = stage.id;
    const evidenceUsed = new Set();
    stage.challenges.forEach(c => (c.evidence || []).forEach(k => evidenceUsed.add(k)));

    el.innerHTML = `
      <div class="ghost-num">${String(i+1).padStart(2,"0")}</div>
      <div class="stage-stub"><span class="code">${esc(stage.code)}</span></div>
      <h2>${esc(stage.title)}</h2>
      <p class="stage-narrative">${esc(stage.narrative)}</p>

      <div class="stepper">${stage.touchpoints.map((t, idx) => `
        <div class="step"><span class="idx">${idx+1}</span><span class="txt">${esc(t)}</span></div>
      `).join("")}</div>

      <h3 class="section-subtitle">Challenges \u2014 Users</h3>
      ${renderUserNote(stage)}

      <h3 class="section-subtitle">Design challenges</h3>
      <div class="challenges">${stage.challenges.map(c => renderChallengeCard(data, c)).join("")}</div>

      ${stage.metrics.length ? `
      <h3 class="section-subtitle">Metrics to be targeted</h3>
      <table class="metrics-table">
        <thead><tr><th>Metric</th><th>What it tells us</th></tr></thead>
        <tbody>${stage.metrics.map(m => `<tr><td>${esc(m.name)}</td><td>${esc(m.def)}</td></tr>`).join("")}</tbody>
      </table>` : ""}

      <h3 class="section-subtitle">Possible solutions</h3>
      <div class="opps">${stage.opportunities.map(o => `
        <div class="opp-card">
          <h4>${esc(o.title)}</h4>
          <p>${esc(o.body)}</p>
          ${o.addresses && o.addresses.length ? `<div class="opp-links">${o.addresses.map(id => `<a href="#${id}">resolves \u2192 ${esc(findChallengeTitle(stage, id))}</a>`).join("")}</div>` : ""}
        </div>
      `).join("")}</div>
    `;
    return el;
  }

  function findChallengeTitle(stage, id){
    const c = stage.challenges.find(c => c.id === id);
    return c ? shorten(c.title, 40) : id;
  }
  function shorten(s, n){ return s.length > n ? s.slice(0, n - 1) + "\u2026" : s; }

  function renderUserNote(stage){
    if (stage.userChallengesNote) {
      return `<div class="user-note"><span class="lbl">Challenges \u2014 users</span>${esc(stage.userChallengesNote)}</div>`;
    }
    if (!stage.userChallenges || !stage.userChallenges.length) return "";
    return `<div class="user-note"><span class="lbl">Challenges \u2014 users</span>
      <ul>${stage.userChallenges.map(u => `<li>${esc(u)}</li>`).join("")}</ul></div>`;
  }

  function renderChallengeCard(data, c){
    const thumbs = (c.evidence || []).map(key => {
      const ev = data.evidence[key];
      if (!ev) return "";
      const pinCount = ev.pins ? ev.pins.length : 0;
      return `<button class="ev-thumb" data-ev="${key}" data-project="${data.slug}" aria-label="View evidence: ${esc(ev.caption)}">
        <span class="frame"><img loading="lazy" width="104" height="140" src="assets/thumbs/${key}.webp" alt="${esc(ev.caption)}">
          ${pinCount ? `<span class="pincount">${pinCount}</span>` : ""}</span>
        <span class="cap">${esc(ev.caption)}</span>
      </button>`;
    }).join("");
    return `
      <article class="chal-card" id="${c.id}">
        <div class="chal-head"><span class="sev ${c.severity}">${sevLabel(c.severity)}</span><h3>${esc(c.title)}</h3></div>
        <p class="chal-body${c.body.length > 120 ? ' clamp' : ''}">${esc(c.body)}</p>
        ${c.body.length > 120 ? '<button class="chal-more" type="button">Read more</button>' : ''}
        ${thumbs ? `<button class="ev-toggle" type="button">Show screenshots</button><div class="ev-rail hidden">${thumbs}</div>` : ""}
      </article>`;
  }

  function renderHyperlocalStages(data){
    const el = document.createElement("section");
    el.className = "stage";
    el.id = "hl-stages";
    el.innerHTML = `
      <div class="stage-stub"><span class="code">STAGES</span></div>
      <h2>Journey stages</h2>
      <div class="pending-note">\u25B8 Detailed challenge write-ups and screenshot evidence for Hyperlocal are migrating from the legacy artifact and aren\u2019t attached yet. Stage-level counts below are confirmed; full findings follow the same card format as LM-FE once ported.</div>
      ${data.stages.map(s => `
        <div class="hl-stage-row" id="${s.id}">
          <span class="code">${esc(s.code)}</span>
          <span class="t">${esc(s.title)}</span>
          <span class="counts">
            <span><b>${s.counts.issues}</b> issues</span>
            <span><b>${s.counts.challenges}</b> challenges</span>
            <span><b>${s.counts.metrics}</b> metrics</span>
            <span><b>${s.counts.opportunities}</b> opportunities</span>
          </span>
        </div>
      `).join("")}
    `;
    return el;
  }

  function renderRail(data){
    const rail = $("#rail");
    const toc = $("#toc-toggle");
    rail.innerHTML = "";
    toc.innerHTML = "";
  }

  function renderFooter(data){
    $("#footer").innerHTML = `
      <div class="shell">
        <p>${esc(data.name)} \u2014 user journey research \u00b7 Data sourced from a Figma research artifact \u00b7
        <a href="${esc(data.figmaUrl)}" target="_blank" rel="noopener">View in Figma \u2197</a></p>
      </div>`;
  }

  function wireStagesTabs(){
    const pills = $$(".stage-pill");
    const panels = $$(".stage-panel");
    pills.forEach(pill => {
      pill.addEventListener("click", () => {
        const idx = parseInt(pill.getAttribute("data-stage-index"), 10);
        pills.forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        panels.forEach((panel, i) => {
          panel.style.display = i === idx ? "" : "none";
        });
      });
    });
  }

  function wireExpandButtons(){
    $$(".chal-more").forEach(btn => {
      btn.addEventListener("click", () => {
        const body = btn.previousElementSibling;
        const collapsed = body.classList.toggle("clamp");
        btn.textContent = collapsed ? "Read more" : "Show less";
      });
    });
    $$(".ev-toggle").forEach(btn => {
      btn.addEventListener("click", () => {
        const rail = btn.nextElementSibling;
        const isHidden = rail.classList.toggle("hidden");
        btn.textContent = isHidden ? "Show screenshots" : "Hide screenshots";
      });
    });
  }

  /* ---------------- scroll-spy ---------------- */
  let spyObserver = null;
  function setupScrollSpy(){
    if (spyObserver) spyObserver.disconnect();
    const targets = $$(".stage[id]");
    if (!targets.length) return;
    spyObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting){
          const id = e.target.id;
          $$(".rail-item").forEach(a => a.classList.toggle("current", a.dataset.target === id));
          $$("#toc-toggle a").forEach(a => a.classList.toggle("current", a.dataset.target === id));
        }
      });
    }, { rootMargin: "-20% 0px -70% 0px", threshold: 0 });
    targets.forEach(t => spyObserver.observe(t));
  }

  /* ---------------- reading progress ---------------- */
  function updateProgress(){
    const h = document.documentElement;
    const scrolled = h.scrollTop;
    const height = h.scrollHeight - h.clientHeight;
    $("#progress").style.width = height > 0 ? `${(scrolled / height) * 100}%` : "0%";
  }
  document.addEventListener("scroll", updateProgress, { passive: true });

  /* ---------------- evidence lightbox ---------------- */
  function wireEvidenceThumbs(){
    $$(".ev-thumb").forEach(btn => {
      btn.addEventListener("click", () => openLightbox(btn.dataset.project, btn.dataset.ev));
    });
  }

  function openLightbox(projectKey, key){
    const data = SITE_DATA[projectKey];
    const keys = Object.keys(data.evidence);
    lightboxState = { data, evidenceKeys: keys, index: keys.indexOf(key), activePin: null };
    renderLightbox();
    $("#lightbox").classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeLightbox(){
    $("#lightbox").classList.remove("open");
    document.body.style.overflow = "";
  }
  function stepLightbox(delta){
    const n = lightboxState.evidenceKeys.length;
    lightboxState.index = (lightboxState.index + delta + n) % n;
    lightboxState.activePin = null;
    renderLightbox();
  }

  function renderLightbox(){
    const { data, evidenceKeys, index } = lightboxState;
    const key = evidenceKeys[index];
    const ev = data.evidence[key];
    const pins = ev.pins || [];
    const stage = $("#lb-stage");
    stage.innerHTML = `
      <div class="lb-frame">
        <img src="assets/screens/${key}.webp" alt="${esc(ev.caption)}">
        ${pins.map((p, i) => `<button class="lb-pin" style="left:${p[0]}%; top:${p[1]}%" data-i="${i}" aria-label="Annotation ${i+1}">${i+1}</button>`).join("")}
      </div>
      <div class="lb-side">
        <div class="lb-cap">${esc(ev.caption)} \u00b7 ${index+1} / ${evidenceKeys.length}</div>
        ${pins.length ? `<ul class="lb-notes">${pins.map((p, i) => `
          <li class="lb-note" data-i="${i}"><span class="num">${i+1}</span><p>${esc(p[2])}</p></li>
        `).join("")}</ul>` : `<div class="lb-empty">Supporting evidence \u2014 no specific annotations on this screen.</div>`}
      </div>
    `;
    $$(".lb-pin", stage).forEach(pin => pin.addEventListener("click", () => setActivePin(parseInt(pin.dataset.i, 10))));
    $$(".lb-note", stage).forEach(note => note.addEventListener("click", () => setActivePin(parseInt(note.dataset.i, 10))));
  }

  function setActivePin(i){
    lightboxState.activePin = i;
    $$(".lb-pin").forEach((p, idx) => p.classList.toggle("active", idx === i));
    $$(".lb-note").forEach((n, idx) => n.classList.toggle("active", idx === i));
  }

  document.addEventListener("keydown", (e) => {
    if (!$("#lightbox").classList.contains("open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") stepLightbox(1);
    if (e.key === "ArrowLeft") stepLightbox(-1);
  });

  /* ---------------- boot ---------------- */
  document.addEventListener("DOMContentLoaded", () => {
    $("#lb-close").addEventListener("click", closeLightbox);
    $("#lb-prev").addEventListener("click", () => stepLightbox(-1));
    $("#lb-next").addEventListener("click", () => stepLightbox(1));
    $("#lightbox").addEventListener("click", (e) => { if (e.target.id === "lightbox") closeLightbox(); });

    renderProject("lmfe");
    updateProgress();
  });
})();
