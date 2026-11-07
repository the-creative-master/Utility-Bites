// ui-polish.js — inline home search bar, Hall of Fame (small cupboard), two-way pinning.
// Safe: no MutationObservers, no DOM loops, no fidgets.
(function () {
  "use strict";

  // -------- Tool catalog (mirrors shelf markup) --------
  const TOOLS = {
    math: [
      ["calculator","Calculator"],["graph","Graphing Calculator"],["body","Bodily Calculator"],
      ["fraction","Fraction Calculator"],["percentage","Percentage Calculator"],
      ["dice","Dice Roller"],["roman","Roman Numerals"],["base","Number Base Converter"],
      ["prime","Prime Checker"],["sequence","Sequence Playground"],
    ],
    coding: [
      ["codehub","CodeHub"],["jwt","JWT Inspector"],["diff","Diff Checker"],
      ["markdown","Markdown Studio"],["timestamp","Timestamp Lab"],["json","JSON Workshop"],
      ["regex","Regex Playground"],["codec","Data Codec"],["hash","Hash Generator"],["uuid","UUID Forge"],
    ],
    text: [
      ["fileconverter","File Converter"],["textfilters","Crazy Text Filters"],
      ["wordcounter","Word Counter"],["findreplace","Find & Replace"],["notes","Fridge Notes"],
      ["bakery","Placeholder Bakery"],["qrsticker","QR Sticker"],["typing","Typing Taste Test"],
      ["banner","Banner Butter"],["reflow","Paragraph Chef"],["emoji","Emoji Pantry"],
      ["speedread","Speed Reader"],["letterlab","Letter Lab"],["ladle","Word Ladle"],
      ["recipecards","Recipe Cards"],["wonders","Text Wonders"],["sifter","Word Sifter"],
    ],
    design: [
      ["artstudio","Art Studio"],["colorpicker","Color Picker"],["pixelart","Pixel Painter"],
      ["gradient","Gradient Mixer"],["palette","Palette Baker"],["boxshadow","Shadow & Glow"],
      ["blobmaker","Blob Maker"],["pattern","Pattern Tiles"],["fontpair","Font Playground"],
      ["stickermaker","Sticker Maker"],
    ],
  };
  const CAT_META = {
    math:   { title:"Math & Numbers",     doorId:"openMathCupboard",   screenId:"gameWorld",   label:"Math", color:"var(--coral)" },
    coding: { title:"Coding & Developing", doorId:"openCodingCupboard", screenId:"codingWorld", label:"Code", color:"var(--teal)"  },
    text:   { title:"Text & Files",       doorId:"openTextCupboard",   screenId:"textWorld",   label:"Text", color:"var(--lilac)" },
    design: { title:"Design & Art",       doorId:"openDesignCupboard", screenId:"designWorld", label:"Art",  color:"var(--pink)"  },
    hof:    { title:"Hall of Fame",       doorId:"openHofCupboard",    screenId:"hofWorld",    label:"★",    color:"var(--honey)" },
  };
  const COLORS = ["utility-art-coral","utility-art-teal","utility-art-sage","utility-art-honey",
                  "utility-art-lilac","utility-art-pink","utility-art-blue","utility-art-parchment"];
  function iconId(k) {
    return ({calculator:"icon-calculator",graph:"icon-graph",body:"icon-body",fraction:"icon-fraction",
      percentage:"icon-percent",dice:"icon-dice",roman:"icon-roman",base:"icon-base",prime:"icon-prime",
      sequence:"icon-sequence",codehub:"icon-codehub",jwt:"icon-jwt",diff:"icon-diff",markdown:"icon-markdown",
      timestamp:"icon-timestamp",json:"icon-json",regex:"icon-regex",codec:"icon-codec",hash:"icon-hash",
      uuid:"icon-uuid",fileconverter:"icon-files",textfilters:"icon-textfilters",wordcounter:"icon-wordcount",
      findreplace:"icon-findreplace",notes:"icon-notes",bakery:"icon-bakery",qrsticker:"icon-qr",
      emoji:"icon-emoji",typing:"icon-typing",speedread:"icon-speedread",banner:"icon-banner",
      reflow:"icon-reflow",letterlab:"icon-letterlab",ladle:"icon-ladle",recipecards:"icon-recipecards",
      wonders:"icon-wonders",sifter:"icon-sifter",artstudio:"icon-artstudio",colorpicker:"icon-colorpicker",
      pixelart:"icon-pixelart",gradient:"icon-gradient",palette:"icon-palette",boxshadow:"icon-boxshadow",
      blobmaker:"icon-blobmaker",pattern:"icon-pattern",fontpair:"icon-fontpair",stickermaker:"icon-stickermaker",
    })[k] || "icon-calculator";
  }

  // -------- Settings --------
  const LS_KEY = "bite_ui_settings_v2";
  const DEFAULTS = { pinsTop: [], pinsHof: [], recent: [] };
  function loadSettings() {
    try {
      const raw = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
      return {
        pinsTop: Array.isArray(raw.pinsTop) ? raw.pinsTop.filter(Boolean) : [],
        pinsHof: Array.isArray(raw.pinsHof) ? raw.pinsHof.filter(Boolean) : [],
        recent:  Array.isArray(raw.recent)  ? raw.recent.filter(Boolean).slice(0,8) : [],
      };
    } catch(_) { return { pinsTop: [], pinsHof: [], recent: [] }; }
  }
  function saveSettings(s) { localStorage.setItem(LS_KEY, JSON.stringify(s)); }
  let S = loadSettings();

  const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

  function allTools() {
    const out = [];
    Object.entries(TOOLS).forEach(([cat, list]) =>
      list.forEach(([key, name]) => out.push({ key, name, catKey: cat, category: CAT_META[cat].title }))
    );
    return out;
  }

  // =============================================================
  // INLINE HOME SEARCH BAR
  // =============================================================
  function injectHomeSearch() {
    const area = document.querySelector(".home-category-area");
    if (!area || area.querySelector("#biteHomeSearch")) return;
    const prompt = area.querySelector(".home-prompt");
    const bar = document.createElement("div");
    bar.className = "bite-home-search";
    bar.innerHTML = `
      <label for="biteHomeSearchInput" class="bite-hs-label" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="20" height="20"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="m16 16 4.5 4.5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
      </label>
      <input id="biteHomeSearchInput" class="bite-hs-input" type="search" placeholder="Search for a utility… try “json”, “color”, “hash”, “qr”" autocomplete="off" spellcheck="false"/>
      <button class="bite-hs-clear" id="biteHomeSearchClear" aria-label="Clear search" hidden>×</button>
    `;
    if (prompt) area.insertBefore(bar, prompt.nextSibling); else area.prepend(bar);

    // Results panel (between search bar and grid)
    const results = document.createElement("div");
    results.className = "bite-home-results";
    results.id = "biteHomeResults";
    results.hidden = true;
    bar.after(results);

    const input = bar.querySelector("#biteHomeSearchInput");
    const clear = bar.querySelector("#biteHomeSearchClear");
    input.addEventListener("input", () => {
      const q = input.value.trim();
      clear.hidden = !q;
      renderResults(q);
    });
    clear.addEventListener("click", () => { input.value = ""; clear.hidden = true; renderResults(""); input.focus(); });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { input.value = ""; clear.hidden = true; renderResults(""); }
      if (e.key === "Enter") {
        const first = results.querySelector(".bite-hs-item");
        if (first) first.click();
      }
    });
  }

  function renderResults(q) {
    const grid = document.querySelector(".home-category-grid");
    const results = document.getElementById("biteHomeResults");
    if (!grid || !results) return;
    const query = q.toLowerCase().trim();
    if (!query) {
      results.hidden = true; results.innerHTML = "";
      grid.classList.remove("bite-searching");
      document.querySelectorAll(".bite-hs-empty-hint").forEach(e=>e.remove());
      return;
    }
    grid.classList.add("bite-searching");
    const list = allTools().filter(t => {
      const hay = (t.name + " " + t.category + " " + t.key).toLowerCase();
      return hay.includes(query) || fuzzy(query, hay);
    });
    if (!list.length) {
      results.hidden = false;
      results.innerHTML = `<div class="bite-hs-empty">No bites match <strong>“${esc(q)}”</strong>. Try another word.</div>`;
      return;
    }
    results.hidden = false;
    results.innerHTML = `
      <div class="bite-hs-grid">
        ${list.map((t, i) => `
          <button class="bite-hs-item" data-tool="${esc(t.key)}" data-cat="${esc(t.catKey)}" type="button">
            <span class="utility-art ${COLORS[i%COLORS.length]}"><svg><use href="#${iconId(t.key)}"></use></svg></span>
            <span class="bite-hs-name">${esc(t.name)}</span>
            <small class="bite-hs-cat" style="color:${CAT_META[t.catKey].color}">${esc(t.category)}</small>
          </button>
        `).join("")}
      </div>
    `;
    results.querySelectorAll(".bite-hs-item").forEach(btn => {
      btn.addEventListener("click", () => openToolByKey(btn.dataset.tool, btn.dataset.cat));
    });
  }
  function fuzzy(q, t) { let i = 0; for (const ch of t) if (ch === q[i]) i++; return i === q.length; }

  // =============================================================
  // NAV
  // =============================================================
  function currentScreenKey() {
    for (const k of Object.keys(CAT_META)) {
      const el = document.getElementById(CAT_META[k].screenId);
      if (el && !el.hidden) return k;
    }
    const h = document.getElementById("homeScreen");
    return h && !h.hidden ? "home" : null;
  }
  function clickBackHome() {
    const btn = document.querySelector(".back-home-button:not([hidden])")
             || Array.from(document.querySelectorAll(".back-home-button")).find(b=>b.offsetParent!==null);
    if (btn) btn.click();
  }
  function openToolByKey(key, catKey) {
    if (currentScreenKey() !== "home" && currentScreenKey() !== null) clickBackHome();
    const door = document.getElementById(CAT_META[catKey].doorId);
    if (!door) return;
    // wait until home, then open category
    const clickTool = () => {
      setTimeout(() => {
        const btn = document.querySelector(`.shelf-utility[data-tool="${key}"]`);
        if (btn) { btn.click(); pushRecent(key); return; }
        setTimeout(() => document.querySelector(`.shelf-utility[data-tool="${key}"]`)?.click(), 500);
      }, 800);
    };
    door.click();
    clickTool();
  }
  function pushRecent(k) {
    S.recent = [k, ...S.recent.filter(x=>x!==k)].slice(0,8);
    saveSettings(S);
  }
  function hookOpenTool() {
    const orig = window.openTool;
    if (!orig || orig._bite) return;
    window.openTool = function(toolKey) {
      pushRecent(toolKey);
      return orig.apply(this, arguments);
    };
    window.openTool._bite = true;
  }

  // =============================================================
  // PINNING (top of cupboard + Hall of Fame)
  // =============================================================
  function togglePinTop(k) {
    S.pinsTop = S.pinsTop.includes(k) ? S.pinsTop.filter(x=>x!==k) : [k,...S.pinsTop.filter(x=>x!==k)].slice(0,10);
    saveSettings(S); decorateAllShelves(); orderShelves(); renderHofIfReady();
  }
  function toggleHof(k) {
    S.pinsHof = S.pinsHof.includes(k) ? S.pinsHof.filter(x=>x!==k) : [k,...S.pinsHof.filter(x=>x!==k)].slice(0,18);
    saveSettings(S); decorateAllShelves(); orderShelves(); renderHofIfReady(); updateHofCount();
  }

  function decorateAllShelves() {
    document.querySelectorAll(".shelf-utility").forEach(btn => {
      btn.classList.toggle("is-pinned-top", S.pinsTop.includes(btn.dataset.tool));
      btn.classList.toggle("is-hof", S.pinsHof.includes(btn.dataset.tool));
      if (btn.dataset.pinInjected === "1") return;
      btn.dataset.pinInjected = "1";
      const key = btn.dataset.tool;
      const m = document.createElement("div");
      m.className = "utility-pin-menu";
      m.innerHTML = `
        <button class="pin-dot" aria-label="Pin options">⋮</button>
        <div class="pin-pop" hidden>
          <button class="pin-opt" data-pin="top">📌 Pin to top of cupboard</button>
          <button class="pin-opt" data-pin="hof">★ Add to Hall of Fame</button>
        </div>`;
      btn.appendChild(m);
      const dot = m.querySelector(".pin-dot"), pop = m.querySelector(".pin-pop");
      dot.addEventListener("click", e => {
        e.stopPropagation(); e.preventDefault();
        document.querySelectorAll(".pin-pop.open").forEach(p => { if(p!==pop){p.classList.remove("open");p.hidden=true;} });
        const open = pop.classList.contains("open");
        pop.hidden = open; pop.classList.toggle("open",!open);
      });
      m.querySelectorAll(".pin-opt").forEach(b => b.addEventListener("click", e => {
        e.stopPropagation(); e.preventDefault();
        if (b.dataset.pin==="top") togglePinTop(key);
        if (b.dataset.pin==="hof") toggleHof(key);
        pop.hidden=true; pop.classList.remove("open");
      }));
    });
    if (!document.body._pinOut) {
      document.body._pinOut = true;
      document.addEventListener("click", e => {
        if (!e.target.closest(".utility-pin-menu"))
          document.querySelectorAll(".pin-pop.open").forEach(p => { p.classList.remove("open"); p.hidden=true; });
      });
    }
  }

  function utilSort(a,b) {
    const r = k => S.pinsHof.includes(k)?0:(S.pinsTop.includes(k)?1:2);
    return r(a.dataset.tool)-r(b.dataset.tool);
  }
  function markSeparators(container) {
    container.querySelectorAll(".pin-divider-label").forEach(el=>el.remove());
    const kids = Array.from(container.children).filter(el=>el.classList.contains("shelf-utility"));
    let last = -1;
    kids.forEach(u => {
      const k = u.dataset.tool;
      const r = S.pinsHof.includes(k)?0:(S.pinsTop.includes(k)?1:2);
      if (r!==last && (r===0||r===1)) {
        const lbl = document.createElement("div");
        lbl.className = "pin-divider-label " + (r===0?"is-hof":"is-top");
        lbl.textContent = r===0 ? "★ Hall of Fame" : "📌 Pinned";
        u.parentNode.insertBefore(lbl, u);
      }
      last = r;
    });
  }
  function orderShelves() {
    document.querySelectorAll(".category-cabinet-back").forEach(back => {
      if (back.dataset.hofBack === "1") return;
      const isMath = !!back.closest(".math-category-cabinet");
      if (!isMath) {
        const utils = Array.from(back.querySelectorAll(":scope > .shelf-utility"));
        if (!utils.length) return;
        const sorted = utils.slice().sort(utilSort);
        if (utils.every((u,i)=>u===sorted[i])) { markSeparators(back); return; }
        sorted.forEach(u => back.appendChild(u));
        markSeparators(back);
      } else {
        const shelves = Array.from(back.querySelectorAll(":scope > .category-shelf"));
        if (!shelves.length) return;
        let all = [];
        shelves.forEach(s => all = all.concat(Array.from(s.querySelectorAll(":scope > .shelf-utility"))));
        if (!all.length) return;
        const sorted = all.slice().sort(utilSort);
        if (all.every((u,i)=>u===sorted[i])) { shelves.forEach(markSeparators); return; }
        let idx = 0;
        shelves.forEach(s => {
          Array.from(s.querySelectorAll(":scope > .shelf-utility")).forEach(u=>u.remove());
          for (let i=0;i<2 && idx<sorted.length;i++,idx++) s.appendChild(sorted[idx]);
          markSeparators(s);
        });
      }
    });
  }

  // =============================================================
  // HALL OF FAME (small cupboard)
  // =============================================================
  function injectHofHomeCard() {
    const grid = document.querySelector(".home-category-grid");
    if (!grid || document.getElementById("hofHomeCupboard")) return;
    const slot = document.createElement("div");
    slot.className = "home-category-slot home-category-slot-hof";
    slot.innerHTML = `
      <div class="home-cupboard home-cupboard-hof hof-cupboard-small" id="hofHomeCupboard">
        <div class="home-cupboard-crown" aria-hidden="true"></div>
        <div class="home-cupboard-frame">
          <div class="home-cupboard-inside">
            <span class="home-inside-icon" style="background:var(--honey);">
              <svg viewBox="0 0 96 96" width="70" height="70"><path d="m48 7 11 23 25 4-18 18 4 26-22-12-22 12 4-26-18-18 25-4Z" fill="#fff1cf" stroke="#3e2519" stroke-width="6" stroke-linejoin="round"/></svg>
            </span>
            <strong>Hall of Fame</strong>
            <span id="hofCountLabel">Your favorites</span>
            <span class="home-shelf-board" aria-hidden="true"></span>
          </div>
          <button class="home-cupboard-door" id="openHofCupboard" aria-expanded="false" aria-label="Open Hall of Fame">
            <span class="home-door-inset">
              <span class="home-door-icons home-door-icons-single" aria-hidden="true">
                <svg viewBox="0 0 96 96"><path d="m48 7 11 23 25 4-18 18 4 26-22-12-22 12 4-26-18-18 25-4Z" fill="#fff1cf" stroke="#3e2519" stroke-width="6" stroke-linejoin="round"/></svg>
              </span>
              <strong>Hall<span>&nbsp;</span><br/>of Fame</strong>
              <small>Your starred tools</small>
            </span>
            <span class="home-door-knob" aria-hidden="true"></span>
          </button>
        </div>
      </div>`;
    grid.appendChild(slot);
    document.getElementById("openHofCupboard").addEventListener("click", () => enterHof());
    updateHofCount();
  }
  function updateHofCount() {
    const lbl = document.getElementById("hofCountLabel");
    if (lbl) lbl.textContent = S.pinsHof.length ? `${S.pinsHof.length} starred` : "Star tools with ⋮";
  }

  function injectHofScreen() {
    if (document.getElementById("hofWorld")) return;
    const w = document.createElement("div");
    w.className = "game-world hof-screen category-screen";
    w.id = "hofWorld"; w.hidden = true;
    w.setAttribute("data-category-screen","hof");
    w.innerHTML = `
      <button class="waffle-backdrop" id="hofWaffleBackdrop" aria-label="Bounce wall"></button>
      <nav class="math-nav"><button class="back-home-button" id="backHomeHof"><span aria-hidden="true">←</span>Home kitchen</button></nav>
      <header class="kitchen-header category-header">
        <div class="hanging-rope hanging-rope-left" aria-hidden="true"></div>
        <div class="hanging-rope hanging-rope-right" aria-hidden="true"></div>
        <div class="title-sign hof-title-sign">
          <span class="title-doodle" aria-hidden="true">★</span>
          <div><p>Your favorite bites, forever</p><h1>Hall of <span>Fame</span></h1></div>
          <span class="title-doodle" aria-hidden="true">★</span>
        </div>
      </header>
      <main class="category-cabinet-scene hof-cabinet-scene">
        <section class="open-category-cabinet hof-category-cabinet">
          <div class="category-cabinet-crown" aria-hidden="true"></div>
          <div class="category-cabinet-frame">
            <div class="category-cabinet-back" id="hofCabinet" data-hof-back="1"></div>
          </div>
        </section>
      </main>`;
    document.body.appendChild(w);
    document.getElementById("backHomeHof").addEventListener("click", leaveHof);
  }
  function renderHofIfReady() {
    const back = document.getElementById("hofCabinet");
    if (!back) return;
    back.innerHTML = "";
    const items = S.pinsHof.map(k => allTools().find(t=>t.key===k)).filter(Boolean);
    if (!items.length) {
      back.innerHTML = `<div class="hof-empty"><div class="hof-empty-star">★</div><strong>No favorites yet</strong><p>Tap the ⋮ on any utility and pick "Add to Hall of Fame".</p></div>`;
      return;
    }
    items.forEach((t,i)=>{
      const btn = document.createElement("button");
      btn.className = "shelf-utility hof-shelf-utility is-hof";
      btn.dataset.tool = t.key;
      btn.innerHTML = `
        <span class="utility-art ${COLORS[i%COLORS.length]}"><svg><use href="#${iconId(t.key)}"></use></svg></span>
        <span>${esc(t.name)}</span>
        <small>${esc(t.category)}</small>`;
      btn.addEventListener("click", () => openToolByKey(t.key, t.catKey));
      back.appendChild(btn);
    });
  }

  function enterHof() {
    const homeCb = document.getElementById("hofHomeCupboard");
    const door = document.getElementById("openHofCupboard");
    const screen = document.getElementById("hofWorld");
    if (!homeCb || !door || !screen) return;
    homeCb.classList.add("open");
    door.setAttribute("aria-expanded","true");
    setTimeout(() => {
      document.getElementById("homeScreen").classList.add("screen-leaving");
      setTimeout(() => {
        const h = document.getElementById("homeScreen");
        h.hidden = true; h.classList.remove("screen-leaving"); h.setAttribute("aria-hidden","true");
        screen.hidden = false; screen.setAttribute("aria-hidden","false");
        screen.classList.add("screen-arriving");
        setTimeout(()=>screen.classList.remove("screen-arriving"),520);
        document.title = "Hall of Fame";
        renderHofIfReady();
        window.scrollTo({top:0,behavior:"auto"});
      }, 255);
    }, 680);
  }
  function leaveHof() {
    const screen = document.getElementById("hofWorld");
    if (!screen) return;
    screen.classList.add("screen-leaving");
    setTimeout(() => {
      screen.hidden = true; screen.classList.remove("screen-leaving"); screen.setAttribute("aria-hidden","true");
      const cb = document.getElementById("hofHomeCupboard");
      const door = document.getElementById("openHofCupboard");
      if (cb) cb.classList.remove("open");
      if (door) door.setAttribute("aria-expanded","false");
      const h = document.getElementById("homeScreen");
      h.hidden = false; h.setAttribute("aria-hidden","false"); h.classList.add("screen-arriving");
      setTimeout(()=>h.classList.remove("screen-arriving"),520);
      document.title = "Bite Sized Utilities";
      updateHofCount();
      window.scrollTo({top:0,behavior:"auto"});
    }, 255);
  }

  // =============================================================
  // DECORATE EXISTING CUPBOARDS after they open
  // =============================================================
  function decorateOpenCupboards() {
    decorateAllShelves();
    orderShelves();
  }
  function hookCupboardOpen() {
    // When a cupboard door is clicked, the shelves populate ~680ms later.
    document.addEventListener("click", (e) => {
      const door = e.target.closest(".home-cupboard-door");
      if (!door) return;
      setTimeout(decorateOpenCupboards, 780);
      setTimeout(decorateOpenCupboards, 1300);
    }, true);
  }

  // =============================================================
  // BOOT
  // =============================================================
  let _booted = false;
  function boot() {
    if (_booted) return; _booted = true;
    injectHofScreen();
    injectHofHomeCard();
    injectHomeSearch();
    hookOpenTool();
    hookCupboardOpen();
    // Run once immediately if shelves already exist (e.g. back navigation)
    setTimeout(decorateOpenCupboards, 100);
    setTimeout(() => { renderHofIfReady(); updateHofCount(); decorateOpenCupboards(); }, 500);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
