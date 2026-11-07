(() => {
  "use strict";

  const escapeMarkup = (value) => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  let qrPromise = null;
  function loadQr() {
    if (typeof window.qrcode === "function") return Promise.resolve(window.qrcode);
    if (qrPromise) return qrPromise;
    qrPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = new URL("vendor/qr/qrcode.js", document.baseURI).href;
      script.async = true;
      script.onload = () => (typeof window.qrcode === "function" ? resolve(window.qrcode) : reject(new Error("QR engine did not load.")));
      script.onerror = () => reject(new Error("Could not load the QR engine."));
      document.head.append(script);
    });
    return qrPromise;
  }

  /* ---------- Word Counter ---------- */
  function renderWordCounter() {
    return `
      <div class="extra-stack-layout">
        <section class="game-panel panel-teal">
          <div class="dev-tool-heading"><div><h3>Weigh your words</h3><p class="panel-note">Everything updates live while you type or paste, like a tiny kitchen scale for writing.</p></div><span class="dev-local-badge">LIVE</span></div>
          <textarea class="chunky-textarea extra-tall-textarea" id="wordCounterInput" aria-label="Text to measure" placeholder="Type or paste your tasty text here…"></textarea>
        </section>
        <section class="game-panel panel-honey">
          <div class="dev-tool-heading"><h3>Scale reading</h3><span class="dev-local-badge" id="wordCounterBadge">0 WORDS</span></div>
          <div class="stat-chip-grid" id="wordCounterStats"></div>
          <div class="dev-tool-heading top-words-heading"><h3>Top ingredients</h3></div>
          <div class="converter-family-chips" id="wordCounterTop"></div>
        </section>
      </div>`;
  }

  function initWordCounter(root) {
    const input = root.querySelector("#wordCounterInput");
    const stats = root.querySelector("#wordCounterStats");
    const top = root.querySelector("#wordCounterTop");
    const badge = root.querySelector("#wordCounterBadge");
    function measure() {
      const text = input.value;
      const words = (text.trim().match(/[\p{L}\p{N}''-]+/gu) || []);
      const chars = [...text].length;
      const charsNoSpace = [...text.replace(/\s/g, "")].length;
      const sentences = (text.match(/[^.!?…]+[.!?…]+/g) || (text.trim() ? [text] : [])).length;
      const paragraphs = text.split(/\n{2,}/).filter((part) => part.trim()).length;
      const lines = text ? text.split(/\n/).length : 0;
      const readSeconds = words.length ? Math.round((words.length / 200) * 60) : 0;
      const speakSeconds = words.length ? Math.round((words.length / 130) * 60) : 0;
      const clock = (seconds) => (seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m ${seconds % 60}s`);
      const rows = [
        ["Words", words.length], ["Characters", chars], ["No-space chars", charsNoSpace], ["Sentences", sentences],
        ["Paragraphs", paragraphs], ["Lines", lines], ["Reading time", clock(readSeconds)], ["Speaking time", clock(speakSeconds)],
      ];
      stats.innerHTML = rows.map(([label, value]) => `<div class="stat-chip"><strong>${escapeMarkup(value)}</strong><span>${label}</span></div>`).join("");
      badge.textContent = `${words.length} WORDS`;
      const counts = new Map();
      words.forEach((word) => {
        const clean = word.toLowerCase();
        if (clean.length < 4) return;
        counts.set(clean, (counts.get(clean) || 0) + 1);
      });
      const best = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
      top.innerHTML = best.length ? best.map(([word, count]) => `<span>${escapeMarkup(word)} × ${count}</span>`).join("") : "<span>Top repeated words appear here.</span>";
    }
    input.addEventListener("input", measure);
    measure();
  }

  /* ---------- Find & Replace ---------- */
  function renderFindReplace() {
    return `
      <div class="extra-stack-layout">
        <section class="game-panel panel-teal">
          <div class="dev-tool-heading"><div><h3>Original recipe</h3><p class="panel-note">Add swap rules below; they apply top to bottom.</p></div><span class="dev-local-badge">RULES</span></div>
          <textarea class="chunky-textarea" id="findReplaceInput" aria-label="Source text" placeholder="Paste the text you want to fix…"></textarea>
          <div class="findreplace-rules" id="findReplaceRules"></div>
          <div class="button-row dev-action-row"><button class="game-button game-button-small" id="findReplaceAdd">+ ADD SWAP RULE</button></div>
        </section>
        <section class="game-panel panel-honey">
          <div class="dev-tool-heading"><h3>Swapped result</h3><span class="dev-local-badge" id="findReplaceCount">0 SWAPS</span></div>
          <textarea class="chunky-textarea" id="findReplaceOutput" aria-label="Result text" readonly></textarea>
          <div class="button-row dev-action-row">
            <button class="game-button" id="findReplaceCopy">COPY</button>
            <button class="game-button game-button-sage" id="findReplaceDownload">DOWNLOAD .TXT</button>
          </div>
        </section>
      </div>`;
  }

  function initFindReplace(root, api) {
    const input = root.querySelector("#findReplaceInput");
    const output = root.querySelector("#findReplaceOutput");
    const rulesWrap = root.querySelector("#findReplaceRules");
    const countBadge = root.querySelector("#findReplaceCount");
    let swapTotal = 0;

    function addRule(find = "", replace = "") {
      const row = document.createElement("div");
      row.className = "findreplace-rule";
      row.innerHTML = `
        <input class="chunky-input" placeholder="Find" aria-label="Find" />
        <input class="chunky-input" placeholder="Replace with" aria-label="Replace with" />
        <label class="findreplace-flag"><input type="checkbox" /> <span>.*</span></label>
        <button class="round-mini-button" aria-label="Remove rule">✕</button>`;
      row.querySelectorAll("input")[0].value = find;
      row.querySelectorAll("input")[1].value = replace;
      rulesWrap.append(row);
      row.querySelector(".round-mini-button").addEventListener("click", () => { row.remove(); apply(); });
      row.querySelectorAll("input").forEach((field) => field.addEventListener("input", apply));
      apply();
    }

    function apply() {
      let text = input.value;
      swapTotal = 0;
      rulesWrap.querySelectorAll(".findreplace-rule").forEach((row) => {
        const [find, replace, regexFlag] = row.querySelectorAll("input");
        const pattern = find.value;
        if (!pattern) return;
        try {
          const rx = regexFlag.checked ? new RegExp(pattern, "gi") : new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
          text = text.replace(rx, (match) => { swapTotal += 1; return replace.value; });
        } catch {
          // Invalid regex rule is skipped until fixed.
        }
      });
      output.value = text;
      countBadge.textContent = `${swapTotal} SWAP${swapTotal === 1 ? "" : "S"}`;
    }

    input.addEventListener("input", apply);
    root.querySelector("#findReplaceAdd").addEventListener("click", () => addRule());
    root.querySelector("#findReplaceCopy").addEventListener("click", () => api.copyGameText(output.value, "Swapped text copied!"));
    root.querySelector("#findReplaceDownload").addEventListener("click", () => {
      const url = URL.createObjectURL(new Blob([output.value], { type: "text/plain" }));
      const anchor = document.createElement("a");
      anchor.href = url; anchor.download = "swapped-text.txt";
      document.body.append(anchor); anchor.click(); anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
    addRule("waffle", "WAFFLE");
  }

  /* ---------- Fridge Notes ---------- */
  const NOTES_KEY = "bite-sized-fridge-notes-v1";
  const noteColors = ["honey", "coral", "sage", "teal", "lilac"];

  function renderFridgeNotes() {
    return `
      <div class="fridge-layout">
        <section class="game-panel panel-teal fridge-toolbar">
          <div class="dev-tool-heading"><div><h3>Fridge notes</h3><p class="panel-note">Sticky little notes that stay saved in this browser, like magnets on the fridge.</p></div><span class="dev-local-badge">SAVED</span></div>
          <button class="game-button" id="addFridgeNote">+ STICK A NEW NOTE</button>
        </section>
        <div class="fridge-board" id="fridgeBoard" aria-label="Sticky notes board"></div>
      </div>`;
  }

  function initFridgeNotes(root) {
    const board = root.querySelector("#fridgeBoard");
    let notes = [];
    try { notes = JSON.parse(window.localStorage.getItem(NOTES_KEY) || "[]"); } catch { notes = []; }
    if (!Array.isArray(notes) || !notes.length) notes = [{ id: 1, color: "honey", body: "Welcome! This note sticks around even after closing the game." }];

    const save = () => { try { window.localStorage.setItem(NOTES_KEY, JSON.stringify(notes)); } catch { /* private mode */ } };

    function renderNotes() {
      board.innerHTML = notes.map((note) => `
        <div class="fridge-note note-${note.color}" data-note="${note.id}">
          <span class="fridge-note-magnet" aria-hidden="true"></span>
          <textarea aria-label="Note text">${escapeMarkup(note.body)}</textarea>
          <button class="round-mini-button fridge-note-delete" aria-label="Remove note">✕</button>
        </div>`).join("");
      board.querySelectorAll(".fridge-note").forEach((card) => {
        const id = Number(card.dataset.note);
        card.querySelector("textarea").addEventListener("input", (event) => {
          const note = notes.find((entry) => entry.id === id);
          note.body = event.target.value;
          save();
        });
        card.querySelector(".fridge-note-delete").addEventListener("click", () => {
          notes = notes.filter((entry) => entry.id !== id);
          save();
          renderNotes();
        });
      });
    }

    root.querySelector("#addFridgeNote").addEventListener("click", () => {
      notes.push({ id: Date.now(), color: noteColors[notes.length % noteColors.length], body: "" });
      save();
      renderNotes();
      board.querySelectorAll(".fridge-note textarea").forEach((area, index) => { if (index === board.querySelectorAll(".fridge-note textarea").length - 1) area.focus(); });
    });
    renderNotes();
  }

  /* ---------- Placeholder Bakery ---------- */
  const waffleWords = ["waffle", "syrup", "butter", "golden", "crispy", "batter", "honey", "maple", "cinnamon", "sprinkle", "cream", "berry", "cocoa", "mug", "steam", "cozy", "crunch", "drizzle", "toast", "iron", "kitchen", "spatula", "caramel", "vanilla", "sugar", "whisk", "oven", "warm", "fluffy", "grid"];
  const loremWords = ["lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore", "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud", "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo", "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate", "velit", "esse", "cillum", "fugiat", "nulla", "pariatur"];

  function renderBakery() {
    return `
      <div class="extra-stack-layout">
        <section class="game-panel panel-lilac">
          <div class="dev-tool-heading"><div><h3>Placeholder bakery</h3><p class="panel-note">Fresh dummy text, baked on demand. Waffle ipsum is the house specialty.</p></div><span class="dev-local-badge">FRESH</span></div>
          <div class="text-filter-category-tabs" id="bakeryMode">
            <button class="tab-button active" data-bakery-mode="waffle" aria-selected="true">Waffle ipsum</button>
            <button class="tab-button" data-bakery-mode="lorem" aria-selected="false">Classic lorem</button>
            <button class="tab-button" data-bakery-mode="custom" aria-selected="false">Custom mix</button>
          </div>
          <textarea class="chunky-input bakery-custom-input" id="bakeryCustom" placeholder="Paste your own words to bake with…" hidden></textarea>
          <div class="text-filter-options">
            <label>Amount <strong id="bakeryCountValue">60</strong><input id="bakeryCount" type="range" min="10" max="400" step="10" value="60" /></label>
            <label>Unit
              <select class="chunky-input chunky-select" id="bakeryUnit"><option value="words">words</option><option value="sentences">sentences</option><option value="paragraphs">paragraphs</option></select>
            </label>
          </div>
          <div class="button-row dev-action-row"><button class="game-button" id="bakeryBake">BAKE TEXT</button></div>
        </section>
        <section class="game-panel panel-honey">
          <div class="dev-tool-heading"><h3>Today's batch</h3><span class="dev-local-badge" id="bakeryStats">0 WORDS</span></div>
          <textarea class="chunky-textarea extra-tall-textarea" id="bakeryOutput" aria-label="Generated placeholder text" readonly></textarea>
          <div class="button-row dev-action-row"><button class="game-button game-button-sage" id="bakeryCopy">COPY</button></div>
        </section>
      </div>`;
  }

  function initBakery(root, api) {
    const output = root.querySelector("#bakeryOutput");
    const count = root.querySelector("#bakeryCount");
    const unit = root.querySelector("#bakeryUnit");
    const custom = root.querySelector("#bakeryCustom");
    const stats = root.querySelector("#bakeryStats");
    let mode = "waffle";
    const pick = (list) => list[Math.floor(Math.random() * list.length)];
    const wordsFor = () => {
      if (mode === "lorem") return loremWords;
      if (mode === "custom") {
        const customWords = custom.value.match(/[\p{L}\p{N}]+/gu);
        return customWords && customWords.length >= 3 ? customWords : waffleWords;
      }
      return waffleWords;
    };
    const sentence = (list) => {
      const length = 6 + Math.floor(Math.random() * 9);
      const parts = Array.from({ length }, () => pick(list));
      const text = parts.join(" ").replace(/\b\w/g, (c, i) => (i === 0 ? c.toUpperCase() : c));
      return `${text[0].toUpperCase()}${text.slice(1)}.`;
    };
    function bake() {
      const list = wordsFor();
      const amount = Number(count.value);
      let text = "";
      if (unit.value === "words") {
        const parts = Array.from({ length: amount }, () => pick(list));
        text = parts.join(" ").replace(/^./, (c) => c.toUpperCase());
        let wordsMade = 0;
        const sentences = [];
        while (wordsMade < amount) { const take = Math.min(6 + Math.floor(Math.random() * 9), amount - wordsMade); sentences.push(`${parts.slice(wordsMade, wordsMade + take).join(" ")}.`); wordsMade += take; }
        text = sentences.map((entry) => entry.replace(/^./, (c) => c.toUpperCase())).join(" ");
      } else if (unit.value === "sentences") {
        text = Array.from({ length: amount }, () => sentence(list)).join(" ");
      } else {
        text = Array.from({ length: amount }, () => Array.from({ length: 3 + Math.floor(Math.random() * 3) }, () => sentence(list)).join(" ")).join("\n\n");
      }
      output.value = text;
      stats.textContent = `${(text.trim().match(/\S+/g) || []).length} WORDS`;
    }
    root.querySelectorAll("[data-bakery-mode]").forEach((button) => button.addEventListener("click", () => {
      mode = button.dataset.bakeryMode;
      root.querySelectorAll("[data-bakery-mode]").forEach((tab) => { const selected = tab === button; tab.classList.toggle("active", selected); tab.setAttribute("aria-selected", String(selected)); });
      custom.hidden = mode !== "custom";
      bake();
    }));
    count.addEventListener("input", () => { root.querySelector("#bakeryCountValue").textContent = count.value; });
    [unit, custom].forEach((el) => el.addEventListener("input", bake));
    root.querySelector("#bakeryBake").addEventListener("click", bake);
    root.querySelector("#bakeryCopy").addEventListener("click", () => api.copyGameText(output.value, "Fresh text copied!"));
    bake();
  }

  /* ---------- QR Sticker ---------- */
  function renderQrSticker() {
    return `
      <div class="extra-stack-layout qr-layout">
        <section class="game-panel panel-teal">
          <div class="dev-tool-heading"><div><h3>QR sticker press</h3><p class="panel-note">Turn any text or link into a printable little QR sticker, right in the browser.</p></div><span class="dev-local-badge">LOCAL</span></div>
          <textarea class="chunky-input" id="qrInput" aria-label="Text or URL for the QR code" placeholder="https://or-any-text-you-like">https://waffle.kitchen</textarea>
          <div class="text-filter-options">
            <label>Sticker size <strong id="qrSizeValue">256px</strong><input id="qrSize" type="range" min="128" max="512" step="32" value="256" /></label>
          </div>
        </section>
        <section class="game-panel panel-honey qr-preview-panel">
          <div class="qr-sticker-frame"><canvas id="qrCanvas" width="256" height="256" aria-label="Generated QR code"></canvas></div>
          <p class="graph-error" id="qrError" role="status"></p>
          <button class="game-button game-button-sage" id="qrDownload">DOWNLOAD PNG</button>
        </section>
      </div>`;
  }

  function initQrSticker(root) {
    const input = root.querySelector("#qrInput");
    const size = root.querySelector("#qrSize");
    const canvas = root.querySelector("#qrCanvas");
    const error = root.querySelector("#qrError");
    let timer = null;
    async function draw() {
      error.textContent = "";
      const value = input.value.trim();
      if (!value) { canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height); return; }
      try {
        const qrcode = await loadQr();
        const qr = qrcode(0, "M");
        qr.addData(value);
        qr.make();
        const modules = qr.getModuleCount();
        const pixels = Number(size.value);
        const quiet = 4;
        const scale = Math.max(2, Math.floor(pixels / (modules + quiet * 2)));
        const total = (modules + quiet * 2) * scale;
        canvas.width = total; canvas.height = total;
        const context = canvas.getContext("2d");
        context.fillStyle = "#fff8e7";
        context.fillRect(0, 0, total, total);
        context.fillStyle = "#4f2f23";
        for (let row = 0; row < modules; row += 1) for (let col = 0; col < modules; col += 1) if (qr.isDark(row, col)) context.fillRect((col + quiet) * scale, (row + quiet) * scale, scale, scale);
      } catch (caught) {
        error.textContent = caught.message || "That text does not fit in a QR code.";
      }
    }
    input.addEventListener("input", () => { window.clearTimeout(timer); timer = window.setTimeout(draw, 250); });
    size.addEventListener("input", () => { root.querySelector("#qrSizeValue").textContent = `${size.value}px`; draw(); });
    root.querySelector("#qrDownload").addEventListener("click", () => {
      const anchor = document.createElement("a");
      anchor.href = canvas.toDataURL("image/png");
      anchor.download = "qr-sticker.png";
      document.body.append(anchor); anchor.click(); anchor.remove();
    });
    draw();
  }

  /* ---------- Emoji Pantry ---------- */
  const emojiShelf = [
    ["🧇", "waffle food breakfast"], ["🥞", "pancake stack food"], ["🍯", "honey jar sweet"], ["🧈", "butter"], ["🍓", "strawberry berry fruit"], ["🫐", "blueberry berry"], ["🍫", "chocolate bar"], ["☕", "coffee mug hot"], ["🍵", "tea cup"], ["🥛", "milk glass"],
    ["🍩", "donut doughnut"], ["🍪", "cookie"], ["🎂", "cake birthday"], ["🧁", "cupcake"], ["🍰", "slice cake"], ["🥧", "pie"], ["🍦", "icecream soft serve"], ["🍨", "ice cream bowl"], ["🍧", "shaved ice"], ["🍬", "candy sweet"],
    ["🥐", "croissant"], ["🍞", "bread toast"], ["🥖", "baguette"], ["🥨", "pretzel"], ["🥯", "bagel"], ["🌽", "corn"], ["🍿", "popcorn"], ["🥓", "bacon"], ["🍳", "egg frying pan"], ["🥚", "egg"],
    ["🍎", "apple fruit"], ["🍌", "banana"], ["🍇", "grapes"], ["🍉", "watermelon"], ["🍒", "cherry"], ["🍑", "peach"], ["🍍", "pineapple"], ["🥭", "mango"], ["🍋", "lemon"], ["🥝", "kiwi"],
    ["😀", "smile happy face"], ["😂", "laugh cry"], ["🥰", "love hearts face"], ["😎", "cool sunglasses"], ["🤩", "star eyes excited"], ["😋", "yummy tasty"], ["🤤", "drool hungry"], ["😴", "sleep tired"], ["🤯", "mind blown"], ["😅", "sweat nervous"],
    ["🥳", "party celebrate"], ["😭", "cry sad"], ["😡", "angry"], ["🤔", "think hmm"], ["👀", "eyes look"], ["🙈", "monkey hide"], ["💖", "sparkle heart love"], ["💛", "yellow heart"], ["✨", "sparkles shine"], ["🌟", "glowing star"],
    ["⭐", "star"], ["🔥", "fire hot"], ["🎉", "party popper"], ["🎈", "balloon"], ["🎁", "gift present"], ["🏆", "trophy win"], ["🥇", "medal gold"], ["🎯", "target hit"], ["🎮", "game controller"], ["🎵", "music note"],
    ["👍", "thumbs up yes"], ["👎", "thumbs down no"], ["👏", "clap applause"], ["🙌", "hands raise yay"], ["🤝", "handshake deal"], ["💪", "muscle strong"], ["👋", "wave hello"], ["✌️", "peace victory"], ["🤞", "fingers luck"], ["🫶", "heart hands love"],
    ["🐱", "cat"], ["🐶", "dog"], ["🐻", "bear"], ["🐼", "panda"], ["🦊", "fox"], ["🐰", "rabbit bunny"], ["🐸", "frog"], ["🐵", "monkey"], ["🦄", "unicorn"], ["🐝", "bee honey"],
    ["🌈", "rainbow"], ["☀️", "sun sunny"], ["🌙", "moon night"], ["⚡", "lightning zap"], ["❄️", "snow cold"], ["🌸", "blossom flower"], ["🌻", "sunflower"], ["🍀", "clover lucky"], ["🌊", "wave ocean"], ["🎃", "pumpkin halloween"],
    ["🏠", "house home"], ["🛋️", "couch cozy"], ["🛏️", "bed sleep"], ["🚪", "door"], ["🪟", "window"], ["🧺", "basket laundry"], ["🧹", "broom clean"], ["🧼", "soap bubble"], ["🫧", "bubbles"], ["🧽", "sponge"],
    ["🍽️", "plate fork meal"], ["🥄", "spoon"], ["🔪", "knife chef"], ["🍴", "fork"], ["🥣", "bowl cereal"], ["🫖", "teapot"], ["🧋", "boba tea"], ["🥤", "cup drink straw"], ["🍾", "champagne celebrate"], ["🧂", "salt"],
    ["✅", "check done yes"], ["❌", "cross no"], ["❓", "question"], ["❗", "exclamation"], ["💯", "hundred perfect"], ["🆗", "ok okay"], ["🆕", "new"], ["⏰", "alarm clock time"], ["⌛", "hourglass wait"], ["📅", "calendar date"],
    ["📝", "memo write note"], ["✏️", "pencil"], ["🖊️", "pen"], ["📎", "paperclip"], ["📌", "pushpin pin"], ["📚", "books study"], ["📖", "open book read"], ["🔖", "bookmark"], ["🏷️", "label tag"], ["📦", "box package"],
    ["💡", "bulb idea"], ["🔍", "magnify search"], ["🔒", "lock secure"], ["🔑", "key"], ["⚙️", "gear settings"], ["🧮", "abacus math"], ["📊", "chart bars"], ["📈", "graph up"], ["🖥️", "computer screen"], ["⌨️", "keyboard typing"],
  ];

  function renderEmojiPantry() {
    return `
      <div class="extra-stack-layout">
        <section class="game-panel panel-lilac">
          <div class="dev-tool-heading"><div><h3>Emoji pantry</h3><p class="panel-note">Search the shelves, tap an emoji, and it lands on your plate ready to copy.</p></div><span class="dev-local-badge">${emojiShelf.length} JARS</span></div>
          <input class="chunky-input" id="emojiSearch" placeholder="Search: waffle, happy, cat, party…" aria-label="Search emoji" />
          <div class="emoji-grid" id="emojiGrid" aria-label="Emoji results"></div>
        </section>
        <section class="game-panel panel-honey emoji-plate-panel">
          <div class="dev-tool-heading"><h3>Your plate</h3><span class="dev-local-badge" id="emojiName">tap an emoji</span></div>
          <div class="emoji-plate" id="emojiPlate" aria-live="polite">🧇</div>
          <div class="button-row dev-action-row"><button class="game-button" id="emojiCopy">COPY EMOJI</button><button class="game-button game-button-small" id="emojiCopyTen">COPY ×10</button></div>
        </section>
      </div>`;
  }

  function initEmojiPantry(root, api) {
    const grid = root.querySelector("#emojiGrid");
    const search = root.querySelector("#emojiSearch");
    const plate = root.querySelector("#emojiPlate");
    const name = root.querySelector("#emojiName");
    let current = "🧇";
    function renderGrid(filter = "") {
      const needle = filter.trim().toLowerCase();
      const matches = emojiShelf.filter(([, keywords]) => !needle || keywords.includes(needle) || [...needle].some((c) => keywords.includes(c)));
      grid.innerHTML = (matches.length ? matches : emojiShelf).map(([emoji, keywords]) => `<button class="emoji-jar" data-emoji="${emoji}" aria-label="${escapeMarkup(keywords)}">${emoji}</button>`).join("");
    }
    grid.addEventListener("click", (event) => {
      const jar = event.target.closest(".emoji-jar");
      if (!jar) return;
      current = jar.dataset.emoji;
      plate.textContent = current;
      name.textContent = jar.getAttribute("aria-label").split(" ")[0];
    });
    search.addEventListener("input", () => renderGrid(search.value));
    root.querySelector("#emojiCopy").addEventListener("click", () => api.copyGameText(current, "Emoji copied!"));
    root.querySelector("#emojiCopyTen").addEventListener("click", () => api.copyGameText(current.repeat(10), "Ten emojis copied!"));
    renderGrid();
  }

  /* ---------- Typing Taste Test ---------- */
  const typingRecipes = [
    "A crispy waffle beats a soggy pancake every single morning.",
    "Maple syrup flows faster when the butter is perfectly melted.",
    "The tiny kitchen serves ten tools and one very happy waffle.",
    "Whisk the batter gently, then let the golden squares crisp up.",
    "Fresh blueberries and warm cocoa make the coziest breakfast team.",
    "Sprinkle cinnamon over everything and the kitchen smells like a hug.",
  ];

  function renderTypingTest() {
    return `
      <div class="extra-stack-layout">
        <section class="game-panel panel-teal">
          <div class="dev-tool-heading"><div><h3>Typing taste test</h3><p class="panel-note">Start typing to begin the timer; finish the sentence to see your score.</p></div><span class="dev-local-badge" id="typingTimer">0s</span></div>
          <div class="typing-target" id="typingTarget" aria-label="Text to type"></div>
          <textarea class="chunky-input typing-input" id="typingInput" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Type the sentence here…" aria-label="Your typing"></textarea>
        </section>
        <section class="game-panel panel-honey">
          <div class="dev-tool-heading"><h3>Taste results</h3><span class="dev-local-badge" id="typingState">READY</span></div>
          <div class="stat-chip-grid" id="typingStats"></div>
          <div class="button-row dev-action-row"><button class="game-button" id="typingNew">NEW RECIPE</button></div>
        </section>
      </div>`;
  }

  function initTypingTest(root) {
    const target = root.querySelector("#typingTarget");
    const input = root.querySelector("#typingInput");
    const timer = root.querySelector("#typingTimer");
    const stats = root.querySelector("#typingStats");
    const state = root.querySelector("#typingState");
    let recipe = "";
    let startedAt = null;
    let finished = false;
    let interval = null;

    function newRecipe() {
      recipe = typingRecipes[Math.floor(Math.random() * typingRecipes.length)];
      target.textContent = recipe;
      input.value = "";
      input.disabled = false;
      startedAt = null;
      finished = false;
      state.textContent = "READY";
      timer.textContent = "0s";
      window.clearInterval(interval);
      renderStats(0, 0, 0, 0);
      input.focus();
    }

    function renderStats(wpm, accuracy, seconds, progress) {
      stats.innerHTML = [
        [`${wpm}`, "WPM"], [`${accuracy}%`, "Accuracy"], [`${seconds}s`, "Time"], [`${progress}%`, "Finished"],
      ].map(([value, label]) => `<div class="stat-chip"><strong>${value}</strong><span>${label}</span></div>`).join("");
    }

    function update() {
      if (finished) return;
      const typed = input.value;
      if (!startedAt && typed.length) {
        startedAt = performance.now();
        state.textContent = "TYPING…";
        interval = window.setInterval(() => { timer.textContent = `${Math.floor((performance.now() - startedAt) / 1000)}s`; }, 250);
      }
      let correct = 0;
      for (let index = 0; index < typed.length; index += 1) if (typed[index] === recipe[index]) correct += 1;
      target.innerHTML = [...recipe].map((character, index) => {
        let cls = "typing-char";
        if (index < typed.length) cls += typed[index] === character ? " ok" : " bad";
        return `<span class="${cls}">${character === " " ? "&nbsp;" : escapeMarkup(character)}</span>`;
      }).join("");
      const seconds = startedAt ? (performance.now() - startedAt) / 1000 : 0;
      const minutes = Math.max(seconds, 1) / 60;
      const wpm = startedAt ? Math.round(correct / 5 / minutes) : 0;
      const accuracy = typed.length ? Math.round((correct / typed.length) * 100) : 100;
      const progress = Math.round((correct / recipe.length) * 100);
      renderStats(wpm, accuracy, Math.floor(seconds), Math.min(progress, 100));
      if (typed.length >= recipe.length || (correct === recipe.length && typed.length)) {
        finished = true;
        input.disabled = true;
        window.clearInterval(interval);
        state.textContent = "DELICIOUS!";
        timer.textContent = `${Math.floor(seconds)}s`;
      }
    }

    input.addEventListener("input", update);
    root.querySelector("#typingNew").addEventListener("click", newRecipe);
    newRecipe();
  }

  /* ---------- Speed Reader ---------- */
  function renderSpeedReader() {
    return `
      <div class="extra-stack-layout">
        <section class="game-panel panel-teal">
          <div class="dev-tool-heading"><div><h3>Speed reader</h3><p class="panel-note">Words flash one at a time so your eyes stay cozy and quick.</p></div><span class="dev-local-badge">RSVP</span></div>
          <textarea class="chunky-textarea" id="speedReaderText" aria-label="Text to speed read">The waffle kitchen reads fast and stays friendly. Paste any article here and press start to sprint through it one word at a time.</textarea>
          <div class="text-filter-options">
            <label>Speed <strong id="speedReaderWpmValue">300 WPM</strong><input id="speedReaderWpm" type="range" min="150" max="700" step="25" value="300" /></label>
          </div>
        </section>
        <section class="game-panel panel-honey speedreader-panel">
          <div class="speedreader-stage" aria-live="off"><span id="speedReaderWord">ready?</span></div>
          <div class="converter-progress" id="speedReaderProgressWrap"><span id="speedReaderProgress"></span></div>
          <div class="button-row dev-action-row">
            <button class="game-button" id="speedReaderStart">START</button>
            <button class="game-button game-button-coral" id="speedReaderReset">RESET</button>
          </div>
        </section>
      </div>`;
  }

  function initSpeedReader(root) {
    const area = root.querySelector("#speedReaderText");
    const word = root.querySelector("#speedReaderWord");
    const wpm = root.querySelector("#speedReaderWpm");
    const start = root.querySelector("#speedReaderStart");
    const progress = root.querySelector("#speedReaderProgress");
    let timer = null;
    let index = 0;
    let wordsList = [];
    function stop() { window.clearInterval(timer); timer = null; start.textContent = index && index < wordsList.length ? "RESUME" : "START"; }
    function show(current) {
      const middle = Math.floor((current.length - 1) / 2);
      word.innerHTML = [...current].map((c, i) => `<span class="${i === middle ? "orp" : ""}">${escapeMarkup(c)}</span>`).join("");
      progress.style.width = `${Math.round(((index + 1) / Math.max(wordsList.length, 1)) * 100)}%`;
    }
    start.addEventListener("click", () => {
      if (timer) { stop(); return; }
      if (!index || index >= wordsList.length) { wordsList = area.value.trim().split(/\s+/).filter(Boolean); index = 0; }
      if (!wordsList.length) return;
      start.textContent = "PAUSE";
      timer = window.setInterval(() => {
        show(wordsList[index]);
        index += 1;
        if (index >= wordsList.length) { stop(); start.textContent = "AGAIN"; index = 0; word.textContent = "done! 🧇"; }
      }, 60000 / Number(wpm.value));
    });
    root.querySelector("#speedReaderReset").addEventListener("click", () => { stop(); index = 0; progress.style.width = "0%"; word.textContent = "ready?"; });
    wpm.addEventListener("input", () => {
      root.querySelector("#speedReaderWpmValue").textContent = `${wpm.value} WPM`;
      if (timer) { stop(); start.click(); }
    });
  }

  window.TextFilesExtras = {
    wordcounter: { render: renderWordCounter, init: initWordCounter },
    findreplace: { render: renderFindReplace, init: (root, api) => initFindReplace(root, api) },
    notes: { render: renderFridgeNotes, init: initFridgeNotes },
    bakery: { render: renderBakery, init: (root, api) => initBakery(root, api) },
    qrsticker: { render: renderQrSticker, init: initQrSticker },
    emoji: { render: renderEmojiPantry, init: (root, api) => initEmojiPantry(root, api) },
    typing: { render: renderTypingTest, init: initTypingTest },
    speedread: { render: renderSpeedReader, init: initSpeedReader },
  };
})();
