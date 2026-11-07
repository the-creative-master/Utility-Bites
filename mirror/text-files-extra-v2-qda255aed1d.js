(() => {
  "use strict";

  const escapeMarkup = (value) => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");

  /* ---------- Text Sifter ---------- */
  function renderSifter() {
    return `
      <div class="extra-stack-layout">
        <section class="game-panel panel-teal">
          <div class="dev-tool-heading"><div><h3>Text sifter</h3><p class="panel-note">Shake any text through the sieve and keep only the tasty bits.</p></div><span class="dev-local-badge">SIFT</span></div>
          <textarea class="chunky-textarea" id="sifterInput" aria-label="Text to sift" placeholder="Paste messy text with emails, links, numbers, #hashtags and @mentions…"></textarea>
        </section>
        <section class="game-panel panel-honey">
          <div class="dev-tool-heading"><h3>Keep only</h3><span class="dev-local-badge" id="sifterCount">0 FOUND</span></div>
          <div class="text-filter-category-tabs" id="sifterMode">
            <button class="tab-button active" data-sift="emails" aria-selected="true">Emails</button>
            <button class="tab-button" data-sift="urls" aria-selected="false">Links</button>
            <button class="tab-button" data-sift="numbers" aria-selected="false">Numbers</button>
            <button class="tab-button" data-sift="hashtags" aria-selected="false">#Hashtags</button>
            <button class="tab-button" data-sift="mentions" aria-selected="false">@Mentions</button>
            <button class="tab-button" data-sift="lines" aria-selected="false">Non-empty lines</button>
          </div>
          <div class="stat-chip-grid" id="sifterStats" hidden></div>
          <textarea class="chunky-textarea" id="sifterOutput" aria-label="Sifted results" readonly></textarea>
          <div class="button-row dev-action-row"><button class="game-button" id="sifterCopy">COPY</button></div>
        </section>
      </div>`;
  }

  function initSifter(root, api) {
    const input = root.querySelector("#sifterInput");
    const output = root.querySelector("#sifterOutput");
    const badge = root.querySelector("#sifterCount");
    const stats = root.querySelector("#sifterStats");
    let mode = "emails";
    const patterns = {
      emails: /[\w.+-]+@[\w-]+\.[\w.-]+/g,
      urls: /https?:\/\/[^\s<>"')]+|www\.[^\s<>"')]+/g,
      numbers: /-?\d+(?:[.,]\d+)*%?/g,
      hashtags: /#[\p{L}\p{N}_]+/gu,
      mentions: /@[\p{L}\p{N}_.]+/gu,
    };
    function sift() {
      const text = input.value;
      let results = [];
      if (mode === "lines") results = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
      else results = [...new Set(text.match(patterns[mode]) || [])];
      output.value = results.join("\n");
      badge.textContent = `${results.length} FOUND`;
      if (mode === "numbers" && results.length) {
        const values = results.map((entry) => Number.parseFloat(entry.replace(/[,%]/g, ""))).filter(Number.isFinite);
        const sum = values.reduce((a, b) => a + b, 0);
        stats.hidden = false;
        stats.innerHTML = [
          [values.length, "Count"], [Math.round(sum * 100) / 100, "Sum"], [values.length ? Math.round((sum / values.length) * 100) / 100 : 0, "Average"], [values.length ? Math.max(...values) : 0, "Max"], [values.length ? Math.min(...values) : 0, "Min"],
        ].map(([value, label]) => `<div class="stat-chip"><strong>${value}</strong><span>${label}</span></div>`).join("");
      } else stats.hidden = true;
    }
    root.querySelectorAll("[data-sift]").forEach((button) => button.addEventListener("click", () => {
      mode = button.dataset.sift;
      root.querySelectorAll("[data-sift]").forEach((tab) => { const selected = tab === button; tab.classList.toggle("active", selected); tab.setAttribute("aria-selected", String(selected)); });
      sift();
    }));
    input.addEventListener("input", sift);
    root.querySelector("#sifterCopy").addEventListener("click", () => api.copyGameText(output.value, "Sifted results copied!"));
    sift();
  }

  /* ---------- Letter Lab ---------- */
  function renderLetterLab() {
    return `
      <div class="extra-stack-layout">
        <section class="game-panel panel-lilac letterlab-stage-panel">
          <div class="dev-tool-heading"><div><h3>Letter lab</h3><p class="panel-note">Drop one character under the microscope.</p></div><span class="dev-local-badge">U+</span></div>
          <input class="chunky-input letterlab-input" id="letterInput" maxlength="8" value="🧇" aria-label="Character to inspect" />
          <div class="letterlab-big" id="letterBig" aria-hidden="true">🧇</div>
        </section>
        <section class="game-panel panel-honey">
          <div class="dev-tool-heading"><h3>Specimen report</h3><span class="dev-local-badge" id="letterCode">U+1F9C7</span></div>
          <div class="stat-chip-grid" id="letterFacts"></div>
          <div class="converter-family-chips" id="letterEscapes"></div>
        </section>
      </div>`;
  }

  function initLetterLab(root, api) {
    const input = root.querySelector("#letterInput");
    const big = root.querySelector("#letterBig");
    const code = root.querySelector("#letterCode");
    const facts = root.querySelector("#letterFacts");
    const escapes = root.querySelector("#letterEscapes");
    function inspect() {
      const chars = [...(input.value || " ")];
      const character = chars[0] || " ";
      const point = character.codePointAt(0);
      const hex = point.toString(16).toUpperCase().padStart(4, "0");
      big.textContent = character;
      code.textContent = `U+${hex}`;
      const kind = /\p{Emoji_Presentation}/u.test(character) ? "Emoji" : /\p{L}/u.test(character) ? "Letter" : /\p{N}/u.test(character) ? "Number" : /\s/.test(character) ? "Whitespace" : "Symbol";
      facts.innerHTML = [
        [kind, "Type"], [character.toUpperCase() === character && character.toLowerCase() !== character ? "upper" : character.toLowerCase() === character && character.toUpperCase() !== character ? "lower" : "—", "Case"],
        [escapeMarkup(character.toUpperCase()), "Upper"], [escapeMarkup(character.toLowerCase()), "Lower"], [point, "Decimal"], [character.length > 1 ? "yes" : "no", "Astral"],
      ].map(([value, label]) => `<div class="stat-chip"><strong>${value}</strong><span>${label}</span></div>`).join("");
      const variants = [
        ["HTML", `&#x${hex};`], ["JS", point > 0xffff ? `\\u{${hex}}` : `\\u${hex}`], ["URL", encodeURIComponent(character)], ["UTF-8", [...new TextEncoder().encode(character)].map((b) => b.toString(16).toUpperCase().padStart(2, "0")).join(" ")],
      ];
      escapes.innerHTML = variants.map(([label, value]) => `<span class="letter-escape-chip" data-copy="${escapeMarkup(value)}">${label}: <strong>${escapeMarkup(value)}</strong></span>`).join("");
    }
    escapes.addEventListener("click", (event) => {
      const chip = event.target.closest(".letter-escape-chip");
      if (chip) api.copyGameText(chip.dataset.copy, "Escape copied!");
    });
    input.addEventListener("input", inspect);
    inspect();
  }

  /* ---------- Lucky Ladle ---------- */
  function renderLadle() {
    return `
      <div class="extra-stack-layout">
        <section class="game-panel panel-teal">
          <div class="dev-tool-heading"><div><h3>Lucky ladle</h3><p class="panel-note">One line per option, then stir the pot and let the ladle pick.</p></div><span class="dev-local-badge">RANDOM</span></div>
          <textarea class="chunky-textarea" id="ladleInput" aria-label="Options, one per line">waffle\npancake\nfrench toast\ncrepe\nmuffin</textarea>
          <div class="text-filter-options">
            <label>Pick how many <strong id="ladleCountValue">1</strong><input id="ladleCount" type="range" min="1" max="10" value="1" /></label>
            <button class="tab-button" id="ladleUnique" aria-pressed="true">NO REPEATS: ON</button>
          </div>
        </section>
        <section class="game-panel panel-honey ladle-result-panel">
          <div class="dev-tool-heading"><h3>Today's scoop</h3><span class="dev-local-badge" id="ladleState">STIR READY</span></div>
          <div class="ladle-bowl" id="ladleBowl" aria-live="polite"><span>?</span></div>
          <button class="game-button" id="ladleStir">STIR THE POT</button>
        </section>
      </div>`;
  }

  function initLadle(root) {
    const input = root.querySelector("#ladleInput");
    const bowl = root.querySelector("#ladleBowl");
    const count = root.querySelector("#ladleCount");
    const unique = root.querySelector("#ladleUnique");
    const state = root.querySelector("#ladleState");
    let uniqueOn = true;
    let stirring = null;
    count.addEventListener("input", () => { root.querySelector("#ladleCountValue").textContent = count.value; });
    unique.addEventListener("click", () => {
      uniqueOn = !uniqueOn;
      unique.classList.toggle("active", uniqueOn);
      unique.setAttribute("aria-pressed", String(uniqueOn));
      unique.textContent = `NO REPEATS: ${uniqueOn ? "ON" : "OFF"}`;
    });
    root.querySelector("#ladleStir").addEventListener("click", () => {
      const options = input.value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
      if (!options.length) { state.textContent = "ADD OPTIONS!"; return; }
      window.clearInterval(stirring);
      state.textContent = "STIRRING…";
      let ticks = 0;
      stirring = window.setInterval(() => {
        bowl.innerHTML = `<span>${escapeMarkup(options[Math.floor(Math.random() * options.length)])}</span>`;
        ticks += 1;
        if (ticks > 12) {
          window.clearInterval(stirring);
          const want = Math.min(Number(count.value), uniqueOn ? options.length : Number(count.value));
          const pool = [...options];
          const picks = [];
          for (let i = 0; i < want; i += 1) {
            if (uniqueOn) picks.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
            else picks.push(options[Math.floor(Math.random() * options.length)]);
          }
          bowl.innerHTML = picks.map((pick) => `<span>${escapeMarkup(pick)}</span>`).join("");
          state.textContent = "SERVED!";
        }
      }, 70);
    });
  }

  /* ---------- Recipe Cards (template filler) ---------- */
  function renderRecipeCards() {
    return `
      <div class="extra-stack-layout">
        <section class="game-panel panel-teal">
          <div class="dev-tool-heading"><div><h3>Recipe cards</h3><p class="panel-note">Write a template with {{blank}} slots and the kitchen sets a place for each one.</p></div><span class="dev-local-badge">SLOTS</span></div>
          <textarea class="chunky-textarea" id="recipeTemplate" aria-label="Template with slots">Dear {{name}},
your {{food}} is ready! Grab a mug of {{drink}} and meet me at the {{place}} in {{minutes}} minutes.</textarea>
          <div class="findreplace-rules" id="recipeFields"></div>
        </section>
        <section class="game-panel panel-honey">
          <div class="dev-tool-heading"><h3>Filled card</h3><span class="dev-local-badge" id="recipeSlotCount">0 SLOTS</span></div>
          <textarea class="chunky-textarea extra-tall-textarea" id="recipeOutput" aria-label="Filled result" readonly></textarea>
          <div class="button-row dev-action-row"><button class="game-button" id="recipeCopy">COPY</button><button class="game-button game-button-small" id="recipeDownload">DOWNLOAD .TXT</button></div>
        </section>
      </div>`;
  }

  function initRecipeCards(root, api) {
    const template = root.querySelector("#recipeTemplate");
    const fields = root.querySelector("#recipeFields");
    const output = root.querySelector("#recipeOutput");
    const slotBadge = root.querySelector("#recipeSlotCount");
    const values = new Map();
    function rebuild() {
      const slots = [...new Set((template.value.match(/{{\s*([^{}]+?)\s*}}/g) || []).map((slot) => slot.replace(/[{}]/g, "").trim()))];
      slotBadge.textContent = `${slots.length} SLOT${slots.length === 1 ? "" : "S"}`;
      const known = new Set(slots);
      [...values.keys()].forEach((key) => { if (!known.has(key)) values.delete(key); });
      fields.innerHTML = slots.map((slot) => `<div class="findreplace-rule recipe-field"><label class="recipe-field-label">${escapeMarkup(slot)}</label><input class="chunky-input" data-slot="${escapeMarkup(slot)}" value="${escapeMarkup(values.get(slot) || "")}" placeholder="fill ${escapeMarkup(slot)}" /></div>`).join("");
      fields.querySelectorAll("input").forEach((field) => field.addEventListener("input", () => { values.set(field.dataset.slot, field.value); fill(); }));
      fill();
    }
    function fill() {
      output.value = template.value.replace(/{{\s*([^{}]+?)\s*}}/g, (_, slot) => values.get(slot.trim()) ?? `{{${slot.trim()}}}`);
    }
    template.addEventListener("input", rebuild);
    root.querySelector("#recipeCopy").addEventListener("click", () => api.copyGameText(output.value, "Card copied!"));
    root.querySelector("#recipeDownload").addEventListener("click", () => {
      const url = URL.createObjectURL(new Blob([output.value], { type: "text/plain" }));
      const anchor = document.createElement("a"); anchor.href = url; anchor.download = "filled-card.txt";
      document.body.append(anchor); anchor.click(); anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
    rebuild();
  }

  /* ---------- Word Wonders ---------- */
  function renderWonders() {
    return `
      <div class="extra-stack-layout">
        <section class="game-panel panel-lilac">
          <div class="dev-tool-heading"><div><h3>Word wonders</h3><p class="panel-note">The magic mirror checks your words for secret superpowers.</p></div><span class="dev-local-badge">MAGIC</span></div>
          <textarea class="chunky-input" id="wonderInput" aria-label="Word or phrase to check">A man, a plan, a canal: Panama</textarea>
        </section>
        <section class="game-panel panel-honey">
          <div class="dev-tool-heading"><h3>Verdict</h3><span class="dev-local-badge" id="wonderLetters">0 LETTERS</span></div>
          <div class="stat-chip-grid" id="wonderChips"></div>
          <div class="dev-tool-heading top-words-heading"><h3>Letter parade</h3></div>
          <div class="wonder-bars" id="wonderBars"></div>
        </section>
      </div>`;
  }

  function initWonders(root) {
    const input = root.querySelector("#wonderInput");
    const chips = root.querySelector("#wonderChips");
    const bars = root.querySelector("#wonderBars");
    const letters = root.querySelector("#wonderLetters");
    function check() {
      const text = input.value;
      const only = text.toLowerCase().replace(/[^a-z0-9]/g, "");
      const letterList = text.toLowerCase().match(/[a-z]/g) || [];
      const isPalindrome = only.length > 1 && only === [...only].reverse().join("");
      const isIsogram = letterList.length > 1 && new Set(letterList).size === letterList.length;
      const isPangram = new Set(letterList).size === 26;
      const vowels = (only.match(/[aeiou]/g) || []).length;
      const counts = new Map();
      letterList.forEach((l) => counts.set(l, (counts.get(l) || 0) + 1));
      letters.textContent = `${letterList.length} LETTERS`;
      chips.innerHTML = [
        [isPalindrome ? "YES ✨" : "no", "Palindrome"], [isIsogram ? "YES ✨" : "no", "Isogram"], [isPangram ? "YES ✨" : "no", "Pangram"],
        [vowels, "Vowels"], [letterList.length - vowels, "Consonants"], [new Set(letterList).size, "Unique"],
      ].map(([value, label]) => `<div class="stat-chip"><strong>${value}</strong><span>${label}</span></div>`).join("");
      const max = Math.max(1, ...counts.values());
      bars.innerHTML = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([letter, countValue]) => `
        <div class="wonder-bar"><span>${letter}</span><div class="wonder-bar-track"><i style="width:${Math.round((countValue / max) * 100)}%"></i></div><strong>${countValue}</strong></div>`).join("") || "<p class=\"panel-note\">Type some letters to see the parade.</p>";
    }
    input.addEventListener("input", check);
    check();
  }

  /* ---------- Banner Butter ---------- */
  const BANNER_FONT = {
    A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"], B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
    C: ["01110", "10001", "10000", "10000", "10000", "10001", "01110"], D: ["11100", "10010", "10001", "10001", "10001", "10010", "11100"],
    E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"], F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
    G: ["01110", "10001", "10000", "10111", "10001", "10001", "01111"], H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
    I: ["01110", "00100", "00100", "00100", "00100", "00100", "01110"], J: ["00111", "00010", "00010", "00010", "00010", "10010", "01100"],
    K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"], L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
    M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"], N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
    O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"], P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
    Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"], R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
    S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"], T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
    U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"], V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
    W: ["10001", "10001", "10001", "10101", "10101", "10101", "01010"], X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
    Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"], Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
    "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"], "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
    "2": ["01110", "10001", "00001", "00110", "01000", "10000", "11111"], "3": ["11111", "00010", "00100", "00010", "00001", "10001", "01110"],
    "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"], "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
    "6": ["01110", "10000", "10000", "11110", "10001", "10001", "01110"], "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
    "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"], "9": ["01110", "10001", "10001", "01111", "00001", "00001", "01110"],
    " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"], "!": ["00100", "00100", "00100", "00100", "00100", "00000", "00100"],
    ".": ["00000", "00000", "00000", "00000", "00000", "01100", "01100"], "-": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
    "&": ["01100", "10010", "10100", "01000", "10101", "10010", "01101"],
  };

  function renderBanner() {
    return `
      <div class="extra-stack-layout">
        <section class="game-panel panel-teal">
          <div class="dev-tool-heading"><div><h3>Banner butter</h3><p class="panel-note">Spread your words thick with chunky block letters.</p></div><span class="dev-local-badge">A-Z 0-9</span></div>
          <input class="chunky-input" id="bannerInput" value="WAFFLE TIME" maxlength="24" aria-label="Banner text" />
          <div class="text-filter-options"><label>Letter style
            <select class="chunky-input chunky-select" id="bannerStyle"><option value="block">█ block</option><option value="hash"># hash</option><option value="dot">● dot</option></select></label></div>
        </section>
        <section class="game-panel panel-honey banner-output-panel">
          <div class="dev-tool-heading"><h3>Fresh banner</h3><span class="dev-local-badge" id="bannerSize">0 CHARS</span></div>
          <pre class="banner-pre" id="bannerOutput" aria-label="ASCII banner"></pre>
          <div class="button-row dev-action-row"><button class="game-button" id="bannerCopy">COPY</button></div>
        </section>
      </div>`;
  }

  function initBanner(root, api) {
    const input = root.querySelector("#bannerInput");
    const style = root.querySelector("#bannerStyle");
    const output = root.querySelector("#bannerOutput");
    const size = root.querySelector("#bannerSize");
    function draw() {
      const on = { block: "█ ", hash: "# ", dot: "● " }[style.value];
      const off = { block: "  ", hash: "  ", dot: "  " }[style.value];
      const text = input.value.toUpperCase().slice(0, 24);
      const glyphs = [...text].map((character) => BANNER_FONT[character] || BANNER_FONT[" "]);
      const rows = [];
      for (let row = 0; row < 7; row += 1) rows.push(glyphs.map((glyph) => [...glyph[row]].map((bit) => (bit === "1" ? on : off)).join("")).join("  "));
      output.textContent = rows.join("\n");
      size.textContent = `${[...text].filter((c) => c !== " ").length} CHARS`;
    }
    input.addEventListener("input", draw);
    style.addEventListener("change", draw);
    root.querySelector("#bannerCopy").addEventListener("click", () => api.copyGameText(output.textContent, "Banner copied!"));
    draw();
  }

  /* ---------- Paragraph Chef ---------- */
  function renderReflow() {
    return `
      <div class="extra-stack-layout">
        <section class="game-panel panel-teal">
          <div class="dev-tool-heading"><div><h3>Paragraph chef</h3><p class="panel-note">Reflow ragged lines into tidy paragraphs, or split them back apart.</p></div><span class="dev-local-badge">REFLOW</span></div>
          <textarea class="chunky-textarea" id="reflowInput" aria-label="Text to reflow" placeholder="Paste text with awkward line breaks…"></textarea>
          <div class="text-filter-category-tabs" id="reflowMode">
            <button class="tab-button active" data-reflow="wrap" aria-selected="true">Wrap</button>
            <button class="tab-button" data-reflow="join" aria-selected="false">Join lines</button>
            <button class="tab-button" data-reflow="sentences" aria-selected="false">One sentence / line</button>
          </div>
          <div class="text-filter-options"><label>Wrap width <strong id="reflowWidthValue">72</strong><input id="reflowWidth" type="range" min="40" max="100" value="72" /></label></div>
        </section>
        <section class="game-panel panel-honey">
          <div class="dev-tool-heading"><h3>Plated result</h3><span class="dev-local-badge" id="reflowStats">0 LINES</span></div>
          <textarea class="chunky-textarea extra-tall-textarea" id="reflowOutput" aria-label="Reflowed text" readonly></textarea>
          <div class="button-row dev-action-row"><button class="game-button" id="reflowCopy">COPY</button></div>
        </section>
      </div>`;
  }

  function initReflow(root, api) {
    const input = root.querySelector("#reflowInput");
    const output = root.querySelector("#reflowOutput");
    const width = root.querySelector("#reflowWidth");
    const stats = root.querySelector("#reflowStats");
    let mode = "wrap";
    function wrapParagraph(paragraph, limit) {
      const words = paragraph.split(/\s+/).filter(Boolean);
      const lines = [];
      let line = "";
      words.forEach((word) => {
        if ((line + " " + word).trim().length > limit) { lines.push(line.trim()); line = word; }
        else line += " " + word;
      });
      if (line.trim()) lines.push(line.trim());
      return lines.join("\n");
    }
    function cook() {
      const text = input.value;
      let result = "";
      if (mode === "wrap") result = text.split(/\n{2,}/).map((paragraph) => wrapParagraph(paragraph.replace(/\s*\n\s*/g, " "), Number(width.value))).join("\n\n");
      else if (mode === "join") result = text.split(/\n{2,}/).map((paragraph) => paragraph.replace(/\s*\n\s*/g, " ").trim()).join("\n\n");
      else result = text.replace(/\s+/g, " ").replace(/([.!?])\s+/g, "$1\n").trim();
      output.value = result;
      stats.textContent = `${result ? result.split("\n").length : 0} LINES`;
    }
    root.querySelectorAll("[data-reflow]").forEach((button) => button.addEventListener("click", () => {
      mode = button.dataset.reflow;
      root.querySelectorAll("[data-reflow]").forEach((tab) => { const selected = tab === button; tab.classList.toggle("active", selected); tab.setAttribute("aria-selected", String(selected)); });
      cook();
    }));
    input.addEventListener("input", cook);
    width.addEventListener("input", () => { root.querySelector("#reflowWidthValue").textContent = width.value; cook(); });
    root.querySelector("#reflowCopy").addEventListener("click", () => api.copyGameText(output.value, "Reflowed text copied!"));
    cook();
  }

  /* ---------- Secret Sauce (ciphers) ---------- */
  function renderCipher() {
    return `
      <div class="extra-stack-layout">
        <section class="game-panel panel-lilac">
          <div class="dev-tool-heading"><div><h3>Secret sauce</h3><p class="panel-note">Stir a key into your words so only friends can taste them.</p></div><span class="dev-local-badge">CIPHER</span></div>
          <textarea class="chunky-textarea" id="cipherInput" aria-label="Plain or secret text">Meet me at the waffle station.</textarea>
          <div class="text-filter-category-tabs" id="cipherMode">
            <button class="tab-button active" data-cipher-mode="encode" aria-selected="true">Encode</button>
            <button class="tab-button" data-cipher-mode="decode" aria-selected="false">Decode</button>
          </div>
          <div class="text-filter-options">
            <label>Sauce style
              <select class="chunky-input chunky-select" id="cipherAlgo"><option value="vigenere">Vigenère (needs a key)</option><option value="atbash">Atbash (mirror alphabet)</option><option value="caesar">Caesar +3</option></select>
            </label>
            <label>Key <input class="chunky-input" id="cipherKey" value="waffle" placeholder="secret key" /></label>
          </div>
        </section>
        <section class="game-panel panel-honey">
          <div class="dev-tool-heading"><h3>Bottled result</h3><span class="dev-local-badge" id="cipherBadge">ENCODED</span></div>
          <textarea class="chunky-textarea extra-tall-textarea" id="cipherOutput" aria-label="Cipher result" readonly></textarea>
          <div class="button-row dev-action-row"><button class="game-button" id="cipherCopy">COPY</button></div>
        </section>
      </div>`;
  }

  function initCipher(root, api) {
    const input = root.querySelector("#cipherInput");
    const output = root.querySelector("#cipherOutput");
    const algo = root.querySelector("#cipherAlgo");
    const key = root.querySelector("#cipherKey");
    const badge = root.querySelector("#cipherBadge");
    let mode = "encode";
    const shiftChar = (character, shift, encode) => {
      const base = character <= "Z" ? 65 : 97;
      const delta = encode ? shift : -shift;
      return String.fromCharCode(base + (((character.charCodeAt(0) - base + delta) % 26) + 26) % 26);
    };
    function transform(text, encode) {
      const cleanKey = key.value.toLowerCase().replace(/[^a-z]/g, "") || "waffle";
      let keyIndex = 0;
      return [...text].map((character) => {
        if (!/[A-Za-z]/.test(character)) return character;
        if (algo.value === "atbash") {
          const base = character <= "Z" ? 65 : 97;
          return String.fromCharCode(base + (25 - (character.charCodeAt(0) - base)));
        }
        if (algo.value === "caesar") return shiftChar(character, 3, encode);
        const shift = cleanKey[keyIndex % cleanKey.length].charCodeAt(0) - 97;
        keyIndex += 1;
        return shiftChar(character, shift, encode);
      }).join("");
    }
    function stir() {
      output.value = transform(input.value, mode === "encode");
      badge.textContent = mode === "encode" ? "ENCODED" : "DECODED";
    }
    root.querySelectorAll("[data-cipher-mode]").forEach((button) => button.addEventListener("click", () => {
      mode = button.dataset.cipherMode;
      root.querySelectorAll("[data-cipher-mode]").forEach((tab) => { const selected = tab === button; tab.classList.toggle("active", selected); tab.setAttribute("aria-selected", String(selected)); });
      stir();
    }));
    [input, key].forEach((el) => el.addEventListener("input", stir));
    algo.addEventListener("change", stir);
    root.querySelector("#cipherCopy").addEventListener("click", () => api.copyGameText(output.value, "Sauce bottled!"));
    stir();
  }

  window.TextFilesExtras2 = {
    sifter: { render: renderSifter, init: (root, api) => initSifter(root, api) },
    letterlab: { render: renderLetterLab, init: (root, api) => initLetterLab(root, api) },
    ladle: { render: renderLadle, init: (root) => initLadle(root) },
    recipecards: { render: renderRecipeCards, init: (root, api) => initRecipeCards(root, api) },
    wonders: { render: renderWonders, init: (root) => initWonders(root) },
    banner: { render: renderBanner, init: (root, api) => initBanner(root, api) },
    reflow: { render: renderReflow, init: (root, api) => initReflow(root, api) },
    cipher: { render: renderCipher, init: (root, api) => initCipher(root, api) },
  };
})();
