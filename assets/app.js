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
    data.stages.forEach((stage, i) => main.appendChild(renderStage(data, stage, i)));
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
      <div class="minimap">${
        (data.stages || []).map((s, i) => {
          const count = data.pendingDetail ? s.counts.challenges : s.challenges.length;
          return `<a class="mini-stub" href="#${s.id}">
            <div class="code">${esc(s.code)}</div>
            <div class="t"><span class="dot"></span>${esc(s.title)}</div>
          </a>`;
        }).join("")
      }</div>
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
    if (data.pendingDetail){
      el.innerHTML = `
        <h2>Key findings at a glance</h2>
        <div class="exec-grid">
          <div>
            <div class="exec-col-title">Challenges</div>
            <ul class="exec-list">${data.execChallenges.map(c => `<li><span class="ico">${c.icon}</span>${esc(c.title)}</li>`).join("")}</ul>
          </div>
          <div>
            <div class="exec-col-title">Opportunities</div>
            <ul class="exec-list">${data.execOpportunities.map(c => `<li><span class="ico">${c.icon}</span>${esc(c.title)}</li>`).join("")}</ul>
          </div>
        </div>`;
      return el;
    }
    const allChal = data.stages.flatMap(s => s.challenges);
    const allOpp = data.stages.flatMap(s => s.opportunities);
    el.innerHTML = `
      <h2>Key findings at a glance</h2>
      <div class="exec-grid">
        <div>
          <div class="exec-col-title">Challenges</div>
          <ul class="exec-list">${allChal.map(c => `
            <li><span class="sevdot ${c.severity}" title="${sevLabel(c.severity)}"></span>
                <a href="#${c.id}" style="color:inherit;text-decoration:none">${esc(c.title)}</a></li>
          `).join("")}</ul>
        </div>
        <div>
          <div class="exec-col-title">Opportunities</div>
          <ul class="exec-list">${allOpp.map((o, i) => `<li><span class="ico">\u2726</span>${esc(o.title)}</li>`).join("")}</ul>
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

      ${renderUserNote(stage)}

      <div class="challenges">${stage.challenges.map(c => renderChallengeCard(data, c)).join("")}</div>

      ${stage.metrics.length ? `
      <table class="metrics-table">
        <thead><tr><th>Metric</th><th>What it tells us</th></tr></thead>
        <tbody>${stage.metrics.map(m => `<tr><td>${esc(m.name)}</td><td>${esc(m.def)}</td></tr>`).join("")}</tbody>
      </table>` : ""}

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
        <p class="chal-body clamp">${esc(c.body)}</p>
        <button class="chal-more" type="button">Read more</button>
        ${thumbs ? `<div class="ev-rail">${thumbs}</div>` : ""}
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
    if (data.pendingDetail){
      rail.innerHTML = `<div class="rail-title">On this page</div>
        <a class="rail-item" href="#hl-stages"><span class="n">\u2022</span>Journey stages</a>
        <div class="rail-meta">${esc(data.stages.length)} stages scoped<br><a href="${esc(data.figmaUrl)}" target="_blank" rel="noopener">View research in Figma \u2197</a></div>`;
      toc.innerHTML = `<a href="#hl-stages" class="current">Stages</a>`;
      return;
    }
    rail.innerHTML = `<div class="rail-title">On this page</div>
      ${data.stages.map((s, i) => `<a class="rail-item" data-target="${s.id}" href="#${s.id}"><span class="n">${String(i+1).padStart(2,"0")}</span>${esc(shorten(s.title, 26))}</a>`).join("")}
      <div class="rail-meta">${data.stages.length} stages \u00b7 ${data.stages.reduce((a,s)=>a+s.challenges.length,0)} challenges<br><a href="${esc(data.figmaUrl)}" target="_blank" rel="noopener">View research in Figma \u2197</a></div>`;
    toc.innerHTML = data.stages.map((s, i) => `<a data-target="${s.id}" href="#${s.id}">${String(i+1).padStart(2,"0")}</a>`).join("");
  }

  function renderFooter(data){
    $("#footer").innerHTML = `
      <div class="shell">
        <p>${esc(data.name)} \u2014 user journey research \u00b7 Data sourced from a Figma research artifact \u00b7
        <a href="${esc(data.figmaUrl)}" target="_blank" rel="noopener">View in Figma \u2197</a></p>
      </div>`;
  }

  function wireExpandButtons(){
    $$(".chal-more").forEach(btn => {
      btn.addEventListener("click", () => {
        const body = btn.previousElementSibling;
        const collapsed = body.classList.toggle("clamp");
        btn.textContent = collapsed ? "Read more" : "Show less";
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
