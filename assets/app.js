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
    const stagesHeading = document.createElement("h2");
    stagesHeading.className = "stages-heading";
    stagesHeading.textContent = "User Journeys";
    stagesContainer.appendChild(stagesHeading);
    const pillBar = document.createElement("div");
    pillBar.className = "stage-pills";
    data.stages.forEach((stage, i) => {
      const pill = document.createElement("button");
      pill.className = "stage-pill" + (i === 0 ? " active" : "");
      pill.setAttribute("data-stage-index", i);
      const pillLabels = ["Onboarding", "Dispatch", "Delivery", "Settlement"];
      pill.textContent = pillLabels[i] || stage.code;
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
    const el = document.createElement("section");
    el.className = "hero";
    el.innerHTML = `
      <div class="hero-gradient-bg"></div>
      <div class="hero-content">
        <h1>${esc(data.heroTitle)}</h1>
        <p class="hero-abstract">A field study of the Delhivery LM-FE app, tracing delivery executive\u2019s path from first login to end-of-day reconciliation.</p>
        <div class="stat-strip">
          <div class="stat"><span class="num" data-countup="4">0</span><span class="lbl">User Journeys</span></div>
          <div class="stat"><span class="num" data-countup="21">0</span><span class="lbl">Touchpoints mapped</span></div>
          <div class="stat"><span class="num" data-countup="16">0</span><span class="lbl">Design challenges</span></div>
          <div class="stat"><span class="num" data-countup="18">0</span><span class="lbl">Metrics identified</span></div>
          <div class="stat"><span class="num" data-countup="15">0</span><span class="lbl">Opportunity areas</span></div>
        </div>
      </div>
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
    const recommendations = [
      { num: 1, title: "Unified guided onboarding wizard", challenge: "Onboarding is fragmented and confusing", metric: "Adoption", evidence: ["login-otp-sent", "aadhaar-otp-generating", "aadhaar-otp-maxattempts", "fe-home-docs-pending"] },
      { num: 2, title: "Multilingual support and accessibility", challenge: "No multilingual support for low-literacy riders", metric: "Inclusion", evidence: ["get-started", "fe-app-download"] },
      { num: 3, title: "Smart shipment list with route optimization", challenge: "Shipment list lacks information hierarchy", metric: "Efficiency", evidence: ["shipments-list", "shipments-map"] },
      { num: 4, title: "Streamlined COD payment flow", challenge: "Payment and verification flows break mid-delivery", metric: "Trust", evidence: ["order-detail-pending", "payment-pending-retry", "qr-verified-cod", "qr-payment-success"] },
      { num: 5, title: "Route optimization for deliveries", challenge: "No route optimization for deliveries", metric: "Efficiency", evidence: ["shipments-map"] },
      { num: 6, title: "Reliable cancellation with OTP fallbacks", challenge: "Cancellation flow is unreliable", metric: "Reliability", evidence: ["nsl-reasons", "nsl-reschedule-selected", "reschedule-whatsapp-otp"] },
      { num: 7, title: "Transparent earnings and filtering", challenge: "Earnings and summary screens lack clarity", metric: "Trust", evidence: ["summary-progress"] },
      { num: 8, title: "New Rider Training is missing", challenge: "Today, new riders learn the job only by watching someone else do it. Onboarding depends on who happens to be free at the DC, and once a rider is out on route, there\u2019s no way to check how something works. Rider Training moves that knowledge into the app so new riders can get started on their own, and riders already on the job can find answers when they get stuck during delivery.", metric: "Adoption", evidence: [] },
      { num: 9, title: "Redesign the Insurance screen as a guided experience", challenge: "Insurance card dominates the screen, hero is text-heavy, too many competing colours, inconsistent icon style, and fragmented typography hierarchy \u2014 the page feels like information stacked vertically rather than a guided insurance experience", metric: "Clarity", evidence: [] },
      { num: 10, title: "Improve the Earnings page to answer: How much, why, and when?", challenge: "Current summary feels like a list of numbers with no narrative. Weekly, daily, incentives and deductions compete equally with no hierarchy. Spacing, typography and dividers are inconsistent across the three screens. The earnings chart lacks a timeframe filter or visual selection indicator for the current week.", metric: "Trust", evidence: ["summary-progress"] }
    ];
    el.innerHTML = `
      <h2 class="exec-heading">Top 10 UX recommendations</h2>
      <div class="rec-cards">
        ${recommendations.map(r => `
          <div class="rec-card">
            <div class="rec-card-header">
              <span class="rec-num">${r.num}</span>
              <div class="rec-body">
                <div class="rec-top-row">
                  <div class="rec-text">
                    <h3 class="rec-title">${esc(r.title)}</h3>
                    <p class="rec-challenge">${esc(r.challenge)} ${r.evidence.length ? `<button class="rec-evidence-btn" type="button">Show evidence</button>` : ""}</p>
                  </div>
                  <div class="rec-meta">
                    <span class="rec-metric">${esc(r.metric)}</span>
                  </div>
                </div>
              </div>
              <button class="rec-arrow" aria-label="View screenshots" style="display:none">\u203A</button>
            </div>
            ${r.evidence.length ? `<div class="rec-evidence-panel hidden">
              <div class="rec-evidence-grid">
                ${r.evidence.map(key => `<button class="rec-ev-thumb ev-thumb" data-ev="${key}" data-project="lmfe" type="button"><img loading="lazy" src="assets/screens/${key}.webp" alt="${key}"><span class="rec-ev-cap">${key}</span></button>`).join("")}
              </div>
            </div>` : ""}
          </div>
        `).join("")}
      </div>`;
    // Wire accordion
    el.querySelectorAll(".rec-evidence-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const card = btn.closest(".rec-card");
        const panel = card.querySelector(".rec-evidence-panel");
        const isHidden = panel.classList.toggle("hidden");
        btn.textContent = isHidden ? "Show evidence" : "Hide evidence";
      });
    });
    el.querySelectorAll(".rec-arrow").forEach(btn => {
      btn.addEventListener("click", () => {
        const card = btn.closest(".rec-card");
        const panel = card.querySelector(".rec-evidence-panel");
        if (!panel) return;
        const isHidden = panel.classList.toggle("hidden");
        const evBtn = card.querySelector(".rec-evidence-btn");
        if (evBtn) evBtn.textContent = isHidden ? "Show evidence" : "Hide evidence";
      });
    });
    // Wire evidence thumbs to lightbox
    el.querySelectorAll(".ev-thumb").forEach(btn => {
      btn.addEventListener("click", () => openLightbox(btn.dataset.project, btn.dataset.ev));
    });

    // Easy wins section
    const easyWins = [
      { num: 1, title: "Fix error state colours on login", challenge: "Error states use yellow instead of red — doesn\u2019t communicate severity clearly", metric: "Feedback", evidence: ["login-otp-sent", "aadhaar-otp-maxattempts"] },
      { num: 2, title: "Add ghost text to phone number field", challenge: "No format hint on the phone input — users don\u2019t know the expected format", metric: "Usability", evidence: ["login-otp-sent"] },
      { num: 3, title: "Relabel driving licence as alphanumeric field", challenge: "Field labelled as \u201cNumber\u201d for a 15-character alphanumeric code with no input mask", metric: "Clarity", evidence: ["driving-licence-accepting"] },
      { num: 4, title: "Surface pending verification above greeting", challenge: "\u201cGood morning\u201d is visually dominant over a blocking doc verification task", metric: "Hierarchy", evidence: ["fe-home-docs-pending"] },
      { num: 5, title: "Explain \u2018LastMile Pro\u2019 and auto-start permission inline", challenge: "Concepts introduced without explanation, causing confusion for first-time users", metric: "Discoverability", evidence: ["next-steps-welcome"] },
      { num: 6, title: "Add legend for lightning icon in shipment list", challenge: "Lightning glyph appears with no explanation — its meaning (priority) is never shown on screen", metric: "Learnability", evidence: ["shipments-list"] },
      { num: 7, title: "Equalise \u2018Punch out\u2019 and \u2018Create dispatch\u2019 hierarchy", challenge: "Punch out is buried while Create dispatch is prominent — opposite of daily-use frequency", metric: "Navigation", evidence: ["fe-home-activated", "dispatch-empty"] },
      { num: 8, title: "Resequence selfie capture to start of delivery", challenge: "Selfie check appears late in the flow after rider is already at the customer\u2019s door", metric: "Flow", evidence: ["pod-photo-capture"] },
      { num: 9, title: "Relabel \u2018Payer\u2019 to plain language in COD flow", challenge: "\u201cPayer\u201d label confuses riders — unclear if it means the customer or the executive", metric: "Clarity", evidence: ["order-detail-pending", "qr-verified-cod"] },
      { num: 10, title: "Add inline labels and breakdown to incentive milestone chart", challenge: "Incentive chart shows values with no explanation of what they mean or how they\u2019re calculated", metric: "Transparency", evidence: ["summary-progress"] }
    ];
    const easyWinsHTML = document.createElement("div");
    easyWinsHTML.className = "easy-wins-section";
    easyWinsHTML.innerHTML = `
      <h2 class="exec-heading easy-wins-heading">10 Easy Wins</h2>
      <div class="rec-cards">
        ${easyWins.map(w => `
          <div class="rec-card">
            <div class="rec-card-header">
              <span class="rec-num">${w.num}</span>
              <div class="rec-body">
                <div class="rec-top-row">
                  <div class="rec-text">
                    <h3 class="rec-title">${esc(w.title)}</h3>
                    <p class="rec-challenge">${esc(w.challenge)} ${w.evidence.length ? `<button class="rec-evidence-btn" type="button">Show evidence</button>` : ""}</p>
                  </div>
                  <div class="rec-meta">
                    <span class="rec-metric">${esc(w.metric)}</span>
                  </div>
                </div>
              </div>
            </div>
            ${w.evidence.length ? `<div class="rec-evidence-panel hidden">
              <div class="rec-evidence-grid">
                ${w.evidence.map(key => `<button class="rec-ev-thumb ev-thumb" data-ev="${key}" data-project="lmfe" type="button"><img loading="lazy" src="assets/screens/${key}.webp" alt="${key}"><span class="rec-ev-cap">${key}</span></button>`).join("")}
              </div>
            </div>` : ""}
          </div>
        `).join("")}
      </div>`;
    el.appendChild(easyWinsHTML);

    // Wire easy wins accordions and lightbox
    easyWinsHTML.querySelectorAll(".rec-evidence-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const card = btn.closest(".rec-card");
        const panel = card.querySelector(".rec-evidence-panel");
        const isHidden = panel.classList.toggle("hidden");
        btn.textContent = isHidden ? "Show evidence" : "Hide evidence";
      });
    });
    easyWinsHTML.querySelectorAll(".ev-thumb").forEach(btn => {
      btn.addEventListener("click", () => openLightbox(btn.dataset.project, btn.dataset.ev));
    });

    return el;
  }

  function renderStage(data, stage, i){
    const el = document.createElement("section");
    el.className = "stage";
    el.id = stage.id;
    const evidenceUsed = new Set();
    stage.challenges.forEach(c => (c.evidence || []).forEach(k => evidenceUsed.add(k)));

    el.innerHTML = `
      <h2>${esc(stage.title)}</h2>
      <p class="stage-narrative">${esc(stage.narrative)}</p>

      <div class="stepper">${stage.touchpoints.map((t, idx) => `
        <div class="step"><span class="idx">${idx+1}</span><span class="txt">${esc(t)}</span></div>
      `).join("")}</div>

      <div class="stage-accordion">
        <button class="accordion-toggle" type="button"><span class="accordion-title">Challenges \u2014 Users</span><span class="accordion-icon">+</span></button>
        <div class="accordion-panel hidden">
          ${renderUserNote(stage)}
        </div>
      </div>

      <div class="stage-accordion">
        <button class="accordion-toggle" type="button"><span class="accordion-title">Design challenges</span><span class="accordion-icon">+</span></button>
        <div class="accordion-panel hidden">
          <div class="challenges">${stage.challenges.map(c => renderChallengeCard(data, c)).join("")}</div>
        </div>
      </div>

      ${stage.metrics.length ? `
      <div class="stage-accordion">
        <button class="accordion-toggle" type="button"><span class="accordion-title">Metrics to be targeted</span><span class="accordion-icon">+</span></button>
        <div class="accordion-panel hidden">
          <table class="metrics-table">
            <thead><tr><th>Metric</th><th>What it tells us</th></tr></thead>
            <tbody>${stage.metrics.map(m => `<tr><td>${esc(m.name)}</td><td>${esc(m.def)}</td></tr>`).join("")}</tbody>
          </table>
        </div>
      </div>` : ""}

      <div class="stage-accordion">
        <button class="accordion-toggle" type="button"><span class="accordion-title">Possible solutions</span><span class="accordion-icon">+</span></button>
        <div class="accordion-panel hidden">
          <div class="opps">${stage.opportunities.map(o => `
            <div class="opp-card">
              <h4>${esc(o.title)}</h4>
              <p>${esc(o.body)}</p>
              ${o.addresses && o.addresses.length ? `<div class="opp-links">${o.addresses.map(id => `<a href="#${id}">resolves \u2192 ${esc(findChallengeTitle(stage, id))}</a>`).join("")}</div>` : ""}
            </div>
          `).join("")}</div>
        </div>
      </div>
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
      <div class="chal-item" id="${c.id}">
        <div class="chal-head"><span class="sev ${c.severity}">${sevLabel(c.severity)}</span><h3>${esc(c.title)}</h3></div>
        <p class="chal-body">${esc(c.body)}</p>
        ${thumbs ? `<button class="ev-toggle" type="button">Show screenshots</button><div class="ev-rail hidden">${thumbs}</div>` : ""}
      </div>`;
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
    // Stage section accordions
    $$(".accordion-toggle").forEach(btn => {
      btn.addEventListener("click", () => {
        const panel = btn.nextElementSibling;
        const isHidden = panel.classList.toggle("hidden");
        btn.querySelector(".accordion-icon").textContent = isHidden ? "+" : "\u2212";
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
