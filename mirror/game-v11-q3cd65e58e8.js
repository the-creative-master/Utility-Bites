(() => {
  "use strict";

  const homeScreen = document.querySelector("#homeScreen");
  const homeWall = document.querySelector("#homeWall");
  const mathHomeCupboard = document.querySelector("#mathHomeCupboard");
  const codingHomeCupboard = document.querySelector("#codingHomeCupboard");
  const textHomeCupboard = document.querySelector("#textHomeCupboard");
  const designHomeCupboard = document.querySelector("#designHomeCupboard");
  const openMathCupboard = document.querySelector("#openMathCupboard");
  const openCodingCupboard = document.querySelector("#openCodingCupboard");
  const openTextCupboard = document.querySelector("#openTextCupboard");
  const openDesignCupboard = document.querySelector("#openDesignCupboard");
  const backHomeButton = document.querySelector("#backHome");
  const backHomeCodingButton = document.querySelector("#backHomeCoding");
  const backHomeTextButton = document.querySelector("#backHomeText");
  const backHomeDesignButton = document.querySelector("#backHomeDesign");
  const gameWorld = document.querySelector("#gameWorld");
  const codingWorld = document.querySelector("#codingWorld");
  const textWorld = document.querySelector("#textWorld");
  const designWorld = document.querySelector("#designWorld");
  const waffleBackdrop = document.querySelector("#waffleBackdrop");
  const codingWaffleBackdrop = document.querySelector("#codingWaffleBackdrop");
  const textWaffleBackdrop = document.querySelector("#textWaffleBackdrop");
  const designWaffleBackdrop = document.querySelector("#designWaffleBackdrop");
  const toolOverlay = document.querySelector("#toolOverlay");
  const toolBody = document.querySelector("#toolBody");
  const toolTitle = document.querySelector("#toolTitle");
  const toolCategory = document.querySelector("#toolCategory");
  const toolHeadingIcon = document.querySelector("#toolHeadingIcon");
  const closeToolButton = document.querySelector("#closeTool");
  const overlayCurtain = document.querySelector("#overlayCurtain");
  const toast = document.querySelector("#toast");
  const confettiField = document.querySelector("#confettiField");
  const openSettingsButton = document.querySelector("#openSettings");
  const settingsOverlay = document.querySelector("#settingsOverlay");
  const settingsCurtain = document.querySelector("#settingsCurtain");
  const closeSettingsButton = document.querySelector("#closeSettings");
  const mainColorInput = document.querySelector("#mainColor");
  const accentColorInput = document.querySelector("#accentColor");
  const lowDetailToggle = document.querySelector("#lowDetailToggle");
  const resetSettingsButton = document.querySelector("#resetSettings");

  let activeCleanup = [];
  let activeCategoryKey = null;
  let activeToolToken = 0;
  let lastFocusedElement = null;
  let toastTimer = null;
  let drawerClearTimer = null;
  let screenTimer = null;

  const iconMarkup = (name) => `<svg aria-hidden="true"><use href="#icon-${name}"></use></svg>`;

  const tools = {
    calculator: {
      title: "Calculator",
      icon: "calculator",
      color: "#e9947f",
      render: renderCalculator,
      init: initCalculator,
    },
    graph: {
      title: "Graphing Calculator",
      icon: "graph",
      color: "#9ccbc4",
      render: renderGraphingCalculator,
      init: initGraphingCalculator,
    },
    body: {
      title: "Bodily Calculator",
      icon: "body",
      color: "#abc89c",
      render: renderBodyCalculator,
      init: initBodyCalculator,
    },
    fraction: {
      title: "Fraction Calculator",
      icon: "fraction",
      color: "#c4add0",
      render: renderFractionCalculator,
      init: initFractionCalculator,
    },
    percentage: {
      title: "Percentage Calculator",
      icon: "percent",
      color: "#f2c86f",
      render: renderPercentageCalculator,
      init: initPercentageCalculator,
    },
    dice: {
      title: "Dice Roller",
      icon: "dice",
      color: "#9ccbc4",
      render: renderDiceRoller,
      init: initDiceRoller,
    },
    roman: {
      title: "Roman Numeral Calculator",
      icon: "roman",
      color: "#efd39b",
      render: renderRomanCalculator,
      init: initRomanCalculator,
    },
    base: {
      title: "Number Base Converter",
      icon: "base",
      color: "#e9947f",
      render: renderBaseConverter,
      init: initBaseConverter,
    },
    prime: {
      title: "Prime Number Checker",
      icon: "prime",
      color: "#f2c86f",
      render: renderPrimeChecker,
      init: initPrimeChecker,
    },
    sequence: {
      title: "Sequence Playground",
      icon: "sequence",
      color: "#abc89c",
      render: renderSequencePlayground,
      init: initSequencePlayground,
    },
    codehub: {
      title: "CodeHub",
      category: "Coding & Developing",
      categoryKey: "coding",
      icon: "codehub",
      color: "#92c8c1",
      render: renderCodeHub,
      init: initCodeHub,
    },
    json: {
      title: "JSON Workshop",
      category: "Coding & Developing",
      categoryKey: "coding",
      icon: "json",
      color: "#c4add0",
      render: renderJsonWorkshop,
      init: initJsonWorkshop,
    },
    regex: {
      title: "Regex Playground",
      category: "Coding & Developing",
      categoryKey: "coding",
      icon: "regex",
      color: "#f2c86f",
      render: renderRegexPlayground,
      init: initRegexPlayground,
    },
    codec: {
      title: "Data Codec",
      category: "Coding & Developing",
      categoryKey: "coding",
      icon: "codec",
      color: "#e9947f",
      render: renderDataCodec,
      init: initDataCodec,
    },
    hash: {
      title: "Hash Generator",
      category: "Coding & Developing",
      categoryKey: "coding",
      icon: "hash",
      color: "#abc89c",
      render: renderHashGenerator,
      init: initHashGenerator,
    },
    uuid: {
      title: "UUID Forge",
      category: "Coding & Developing",
      categoryKey: "coding",
      icon: "uuid",
      color: "#9cbdd2",
      render: renderUuidForge,
      init: initUuidForge,
    },
    jwt: {
      title: "JWT Inspector",
      category: "Coding & Developing",
      categoryKey: "coding",
      icon: "jwt",
      color: "#c4add0",
      render: renderJwtInspector,
      init: initJwtInspector,
    },
    diff: {
      title: "Diff Checker",
      category: "Coding & Developing",
      categoryKey: "coding",
      icon: "diff",
      color: "#e9947f",
      render: renderDiffChecker,
      init: initDiffChecker,
    },
    markdown: {
      title: "Markdown Studio",
      category: "Coding & Developing",
      categoryKey: "coding",
      icon: "markdown",
      color: "#9cbdd2",
      render: renderMarkdownStudio,
      init: initMarkdownStudio,
    },
    timestamp: {
      title: "Timestamp Lab",
      category: "Coding & Developing",
      categoryKey: "coding",
      icon: "timestamp",
      color: "#f2c86f",
      render: renderTimestampLab,
      init: initTimestampLab,
    },
    fileconverter: {
      title: "File Converter",
      category: "Text & Files",
      categoryKey: "text",
      icon: "files",
      color: "#9cbdd2",
      render: () => window.TextFilesTools.renderFileConverter(),
      init: (root) => window.TextFilesTools.initFileConverter(root, { showToast, addCleanup, copyGameText }),
    },
    textfilters: {
      title: "Crazy Text Filters",
      category: "Text & Files",
      categoryKey: "text",
      icon: "textfilters",
      color: "#c4add0",
      render: () => window.TextFilesTools.renderTextFilters(),
      init: (root) => window.TextFilesTools.initTextFilters(root, { showToast, copyGameText }),
    },
    wordcounter: {
      title: "Word Counter",
      category: "Text & Files",
      categoryKey: "text",
      icon: "wordcount",
      color: "#9cbdd2",
      render: () => window.TextFilesExtras.wordcounter.render(),
      init: (root) => window.TextFilesExtras.wordcounter.init(root),
    },
    findreplace: {
      title: "Find & Replace",
      category: "Text & Files",
      categoryKey: "text",
      icon: "findreplace",
      color: "#e9947f",
      render: () => window.TextFilesExtras.findreplace.render(),
      init: (root) => window.TextFilesExtras.findreplace.init(root, { showToast, copyGameText }),
    },
    notes: {
      title: "Fridge Notes",
      category: "Text & Files",
      categoryKey: "text",
      icon: "notes",
      color: "#f2c86f",
      render: () => window.TextFilesExtras.notes.render(),
      init: (root) => window.TextFilesExtras.notes.init(root),
    },
    bakery: {
      title: "Placeholder Bakery",
      category: "Text & Files",
      categoryKey: "text",
      icon: "bakery",
      color: "#abc89c",
      render: () => window.TextFilesExtras.bakery.render(),
      init: (root) => window.TextFilesExtras.bakery.init(root, { showToast, copyGameText }),
    },
    qrsticker: {
      title: "QR Sticker",
      category: "Text & Files",
      categoryKey: "text",
      icon: "qr",
      color: "#9ccbc4",
      render: () => window.TextFilesExtras.qrsticker.render(),
      init: (root) => window.TextFilesExtras.qrsticker.init(root),
    },
    typing: {
      title: "Typing Taste Test",
      category: "Text & Files",
      categoryKey: "text",
      icon: "typing",
      color: "#e9947f",
      render: () => window.TextFilesExtras.typing.render(),
      init: (root) => window.TextFilesExtras.typing.init(root),
    },
    banner: {
      title: "Banner Butter",
      category: "Text & Files",
      categoryKey: "text",
      icon: "banner",
      color: "#9cbdd2",
      render: () => window.TextFilesExtras2.banner.render(),
      init: (root) => window.TextFilesExtras2.banner.init(root, { showToast, copyGameText }),
    },
    reflow: {
      title: "Paragraph Chef",
      category: "Text & Files",
      categoryKey: "text",
      icon: "reflow",
      color: "#e9947f",
      render: () => window.TextFilesExtras2.reflow.render(),
      init: (root) => window.TextFilesExtras2.reflow.init(root, { showToast, copyGameText }),
    },
    artstudio: {
      title: "Art Studio",
      category: "Design & Art",
      categoryKey: "design",
      icon: "artstudio",
      color: "#f49ac2",
      render: () => window.DesignArtTools.renderArtStudio(),
      init: (root) => window.DesignArtTools.initArtStudio(root, { showToast, addCleanup, copyGameText }),
    },
    colorpicker: {
      title: "Color Picker",
      category: "Design & Art",
      categoryKey: "design",
      icon: "colorpicker",
      color: "#efb94f",
      render: () => window.DesignArtTools.renderColorPicker(),
      init: (root) => window.DesignArtTools.initColorPicker(root, { showToast, copyGameText }),
    },
    pixelart: {
      title: "Pixel Painter",
      category: "Design & Art",
      categoryKey: "design",
      icon: "pixelart",
      color: "#e9947f",
      render: () => window.DesignArtTools.renderPixelPainter(),
      init: (root) => window.DesignArtTools.initPixelPainter(root, { showToast, copyGameText }),
    },
    gradient: {
      title: "Gradient Mixer",
      category: "Design & Art",
      categoryKey: "design",
      icon: "gradient",
      color: "#9ccbc4",
      render: () => window.DesignArtTools.renderGradientMixer(),
      init: (root) => window.DesignArtTools.initGradientMixer(root, { showToast, copyGameText }),
    },
    palette: {
      title: "Palette Baker",
      category: "Design & Art",
      categoryKey: "design",
      icon: "palette",
      color: "#c4add0",
      render: () => window.DesignArtTools.renderPaletteBaker(),
      init: (root) => window.DesignArtTools.initPaletteBaker(root, { showToast, copyGameText }),
    },
    boxshadow: {
      title: "Shadow & Glow",
      category: "Design & Art",
      categoryKey: "design",
      icon: "boxshadow",
      color: "#abc89c",
      render: () => window.DesignArtTools.renderBoxShadow(),
      init: (root) => window.DesignArtTools.initBoxShadow(root, { showToast, copyGameText }),
    },
    blobmaker: {
      title: "Blob Maker",
      category: "Design & Art",
      categoryKey: "design",
      icon: "blobmaker",
      color: "#f49ac2",
      render: () => window.DesignArtTools.renderBlobMaker(),
      init: (root) => window.DesignArtTools.initBlobMaker(root, { showToast, copyGameText }),
    },
    pattern: {
      title: "Pattern Tiles",
      category: "Design & Art",
      categoryKey: "design",
      icon: "pattern",
      color: "#9cbdd2",
      render: () => window.DesignArtTools.renderPatternTiles(),
      init: (root) => window.DesignArtTools.initPatternTiles(root, { showToast, copyGameText }),
    },
    fontpair: {
      title: "Font Playground",
      category: "Design & Art",
      categoryKey: "design",
      icon: "fontpair",
      color: "#efd39b",
      render: () => window.DesignArtTools.renderFontPlayground(),
      init: (root) => window.DesignArtTools.initFontPlayground(root, { showToast, copyGameText }),
    },
    stickermaker: {
      title: "Sticker Maker",
      category: "Design & Art",
      categoryKey: "design",
      icon: "stickermaker",
      color: "#f2c86f",
      render: () => window.DesignArtTools.renderStickerMaker(),
      init: (root) => window.DesignArtTools.initStickerMaker(root, { showToast, copyGameText }),
    },
  };

  const categories = {
    math: {
      homeCupboard: mathHomeCupboard,
      door: openMathCupboard,
      screen: gameWorld,
      title: "Math & Numbers — Bite Sized Utilities",
    },
    coding: {
      homeCupboard: codingHomeCupboard,
      door: openCodingCupboard,
      screen: codingWorld,
      title: "Coding & Developing — Bite Sized Utilities",
    },
    text: {
      homeCupboard: textHomeCupboard,
      door: openTextCupboard,
      screen: textWorld,
      title: "Text & Files — Bite Sized Utilities",
    },
    design: {
      homeCupboard: designHomeCupboard,
      door: openDesignCupboard,
      screen: designWorld,
      title: "Design & Art — Bite Sized Utilities",
    },
  };

  const SETTINGS_KEY = "bite-sized-utilities-settings-v1";
  const defaultSettings = {
    main: "#c98550",
    accent: "#efb94f",
    lowDetail: false,
  };
  let settingsState = { ...defaultSettings };
  let settingsReturnFocus = null;

  function validHex(value, fallback) {
    return /^#[0-9a-f]{6}$/i.test(String(value || "")) ? String(value).toLowerCase() : fallback;
  }

  function shadeHex(hex, amount) {
    const value = Number.parseInt(hex.slice(1), 16);
    const red = Math.max(0, Math.min(255, (value >> 16) + amount));
    const green = Math.max(0, Math.min(255, ((value >> 8) & 255) + amount));
    const blue = Math.max(0, Math.min(255, (value & 255) + amount));
    return `#${[red, green, blue].map((channel) => Math.round(channel).toString(16).padStart(2, "0")).join("")}`;
  }

  function saveSettings() {
    try {
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settingsState));
    } catch {
      // The game still works when storage is unavailable.
    }
  }

  function applySettings(nextSettings, persist = true) {
    settingsState = {
      main: validHex(nextSettings.main, defaultSettings.main),
      accent: validHex(nextSettings.accent, defaultSettings.accent),
      lowDetail: Boolean(nextSettings.lowDetail),
    };
    const page = document.documentElement;
    page.style.setProperty("--theme-main", settingsState.main);
    page.style.setProperty("--theme-main-dark", shadeHex(settingsState.main, -58));
    page.style.setProperty("--honey", settingsState.accent);
    page.style.setProperty("--honey-dark", shadeHex(settingsState.accent, -55));
    page.classList.toggle("low-detail", settingsState.lowDetail);
    mainColorInput.value = settingsState.main;
    accentColorInput.value = settingsState.accent;
    lowDetailToggle.setAttribute("aria-pressed", String(settingsState.lowDetail));
    lowDetailToggle.classList.toggle("active", settingsState.lowDetail);
    lowDetailToggle.querySelector("strong").textContent = settingsState.lowDetail ? "Potato mode: ON" : "Potato mode";
    document.querySelectorAll("[data-theme-preset]").forEach((button) => {
      const [main, accent] = button.dataset.themePreset.toLowerCase().split(",");
      button.classList.toggle("active", main === settingsState.main && accent === settingsState.accent);
    });
    if (persist) saveSettings();
  }

  function loadSettings() {
    try {
      const saved = JSON.parse(window.localStorage.getItem(SETTINGS_KEY) || "null");
      if (saved && typeof saved === "object") return { ...defaultSettings, ...saved };
    } catch {
      // Ignore broken or blocked storage and use cozy defaults.
    }
    return { ...defaultSettings };
  }

  function openSettings() {
    settingsReturnFocus = document.activeElement;
    settingsOverlay.classList.add("open");
    settingsOverlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("drawer-open");
    requestAnimationFrame(() => closeSettingsButton.focus({ preventScroll: true }));
  }

  function closeSettings() {
    if (!settingsOverlay.classList.contains("open")) return;
    settingsOverlay.classList.remove("open");
    settingsOverlay.setAttribute("aria-hidden", "true");
    if (!toolOverlay.classList.contains("open")) document.body.classList.remove("drawer-open");
    if (settingsReturnFocus && document.contains(settingsReturnFocus)) settingsReturnFocus.focus({ preventScroll: true });
  }

  applySettings(loadSettings(), false);
  openSettingsButton.addEventListener("click", openSettings);
  settingsCurtain.addEventListener("click", closeSettings);
  closeSettingsButton.addEventListener("click", closeSettings);
  mainColorInput.addEventListener("input", () => applySettings({ ...settingsState, main: mainColorInput.value }));
  accentColorInput.addEventListener("input", () => applySettings({ ...settingsState, accent: accentColorInput.value }));
  lowDetailToggle.addEventListener("click", () => applySettings({ ...settingsState, lowDetail: !settingsState.lowDetail }));
  resetSettingsButton.addEventListener("click", () => {
    applySettings(defaultSettings);
    showToast("Cozy defaults restored!");
  });
  document.querySelectorAll("[data-theme-preset]").forEach((button) => {
    button.addEventListener("click", () => {
      const [main, accent] = button.dataset.themePreset.split(",");
      applySettings({ ...settingsState, main, accent });
    });
  });

  function addCleanup(callback) {
    activeCleanup.push(callback);
  }

  function cleanActiveTool() {
    activeCleanup.forEach((callback) => {
      try {
        callback();
      } catch (error) {
        console.warn("Tool cleanup skipped", error);
      }
    });
    activeCleanup = [];
  }

  function openTool(toolKey, trigger) {
    const tool = tools[toolKey];
    if (!tool) return;

    window.clearTimeout(drawerClearTimer);
    cleanActiveTool();
    const toolToken = ++activeToolToken;
    lastFocusedElement = trigger || document.activeElement;
    activeCategoryKey = tool.categoryKey || "math";
    toolTitle.textContent = tool.title;
    toolCategory.textContent = tool.category || "Math & Numbers";
    toolHeadingIcon.innerHTML = iconMarkup(tool.icon);
    toolHeadingIcon.style.backgroundColor = tool.color;
    toolBody.innerHTML = tool.render();
    toolBody.scrollTop = 0;
    toolOverlay.classList.toggle("codehub-open", toolKey === "codehub");
    toolOverlay.classList.toggle(
      "workbench-open",
      tools[toolKey]?.categoryKey === "text" || tools[toolKey]?.categoryKey === "design"
    );

    toolOverlay.classList.add("open");
    toolOverlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("drawer-open");

    requestAnimationFrame(() => {
      if (toolToken !== activeToolToken || !toolOverlay.classList.contains("open")) return;
      tool.init(toolBody);
      closeToolButton.focus({ preventScroll: true });
    });
  }

  function closeTool() {
    if (!toolOverlay.classList.contains("open")) return;
    activeToolToken += 1;
    cleanActiveTool();
    toolOverlay.classList.remove("open");
    toolOverlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("drawer-open");
    drawerClearTimer = window.setTimeout(() => {
      toolBody.innerHTML = "";
      toolOverlay.classList.remove("codehub-open", "workbench-open");
    }, 500);
    if (lastFocusedElement && document.contains(lastFocusedElement)) {
      lastFocusedElement.focus({ preventScroll: true });
    }
  }

  function showToast(message) {
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("show");
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 1900);
  }

  function bounceCategoryMascot() {}

  function bounceHomeMascot() {}

  function bounceWall() {
    document.body.classList.remove("waffle-wall-bounce");
    void document.body.offsetWidth;
    document.body.classList.add("waffle-wall-bounce");
    window.setTimeout(() => document.body.classList.remove("waffle-wall-bounce"), 560);
  }

  function enterCategory(categoryKey) {
    const category = categories[categoryKey];
    if (!category || category.homeCupboard.classList.contains("open")) return;
    window.clearTimeout(screenTimer);
    category.homeCupboard.classList.add("open");
    category.door.setAttribute("aria-expanded", "true");

    screenTimer = window.setTimeout(() => {
      homeScreen.classList.add("screen-leaving");
      screenTimer = window.setTimeout(() => {
        homeScreen.hidden = true;
        homeScreen.classList.remove("screen-leaving");
        homeScreen.setAttribute("aria-hidden", "true");
        category.screen.hidden = false;
        category.screen.setAttribute("aria-hidden", "false");
        category.screen.classList.remove("screen-leaving");
        category.screen.classList.add("screen-arriving");
        activeCategoryKey = categoryKey;
        document.title = category.title;
        window.scrollTo({ top: 0, behavior: "auto" });
        window.setTimeout(() => category.screen.classList.remove("screen-arriving"), 520);
      }, 255);
    }, 680);
  }

  function returnHome() {
    const category = Object.values(categories).find((item) => !item.screen.hidden);
    if (!category) return;
    window.clearTimeout(screenTimer);
    closeTool();
    category.screen.classList.add("screen-leaving");
    screenTimer = window.setTimeout(() => {
      category.screen.hidden = true;
      category.screen.classList.remove("screen-leaving");
      category.screen.setAttribute("aria-hidden", "true");
      Object.values(categories).forEach((item) => {
        item.homeCupboard.classList.remove("open");
        item.door.setAttribute("aria-expanded", "false");
      });
      homeScreen.hidden = false;
      homeScreen.setAttribute("aria-hidden", "false");
      homeScreen.classList.remove("screen-leaving");
      document.title = "Bite Sized Utilities";
      activeCategoryKey = null;
      window.scrollTo({ top: 0, behavior: "auto" });
      requestAnimationFrame(() => category.door.focus({ preventScroll: true }));
    }, 255);
  }

  homeWall?.addEventListener("click", bounceWall);
  openMathCupboard?.addEventListener("click", () => enterCategory("math"));
  openCodingCupboard?.addEventListener("click", () => enterCategory("coding"));
  openTextCupboard?.addEventListener("click", () => enterCategory("text"));
  openDesignCupboard?.addEventListener("click", () => enterCategory("design"));
  backHomeButton?.addEventListener("click", returnHome);
  backHomeCodingButton?.addEventListener("click", returnHome);
  backHomeTextButton?.addEventListener("click", returnHome);
  backHomeDesignButton?.addEventListener("click", returnHome);

  document.addEventListener("click", (event) => {
    const cupboardEl = event.target.closest(".home-cupboard");
    if (cupboardEl && !homeScreen.hidden) {
      const map = {
        mathHomeCupboard: "math",
        codingHomeCupboard: "coding",
        textHomeCupboard: "text",
        designHomeCupboard: "design",
      };
      const catKey = map[cupboardEl.id];
      if (catKey) {
        event.preventDefault();
        enterCategory(catKey);
        return;
      }
    }
    const backBtn = event.target.closest(".back-home-button");
    if (backBtn) {
      event.preventDefault();
      returnHome();
      return;
    }
    const button = event.target.closest("[data-tool]");
    if (!button || !document.contains(button)) return;
    event.preventDefault();
    openTool(button.dataset.tool, button);
  });

  waffleBackdrop?.addEventListener("click", bounceWall);
  codingWaffleBackdrop?.addEventListener("click", bounceWall);
  textWaffleBackdrop?.addEventListener("click", bounceWall);
  designWaffleBackdrop?.addEventListener("click", bounceWall);
  closeToolButton?.addEventListener("click", closeTool);
  overlayCurtain?.addEventListener("click", closeTool);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (settingsOverlay.classList.contains("open")) {
        closeSettings();
      } else if (toolOverlay.classList.contains("open")) {
        closeTool();
      } else if (Object.values(categories).some((category) => !category.screen.hidden)) {
        returnHome();
      }
    }
  });

  /* Calculator */
  function renderCalculator() {
    const keys = [
      ["clear", "C", "action"],
      ["sign", "±", "action"],
      ["percent", "%", "action"],
      ["divide", "÷", "operator"],
      ["7", "7", ""],
      ["8", "8", ""],
      ["9", "9", ""],
      ["multiply", "×", "operator"],
      ["4", "4", ""],
      ["5", "5", ""],
      ["6", "6", ""],
      ["subtract", "−", "operator"],
      ["1", "1", ""],
      ["2", "2", ""],
      ["3", "3", ""],
      ["add", "+", "operator"],
      ["0", "0", "zero"],
      ["decimal", ".", ""],
      ["equals", "=", "equals"],
    ];

    return `
      <div class="tool-layout">
        <div class="calculator-shell" aria-label="Calculator keypad">
          <div class="calc-display" aria-live="polite">
            <span class="calc-expression" id="calcExpression">Ready</span>
            <output class="calc-value" id="calcValue">0</output>
          </div>
          <div class="calc-keypad">
            ${keys
              .map(
                ([key, label, type]) => `
                  <button class="calc-key ${type ? `calc-key-${type}` : ""}" data-calc-key="${key}">${label}</button>
                `,
              )
              .join("")}
          </div>
        </div>
      </div>
    `;
  }

  function initCalculator(root) {
    const display = root.querySelector("#calcValue");
    const expression = root.querySelector("#calcExpression");
    let current = "0";
    let stored = null;
    let operator = null;
    let waitingForOperand = false;

    const symbols = {
      add: "+",
      subtract: "−",
      multiply: "×",
      divide: "÷",
    };

    function formatNumber(value) {
      if (!Number.isFinite(value)) return "Error";
      const rounded = Number.parseFloat(value.toPrecision(12));
      const plain = String(rounded);
      return plain.length > 14 ? rounded.toExponential(7) : plain;
    }

    function calculate(a, b, operation) {
      if (operation === "add") return a + b;
      if (operation === "subtract") return a - b;
      if (operation === "multiply") return a * b;
      if (operation === "divide") return b === 0 ? Number.NaN : a / b;
      return b;
    }

    function updateDisplay() {
      display.textContent = current;
    }

    function clear() {
      current = "0";
      stored = null;
      operator = null;
      waitingForOperand = false;
      expression.textContent = "Ready";
      updateDisplay();
    }

    function inputDigit(digit) {
      if (current === "Error" || waitingForOperand) {
        current = digit;
        waitingForOperand = false;
      } else if (current === "0") {
        current = digit;
      } else if (current.replace(/[.-]/g, "").length < 12) {
        current += digit;
      }
      updateDisplay();
    }

    function inputDecimal() {
      if (current === "Error" || waitingForOperand) {
        current = "0.";
        waitingForOperand = false;
      } else if (!current.includes(".")) {
        current += ".";
      }
      updateDisplay();
    }

    function chooseOperator(nextOperator) {
      const value = Number(current);
      if (!Number.isFinite(value)) {
        clear();
        return;
      }
      if (operator && stored !== null && !waitingForOperand) {
        const result = calculate(stored, value, operator);
        current = formatNumber(result);
        stored = Number(current);
        if (current === "Error") {
          expression.textContent = "Try a different calculation";
          updateDisplay();
          return;
        }
      } else {
        stored = value;
      }
      operator = nextOperator;
      waitingForOperand = true;
      expression.textContent = `${current} ${symbols[nextOperator]}`;
      updateDisplay();
    }

    function equals() {
      if (!operator || stored === null || current === "Error") return;
      const second = Number(current);
      const first = stored;
      const result = calculate(first, second, operator);
      expression.textContent = `${formatNumber(first)} ${symbols[operator]} ${formatNumber(second)} =`;
      current = formatNumber(result);
      stored = null;
      operator = null;
      waitingForOperand = true;
      if (current === "Error") expression.textContent = "Division by zero needs a rethink";
      updateDisplay();
    }

    function handleKey(key) {
      if (/^\d$/.test(key)) inputDigit(key);
      else if (key === "decimal") inputDecimal();
      else if (["add", "subtract", "multiply", "divide"].includes(key)) chooseOperator(key);
      else if (key === "equals") equals();
      else if (key === "clear") clear();
      else if (key === "sign" && current !== "0" && current !== "Error") {
        current = current.startsWith("-") ? current.slice(1) : `-${current}`;
        updateDisplay();
      } else if (key === "percent" && current !== "Error") {
        current = formatNumber(Number(current) / 100);
        updateDisplay();
      }
    }

    root.querySelectorAll("[data-calc-key]").forEach((button) => {
      button.addEventListener("click", () => handleKey(button.dataset.calcKey));
    });

    const keyMap = {
      "+": "add",
      "-": "subtract",
      "*": "multiply",
      "/": "divide",
      Enter: "equals",
      "=": "equals",
      ".": "decimal",
      "%": "percent",
      Backspace: "backspace",
      Delete: "clear",
    };

    const keyboardHandler = (event) => {
      if (!toolOverlay.classList.contains("open") || toolTitle.textContent !== "Calculator") return;
      const mapped = /^\d$/.test(event.key) ? event.key : keyMap[event.key];
      if (!mapped) return;
      event.preventDefault();
      if (mapped === "backspace") {
        current = current.length > 1 ? current.slice(0, -1) : "0";
        updateDisplay();
      } else {
        handleKey(mapped);
      }
      const pressed = root.querySelector(`[data-calc-key="${mapped}"]`);
      if (pressed) {
        pressed.classList.add("pressed");
        window.setTimeout(() => pressed.classList.remove("pressed"), 100);
      }
    };
    document.addEventListener("keydown", keyboardHandler);
    addCleanup(() => document.removeEventListener("keydown", keyboardHandler));
  }

  /* Graphing calculator */
  function renderGraphingCalculator() {
    return `
      <div class="tool-layout">
        <div class="game-panel panel-teal graph-controls">
          <div class="segmented" role="tablist" aria-label="Graphing views">
            <button class="tab-button active" data-graph-view="graph" role="tab" aria-selected="true">Graph</button>
            <button class="tab-button" data-graph-view="table" role="tab" aria-selected="false">Table</button>
          </div>
          <div class="graph-input-row">
            <strong class="graph-y-label">y =</strong>
            <div class="field-stack">
              <label for="graphExpression">Equation</label>
              <input class="chunky-input" id="graphExpression" value="sin(x)" autocomplete="off" spellcheck="false" />
            </div>
            <button class="game-button game-button-coral" id="drawGraph">DRAW</button>
          </div>
          <div class="button-row" aria-label="Equation presets">
            <button class="game-button game-button-small" data-equation="sin(x)">sin(x)</button>
            <button class="game-button game-button-small" data-equation="x^2/4">x² ÷ 4</button>
            <button class="game-button game-button-small" data-equation="sqrt(abs(x))*2">√|x| × 2</button>
          </div>
          <p class="graph-error" id="graphError" role="status"></p>
          <div class="graph-toolbar">
            <span class="panel-note">Use + − * / ^ and sin, cos, tan, abs, sqrt, log.</span>
            <div class="zoom-control" aria-label="Graph zoom">
              <button class="zoom-button" id="zoomOut" aria-label="Zoom out">−</button>
              <span id="zoomLabel">±10</span>
              <button class="zoom-button" id="zoomIn" aria-label="Zoom in">+</button>
            </div>
          </div>
        </div>
        <div id="graphView">
          <div class="graph-board"><canvas id="graphCanvas" aria-label="Plot of y equals sin x"></canvas></div>
        </div>
        <div id="tableView" hidden>
          <div class="graph-table-wrap">
            <table class="graph-table">
              <thead><tr><th>x</th><th>y</th></tr></thead>
              <tbody id="graphTableBody"></tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  function compileMathExpression(source) {
    const tokens = [];
    const text = source.toLowerCase();
    let cursor = 0;

    while (cursor < text.length) {
      const rest = text.slice(cursor);
      const whitespace = rest.match(/^\s+/);
      if (whitespace) {
        cursor += whitespace[0].length;
        continue;
      }
      const number = rest.match(/^(?:\d+(?:\.\d*)?|\.\d+)/);
      if (number) {
        tokens.push({ type: "number", value: Number(number[0]) });
        cursor += number[0].length;
        continue;
      }
      const word = rest.match(/^[a-z]+/);
      if (word) {
        tokens.push({ type: "word", value: word[0] });
        cursor += word[0].length;
        continue;
      }
      const character = rest[0];
      if ("+-*/^()".includes(character)) {
        tokens.push({ type: character, value: character });
        cursor += 1;
        continue;
      }
      throw new Error(`I don't recognize “${character}” yet.`);
    }

    let position = 0;
    const peek = () => tokens[position];
    const take = (type) => {
      const token = tokens[position];
      if (!token || token.type !== type) throw new Error("That equation needs one more piece.");
      position += 1;
      return token;
    };

    function parseExpression() {
      let left = parseTerm();
      while (peek() && (peek().type === "+" || peek().type === "-")) {
        const operation = tokens[position++].type;
        const right = parseTerm();
        const previous = left;
        left = operation === "+" ? (x) => previous(x) + right(x) : (x) => previous(x) - right(x);
      }
      return left;
    }

    function parseTerm() {
      let left = parsePower();
      while (peek() && (peek().type === "*" || peek().type === "/")) {
        const operation = tokens[position++].type;
        const right = parsePower();
        const previous = left;
        left = operation === "*" ? (x) => previous(x) * right(x) : (x) => previous(x) / right(x);
      }
      return left;
    }

    function parsePower() {
      let left = parseUnary();
      if (peek() && peek().type === "^") {
        position += 1;
        const right = parsePower();
        const previous = left;
        left = (x) => Math.pow(previous(x), right(x));
      }
      return left;
    }

    function parseUnary() {
      if (peek() && peek().type === "+") {
        position += 1;
        return parseUnary();
      }
      if (peek() && peek().type === "-") {
        position += 1;
        const value = parseUnary();
        return (x) => -value(x);
      }
      return parsePrimary();
    }

    function parsePrimary() {
      const token = peek();
      if (!token) throw new Error("That equation ends a little too soon.");
      if (token.type === "number") {
        position += 1;
        return () => token.value;
      }
      if (token.type === "(") {
        position += 1;
        const inside = parseExpression();
        take(")");
        return inside;
      }
      if (token.type === "word") {
        position += 1;
        if (token.value === "x") return (x) => x;
        if (token.value === "pi") return () => Math.PI;
        if (token.value === "e") return () => Math.E;
        const functions = {
          sin: Math.sin,
          cos: Math.cos,
          tan: Math.tan,
          abs: Math.abs,
          sqrt: Math.sqrt,
          log: Math.log,
          exp: Math.exp,
        };
        const fn = functions[token.value];
        if (!fn) throw new Error(`“${token.value}” isn't in this graphing cupboard.`);
        take("(");
        const argument = parseExpression();
        take(")");
        return (x) => fn(argument(x));
      }
      throw new Error("Try adding a number or x right there.");
    }

    if (!tokens.length) throw new Error("Pop an equation into the box first.");
    const evaluator = parseExpression();
    if (position !== tokens.length) throw new Error("Check the order of that equation.");
    return evaluator;
  }

  function initGraphingCalculator(root) {
    const canvas = root.querySelector("#graphCanvas");
    const graphExpression = root.querySelector("#graphExpression");
    const graphError = root.querySelector("#graphError");
    const graphView = root.querySelector("#graphView");
    const tableView = root.querySelector("#tableView");
    const tableBody = root.querySelector("#graphTableBody");
    const zoomLabel = root.querySelector("#zoomLabel");
    let range = 10;
    let evaluator = compileMathExpression("sin(x)");

    function evaluate(value) {
      try {
        return evaluator(value);
      } catch {
        return Number.NaN;
      }
    }

    function niceStep() {
      if (range <= 5) return 1;
      if (range <= 12) return 2;
      if (range <= 25) return 5;
      return 10;
    }

    function draw() {
      const bounds = canvas.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(bounds.width * ratio);
      canvas.height = Math.round(bounds.height * ratio);
      const context = canvas.getContext("2d");
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const width = bounds.width;
      const height = bounds.height;
      context.clearRect(0, 0, width, height);
      context.fillStyle = "#fff3d7";
      context.fillRect(0, 0, width, height);

      const xToPixel = (x) => ((x + range) / (range * 2)) * width;
      const yToPixel = (y) => ((range - y) / (range * 2)) * height;
      const step = niceStep();

      context.lineWidth = 1.5;
      context.strokeStyle = "#d8b98c";
      for (let grid = -range; grid <= range + 0.001; grid += step) {
        context.beginPath();
        context.moveTo(xToPixel(grid), 0);
        context.lineTo(xToPixel(grid), height);
        context.stroke();
        context.beginPath();
        context.moveTo(0, yToPixel(grid));
        context.lineTo(width, yToPixel(grid));
        context.stroke();
      }

      context.lineWidth = 3;
      context.strokeStyle = "#60402e";
      context.beginPath();
      context.moveTo(xToPixel(0), 0);
      context.lineTo(xToPixel(0), height);
      context.moveTo(0, yToPixel(0));
      context.lineTo(width, yToPixel(0));
      context.stroke();

      context.fillStyle = "#76513c";
      context.font = "800 12px Trebuchet MS";
      context.fillText(String(range), width - 28, Math.min(height - 8, yToPixel(0) - 7));
      context.fillText(String(-range), 6, Math.min(height - 8, yToPixel(0) - 7));

      context.lineWidth = 5;
      context.lineCap = "round";
      context.lineJoin = "round";
      context.strokeStyle = "#c4564c";
      context.beginPath();
      let drawing = false;
      let lastY = null;
      for (let pixel = 0; pixel <= width; pixel += 1.5) {
        const x = (pixel / width) * range * 2 - range;
        const y = evaluate(x);
        const py = yToPixel(y);
        const valid = Number.isFinite(y) && py > -height * 2 && py < height * 3;
        const jumps = lastY !== null && Math.abs(py - lastY) > height * 0.72;
        if (!valid || jumps) {
          drawing = false;
          lastY = valid ? py : null;
          continue;
        }
        if (!drawing) {
          context.moveTo(pixel, py);
          drawing = true;
        } else {
          context.lineTo(pixel, py);
        }
        lastY = py;
      }
      context.stroke();
      updateTable();
    }

    function updateTable() {
      tableBody.innerHTML = "";
      [-3, -2, -1, 0, 1, 2, 3].forEach((x) => {
        const y = evaluate(x);
        const row = document.createElement("tr");
        const xCell = document.createElement("td");
        const yCell = document.createElement("td");
        xCell.textContent = String(x);
        yCell.textContent = Number.isFinite(y) ? String(Number(y.toFixed(5))) : "—";
        row.append(xCell, yCell);
        tableBody.append(row);
      });
    }

    function useExpression(value) {
      try {
        evaluator = compileMathExpression(value);
        graphError.textContent = "";
        canvas.setAttribute("aria-label", `Plot of y equals ${value}`);
        draw();
      } catch (error) {
        graphError.textContent = error.message;
      }
    }

    root.querySelector("#drawGraph").addEventListener("click", () => useExpression(graphExpression.value));
    graphExpression.addEventListener("keydown", (event) => {
      if (event.key === "Enter") useExpression(graphExpression.value);
    });
    root.querySelectorAll("[data-equation]").forEach((button) => {
      button.addEventListener("click", () => {
        graphExpression.value = button.dataset.equation;
        useExpression(button.dataset.equation);
      });
    });
    root.querySelector("#zoomIn").addEventListener("click", () => {
      range = Math.max(3, Math.round(range * 0.7));
      zoomLabel.textContent = `±${range}`;
      draw();
    });
    root.querySelector("#zoomOut").addEventListener("click", () => {
      range = Math.min(50, Math.round(range * 1.45));
      zoomLabel.textContent = `±${range}`;
      draw();
    });
    root.querySelectorAll("[data-graph-view]").forEach((button) => {
      button.addEventListener("click", () => {
        root.querySelectorAll("[data-graph-view]").forEach((tab) => {
          const active = tab === button;
          tab.classList.toggle("active", active);
          tab.setAttribute("aria-selected", String(active));
        });
        const showingGraph = button.dataset.graphView === "graph";
        graphView.hidden = !showingGraph;
        tableView.hidden = showingGraph;
        if (showingGraph) requestAnimationFrame(draw);
      });
    });

    const observer = new ResizeObserver(() => {
      if (!graphView.hidden) draw();
    });
    observer.observe(canvas);
    addCleanup(() => observer.disconnect());
    requestAnimationFrame(draw);
  }

  /* Bodily calculator */
  function renderBodyCalculator() {
    return `
      <div class="tool-layout">
        <div class="game-panel panel-sage">
          <div class="segmented" role="tablist" aria-label="Body calculation">
            <button class="tab-button active" data-body-mode="bmi" aria-selected="true">BMI</button>
            <button class="tab-button" data-body-mode="bmr" aria-selected="false">Daily Energy</button>
          </div>
        </div>
        <div class="body-board">
          <div class="game-panel panel-sage body-sliders">
            <div class="slider-row">
              <div class="slider-heading"><label for="heightRange">Height</label><output class="slider-bubble" id="heightValue">170 cm</output></div>
              <input class="game-range" id="heightRange" type="range" min="120" max="220" value="170" />
            </div>
            <div class="slider-row">
              <div class="slider-heading"><label for="weightRange">Weight</label><output class="slider-bubble" id="weightValue">70 kg</output></div>
              <input class="game-range" id="weightRange" type="range" min="35" max="180" value="70" />
            </div>
            <div class="slider-row" id="ageRow" hidden>
              <div class="slider-heading"><label for="ageRange">Age</label><output class="slider-bubble" id="ageValue">30 years</output></div>
              <input class="game-range" id="ageRange" type="range" min="12" max="90" value="30" />
            </div>
            <div id="bodyProfile" hidden>
              <span class="field-title">Profile</span>
              <div class="segmented">
                <button class="tab-button active" data-profile="female" aria-selected="true">Female</button>
                <button class="tab-button" data-profile="male" aria-selected="false">Male</button>
              </div>
            </div>
          </div>
          <div class="result-card body-result" id="bodyResult" aria-live="polite">
            <span class="result-kicker" id="bodyResultLabel">Body mass index</span>
            <strong class="result-big" id="bodyResultValue">24.2</strong>
            <span class="result-detail" id="bodyResultDetail">In the common healthy range</span>
            <div class="bmi-scale" id="bmiScale" aria-hidden="true">
              <span class="bmi-segment"></span><span class="bmi-segment active"></span><span class="bmi-segment"></span><span class="bmi-segment"></span>
            </div>
          </div>
        </div>
        <p class="panel-note">Friendly estimates only — bodies are wonderfully individual.</p>
      </div>
    `;
  }

  function initBodyCalculator(root) {
    const height = root.querySelector("#heightRange");
    const weight = root.querySelector("#weightRange");
    const age = root.querySelector("#ageRange");
    const ageRow = root.querySelector("#ageRow");
    const profile = root.querySelector("#bodyProfile");
    const resultLabel = root.querySelector("#bodyResultLabel");
    const resultValue = root.querySelector("#bodyResultValue");
    const resultDetail = root.querySelector("#bodyResultDetail");
    const bmiScale = root.querySelector("#bmiScale");
    let mode = "bmi";
    let sex = "female";

    function update() {
      const h = Number(height.value);
      const w = Number(weight.value);
      const years = Number(age.value);
      root.querySelector("#heightValue").textContent = `${h} cm`;
      root.querySelector("#weightValue").textContent = `${w} kg`;
      root.querySelector("#ageValue").textContent = `${years} years`;

      if (mode === "bmi") {
        const bmi = w / Math.pow(h / 100, 2);
        const groups = [
          { max: 18.5, text: "Below the common healthy range", index: 0 },
          { max: 25, text: "In the common healthy range", index: 1 },
          { max: 30, text: "Above the common healthy range", index: 2 },
          { max: Infinity, text: "Well above the common healthy range", index: 3 },
        ];
        const group = groups.find((item) => bmi < item.max);
        resultLabel.textContent = "Body mass index";
        resultValue.textContent = bmi.toFixed(1);
        resultDetail.textContent = group.text;
        bmiScale.hidden = false;
        bmiScale.querySelectorAll(".bmi-segment").forEach((segment, index) => segment.classList.toggle("active", index === group.index));
      } else {
        const bmr = sex === "male" ? 10 * w + 6.25 * h - 5 * years + 5 : 10 * w + 6.25 * h - 5 * years - 161;
        resultLabel.textContent = "Estimated daily resting energy";
        resultValue.textContent = `${Math.max(0, Math.round(bmr)).toLocaleString()}`;
        resultDetail.textContent = "kilocalories per day at rest";
        bmiScale.hidden = true;
      }
    }

    [height, weight, age].forEach((slider) => slider.addEventListener("input", update));
    root.querySelectorAll("[data-body-mode]").forEach((button) => {
      button.addEventListener("click", () => {
        mode = button.dataset.bodyMode;
        root.querySelectorAll("[data-body-mode]").forEach((tab) => {
          const active = tab === button;
          tab.classList.toggle("active", active);
          tab.setAttribute("aria-selected", String(active));
        });
        const bmrMode = mode === "bmr";
        ageRow.hidden = !bmrMode;
        profile.hidden = !bmrMode;
        update();
      });
    });
    root.querySelectorAll("[data-profile]").forEach((button) => {
      button.addEventListener("click", () => {
        sex = button.dataset.profile;
        root.querySelectorAll("[data-profile]").forEach((tab) => {
          const active = tab === button;
          tab.classList.toggle("active", active);
          tab.setAttribute("aria-selected", String(active));
        });
        update();
      });
    });
    update();
  }

  /* Fraction calculator */
  function renderFractionCalculator() {
    return `
      <div class="tool-layout fraction-workbench">
        <div class="game-panel panel-lilac">
          <div class="fraction-equation">
            <div class="fraction-stack">
              <label class="control-label" for="fractionANum">Fraction A</label>
              <input id="fractionANum" type="number" value="3" aria-label="First numerator" />
              <span class="fraction-line"></span>
              <input id="fractionADen" type="number" value="4" aria-label="First denominator" />
            </div>
            <span class="fraction-op" id="fractionOperator" aria-hidden="true">+</span>
            <div class="fraction-stack">
              <label class="control-label" for="fractionBNum">Fraction B</label>
              <input id="fractionBNum" type="number" value="2" aria-label="Second numerator" />
              <span class="fraction-line"></span>
              <input id="fractionBDen" type="number" value="5" aria-label="Second denominator" />
            </div>
          </div>
          <div class="segmented fraction-ops" style="margin-top: 17px" aria-label="Fraction operation">
            <button class="tab-button active" data-fraction-op="add" aria-selected="true">+</button>
            <button class="tab-button" data-fraction-op="subtract" aria-selected="false">−</button>
            <button class="tab-button" data-fraction-op="multiply" aria-selected="false">×</button>
            <button class="tab-button" data-fraction-op="divide" aria-selected="false">÷</button>
          </div>
        </div>
        <div class="result-card" aria-live="polite">
          <span class="result-kicker">Simplified answer</span>
          <span class="fraction-result-stack" id="fractionResult">
            <strong id="fractionResultNum">23</strong><span class="fraction-line"></span><strong id="fractionResultDen">20</strong>
          </span>
          <span class="result-detail" id="fractionDecimal">1.15</span>
        </div>
      </div>
    `;
  }

  function initFractionCalculator(root) {
    const fields = ["fractionANum", "fractionADen", "fractionBNum", "fractionBDen"].map((id) => root.querySelector(`#${id}`));
    const resultNum = root.querySelector("#fractionResultNum");
    const resultDen = root.querySelector("#fractionResultDen");
    const decimal = root.querySelector("#fractionDecimal");
    const opBadge = root.querySelector("#fractionOperator");
    let operation = "add";
    const symbols = { add: "+", subtract: "−", multiply: "×", divide: "÷" };

    function gcd(a, b) {
      a = a < 0n ? -a : a;
      b = b < 0n ? -b : b;
      while (b !== 0n) [a, b] = [b, a % b];
      return a || 1n;
    }

    function update() {
      try {
        const [a, b, c, d] = fields.map((field) => BigInt(field.value || "0"));
        if (b === 0n || d === 0n) throw new Error("Denominators need to be different from zero.");
        let numerator;
        let denominator;
        if (operation === "add") [numerator, denominator] = [a * d + c * b, b * d];
        if (operation === "subtract") [numerator, denominator] = [a * d - c * b, b * d];
        if (operation === "multiply") [numerator, denominator] = [a * c, b * d];
        if (operation === "divide") {
          if (c === 0n) throw new Error("A fraction with zero on top cannot be a divisor.");
          [numerator, denominator] = [a * d, b * c];
        }
        if (denominator < 0n) {
          numerator = -numerator;
          denominator = -denominator;
        }
        const divisor = gcd(numerator, denominator);
        numerator /= divisor;
        denominator /= divisor;
        resultNum.textContent = numerator.toString();
        resultDen.textContent = denominator.toString();
        const approximate = Number(numerator) / Number(denominator);
        decimal.textContent = Number.isFinite(approximate) ? `Decimal: ${Number(approximate.toFixed(8))}` : "Exact fraction shown";
      } catch (error) {
        resultNum.textContent = "?";
        resultDen.textContent = "?";
        decimal.textContent = error.message || "Use whole numbers in every box.";
      }
    }

    fields.forEach((field) => field.addEventListener("input", update));
    root.querySelectorAll("[data-fraction-op]").forEach((button) => {
      button.addEventListener("click", () => {
        operation = button.dataset.fractionOp;
        opBadge.textContent = symbols[operation];
        root.querySelectorAll("[data-fraction-op]").forEach((tab) => {
          const active = tab === button;
          tab.classList.toggle("active", active);
          tab.setAttribute("aria-selected", String(active));
        });
        update();
      });
    });
    update();
  }

  /* Percentage calculator */
  function renderPercentageCalculator() {
    return `
      <div class="tool-layout">
        <div class="game-panel">
          <div class="percent-illustration">
            ${iconMarkup("percent")}
            <div>
              <h3>Pick a percentage recipe</h3>
              <p class="panel-note">Big discounts, small changes, and every percent in between.</p>
            </div>
          </div>
          <div class="segmented" style="margin-top: 15px" role="tablist">
            <button class="tab-button active" data-percent-mode="of" aria-selected="true">% of a number</button>
            <button class="tab-button" data-percent-mode="discount" aria-selected="false">Discount</button>
            <button class="tab-button" data-percent-mode="change" aria-selected="false">% change</button>
          </div>
        </div>
        <div class="game-panel panel-coral percent-fields" id="percentFields"></div>
        <div class="result-card" aria-live="polite">
          <span class="result-kicker" id="percentResultLabel">15% of 80</span>
          <strong class="result-big" id="percentResult">12</strong>
          <span class="result-detail" id="percentResultDetail">That is the percent-sized piece.</span>
        </div>
      </div>
    `;
  }

  function initPercentageCalculator(root) {
    const fieldsPanel = root.querySelector("#percentFields");
    const result = root.querySelector("#percentResult");
    const label = root.querySelector("#percentResultLabel");
    const detail = root.querySelector("#percentResultDetail");
    let mode = "of";

    const modeFields = {
      of: `
        <div class="field-stack"><label for="percentAmount">Percentage</label><input class="chunky-input" id="percentAmount" type="number" value="15" /></div>
        <div class="field-stack"><label for="percentWhole">Whole number</label><input class="chunky-input" id="percentWhole" type="number" value="80" /></div>
        <button class="game-button" id="percentCalculate">FIND THE PIECE</button>
      `,
      discount: `
        <div class="field-stack"><label for="percentPrice">Original price</label><input class="chunky-input" id="percentPrice" type="number" value="120" min="0" /></div>
        <div class="field-stack"><label for="percentDiscount">Discount percentage</label><input class="chunky-input" id="percentDiscount" type="number" value="25" /></div>
        <button class="game-button" id="percentCalculate">APPLY DISCOUNT</button>
      `,
      change: `
        <div class="field-stack"><label for="percentFrom">Starting number</label><input class="chunky-input" id="percentFrom" type="number" value="80" /></div>
        <div class="field-stack"><label for="percentTo">New number</label><input class="chunky-input" id="percentTo" type="number" value="100" /></div>
        <button class="game-button" id="percentCalculate">MEASURE CHANGE</button>
      `,
    };

    const tidy = (value) => (Number.isFinite(value) ? String(Number(value.toFixed(6))) : "—");

    function calculate() {
      if (mode === "of") {
        const percent = Number(root.querySelector("#percentAmount").value);
        const whole = Number(root.querySelector("#percentWhole").value);
        result.textContent = tidy((percent / 100) * whole);
        label.textContent = `${tidy(percent)}% of ${tidy(whole)}`;
        detail.textContent = "That is the percent-sized piece.";
      } else if (mode === "discount") {
        const price = Number(root.querySelector("#percentPrice").value);
        const percent = Number(root.querySelector("#percentDiscount").value);
        const saved = (price * percent) / 100;
        result.textContent = tidy(price - saved);
        label.textContent = "Price after discount";
        detail.textContent = `You save ${tidy(saved)} (${tidy(percent)}%).`;
      } else {
        const from = Number(root.querySelector("#percentFrom").value);
        const to = Number(root.querySelector("#percentTo").value);
        if (from === 0) {
          result.textContent = "—";
          label.textContent = "Starting at zero";
          detail.textContent = "Percent change needs a non-zero starting number.";
          return;
        }
        const change = ((to - from) / Math.abs(from)) * 100;
        result.textContent = `${tidy(Math.abs(change))}%`;
        label.textContent = change >= 0 ? "Percentage increase" : "Percentage decrease";
        detail.textContent = `From ${tidy(from)} to ${tidy(to)}.`;
      }
    }

    function drawFields() {
      fieldsPanel.innerHTML = modeFields[mode];
      fieldsPanel.querySelectorAll("input").forEach((input) => input.addEventListener("input", calculate));
      fieldsPanel.querySelector("#percentCalculate").addEventListener("click", calculate);
      calculate();
    }

    root.querySelectorAll("[data-percent-mode]").forEach((button) => {
      button.addEventListener("click", () => {
        mode = button.dataset.percentMode;
        root.querySelectorAll("[data-percent-mode]").forEach((tab) => {
          const active = tab === button;
          tab.classList.toggle("active", active);
          tab.setAttribute("aria-selected", String(active));
        });
        drawFields();
      });
    });
    drawFields();
  }

  /* Dice roller */
  function renderDiceRoller() {
    return `
      <div class="tool-layout dice-layout">
        <div class="game-panel panel-coral dice-stage">
          <div>
            <div class="die-object" id="dieObject" aria-live="polite"><strong class="die-label" id="dieLabel">1</strong></div>
            <button class="game-button" id="rollDice" style="width: 100%; margin-top: 23px">ROLL THE DICE</button>
          </div>
        </div>
        <div class="game-panel panel-teal">
          <h3>Custom faces</h3>
          <div class="face-count-control">
            <button class="step-button" id="removeFace" aria-label="Remove a face">−</button>
            <strong class="face-count"><span id="faceCount">6</span> faces</strong>
            <button class="step-button" id="addFace" aria-label="Add a face">+</button>
          </div>
          <div class="dice-face-editor" id="diceFaceEditor"></div>
          <p class="panel-note">Give every face a number, word, name, or tiny decision.</p>
        </div>
      </div>
    `;
  }

  function initDiceRoller(root) {
    const editor = root.querySelector("#diceFaceEditor");
    const faceCount = root.querySelector("#faceCount");
    const die = root.querySelector("#dieObject");
    const dieLabel = root.querySelector("#dieLabel");
    const rollButton = root.querySelector("#rollDice");
    let faces = ["1", "2", "3", "4", "5", "6"];
    let rollTimer = null;

    function drawEditor() {
      editor.innerHTML = "";
      faces.forEach((face, index) => {
        const label = document.createElement("label");
        label.className = "face-field";
        const number = document.createElement("span");
        number.textContent = String(index + 1);
        const input = document.createElement("input");
        input.value = face;
        input.maxLength = 18;
        input.setAttribute("aria-label", `Face ${index + 1}`);
        input.addEventListener("input", () => {
          faces[index] = input.value || String(index + 1);
        });
        label.append(number, input);
        editor.append(label);
      });
      faceCount.textContent = String(faces.length);
    }

    function randomIndex(max) {
      if (window.crypto && window.crypto.getRandomValues) {
        const value = new Uint32Array(1);
        window.crypto.getRandomValues(value);
        return value[0] % max;
      }
      return Math.floor(Math.random() * max);
    }

    function roll() {
      window.clearTimeout(rollTimer);
      die.classList.remove("rolling");
      void die.offsetWidth;
      die.classList.add("rolling");
      rollButton.disabled = true;
      const flutter = window.setInterval(() => {
        dieLabel.textContent = faces[randomIndex(faces.length)] || "?";
      }, 70);
      rollTimer = window.setTimeout(() => {
        window.clearInterval(flutter);
        const chosen = faces[randomIndex(faces.length)] || "?";
        dieLabel.textContent = chosen;
        die.classList.remove("rolling");
        rollButton.disabled = false;
        showToast(`The dice picked ${chosen}!`);
      }, 640);
      addCleanup(() => window.clearInterval(flutter));
    }

    root.querySelector("#addFace").addEventListener("click", () => {
      if (faces.length >= 20) {
        showToast("Twenty chunky faces fit on this dice.");
        return;
      }
      faces.push(String(faces.length + 1));
      drawEditor();
    });
    root.querySelector("#removeFace").addEventListener("click", () => {
      if (faces.length <= 2) {
        showToast("A dice needs at least two faces.");
        return;
      }
      faces.pop();
      drawEditor();
    });
    rollButton.addEventListener("click", roll);
    addCleanup(() => window.clearTimeout(rollTimer));
    drawEditor();
  }

  /* Roman numeral calculator */
  function renderRomanCalculator() {
    return `
      <div class="tool-layout">
        <div class="roman-parchment">
          <div class="segmented" role="tablist" aria-label="Roman numeral conversion direction">
            <button class="tab-button active" data-roman-mode="toRoman" aria-selected="true">Number → Roman</button>
            <button class="tab-button" data-roman-mode="toNumber" aria-selected="false">Roman → Number</button>
          </div>

          <div class="vinculum-control">
            <div>
              <strong>Vinculum notation</strong>
              <span>Overlines unlock numbers above 3,999</span>
            </div>
            <button class="vinculum-toggle" id="vinculumToggle" aria-pressed="false">
              <span class="toggle-track" aria-hidden="true"><span></span></span>
              <strong>OFF</strong>
            </button>
          </div>

          <div class="roman-converter-panel" id="romanNumberPanel">
            <div class="field-stack">
              <label for="romanNumberInput">Whole number</label>
              <input class="chunky-input" id="romanNumberInput" type="number" min="1" max="3999999" value="2026" inputmode="numeric" />
            </div>
          </div>

          <div class="roman-converter-panel" id="romanTextPanel" hidden>
            <div class="field-stack">
              <label for="romanTextInput">Roman numeral</label>
              <input class="chunky-input roman-entry" id="romanTextInput" value="MMXXVI" autocomplete="off" spellcheck="false" autocapitalize="characters" />
            </div>
            <div class="vinculum-keypad" id="vinculumKeypad" hidden>
              <span>Tap to add an overlined numeral</span>
              <div>
                ${["I", "V", "X", "L", "C", "D", "M"].map((letter) => `<button data-vinculum-letter="${letter}" aria-label="Insert overlined ${letter}"><span class="vinculum">${letter}</span></button>`).join("")}
              </div>
            </div>
          </div>

          <button class="game-button roman-convert-button" id="romanConvert">CONVERT</button>

          <div class="roman-display" aria-live="polite">
            <span class="result-kicker" id="romanResultLabel">Roman numeral</span>
            <strong class="roman-number" id="romanResult">MMXXVI</strong>
            <span class="result-detail" id="romanMessage">Classic notation, with vinculums switched off.</span>
          </div>
        </div>
      </div>
    `;
  }

  function romanUnder4000(number) {
    if (number === 0) return "";
    const values = [
      [1000, "M"],
      [900, "CM"],
      [500, "D"],
      [400, "CD"],
      [100, "C"],
      [90, "XC"],
      [50, "L"],
      [40, "XL"],
      [10, "X"],
      [9, "IX"],
      [5, "V"],
      [4, "IV"],
      [1, "I"],
    ];
    let remaining = number;
    let result = "";
    values.forEach(([value, numeral]) => {
      while (remaining >= value) {
        result += numeral;
        remaining -= value;
      }
    });
    return result;
  }

  function romanText(number, useVinculum) {
    if (number < 1) return "";
    if (number <= 3999) return romanUnder4000(number);
    if (!useVinculum) return "";
    const high = romanUnder4000(Math.floor(number / 1000));
    const overlined = [...high].map((letter) => `${letter}\u0305`).join("");
    return `${overlined}${romanUnder4000(number % 1000)}`;
  }

  function romanMarkup(number, useVinculum) {
    if (number <= 3999) return romanUnder4000(number);
    if (!useVinculum) return "";
    const high = romanUnder4000(Math.floor(number / 1000));
    const low = romanUnder4000(number % 1000);
    return `<span class="vinculum">${high}</span>${low}`;
  }

  function parseRomanNumeral(raw, allowVinculum) {
    const text = String(raw || "").normalize("NFD").toUpperCase().replace(/\s+/g, "");
    if (!text) throw new Error("Enter a Roman numeral first.");
    if (!/^(?:[IVXLCDM]\u0305?)+$/u.test(text)) throw new Error("Use only I, V, X, L, C, D, M, and optional overlines.");
    if (!allowVinculum && text.includes("\u0305")) throw new Error("Switch vinculums on to read overlined numerals.");

    const baseValues = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
    const tokens = [];
    for (let index = 0; index < text.length; index += 1) {
      const letter = text[index];
      let value = baseValues[letter];
      if (text[index + 1] === "\u0305") {
        value *= 1000;
        index += 1;
      }
      tokens.push(value);
    }

    let total = 0;
    tokens.forEach((value, index) => {
      total += value < (tokens[index + 1] || 0) ? -value : value;
    });
    if (total < 1 || total > 3999999) throw new Error("Roman numerals on this parchment range from 1 to 3,999,999.");
    const canonical = romanText(total, allowVinculum);
    if (canonical !== text) throw new Error(`Try the standard form: ${canonical || "turn vinculums on"}.`);
    return total;
  }

  function initRomanCalculator(root) {
    const numberPanel = root.querySelector("#romanNumberPanel");
    const textPanel = root.querySelector("#romanTextPanel");
    const numberInput = root.querySelector("#romanNumberInput");
    const textInput = root.querySelector("#romanTextInput");
    const toggle = root.querySelector("#vinculumToggle");
    const keypad = root.querySelector("#vinculumKeypad");
    const result = root.querySelector("#romanResult");
    const resultLabel = root.querySelector("#romanResultLabel");
    const message = root.querySelector("#romanMessage");
    let mode = "toRoman";
    let vinculums = false;

    function showError(error) {
      result.textContent = "?";
      resultLabel.textContent = "Check the parchment";
      message.textContent = error.message || String(error);
    }

    function convert() {
      try {
        if (mode === "toRoman") {
          const number = Number(numberInput.value);
          if (!Number.isSafeInteger(number) || number < 1) throw new Error("Enter a positive whole number.");
          if (number > 3999999) throw new Error("The largest supported number is 3,999,999.");
          if (number > 3999 && !vinculums) throw new Error("Switch vinculums on for numbers above 3,999.");
          result.innerHTML = romanMarkup(number, vinculums);
          result.setAttribute("aria-label", `Roman numeral for ${number}`);
          resultLabel.textContent = "Roman numeral";
          message.textContent = number > 3999 ? "The overlined part is multiplied by 1,000." : "Classic notation, with vinculums switched off.";
        } else {
          const number = parseRomanNumeral(textInput.value, vinculums);
          result.textContent = number.toLocaleString("en-US");
          result.setAttribute("aria-label", `${textInput.value} equals ${number}`);
          resultLabel.textContent = "Whole number";
          message.textContent = textInput.value.includes("\u0305") ? "Overlined symbols were multiplied by 1,000." : "Roman numeral converted to a number.";
        }
      } catch (error) {
        showError(error);
      }
    }

    function updateMode(nextMode) {
      mode = nextMode;
      root.querySelectorAll("[data-roman-mode]").forEach((button) => {
        const active = button.dataset.romanMode === mode;
        button.classList.toggle("active", active);
        button.setAttribute("aria-selected", String(active));
      });
      numberPanel.hidden = mode !== "toRoman";
      textPanel.hidden = mode !== "toNumber";
      keypad.hidden = mode !== "toNumber" || !vinculums;
      convert();
    }

    root.querySelectorAll("[data-roman-mode]").forEach((button) => {
      button.addEventListener("click", () => updateMode(button.dataset.romanMode));
    });
    toggle.addEventListener("click", () => {
      vinculums = !vinculums;
      toggle.classList.toggle("active", vinculums);
      toggle.setAttribute("aria-pressed", String(vinculums));
      toggle.querySelector("strong").textContent = vinculums ? "ON" : "OFF";
      keypad.hidden = mode !== "toNumber" || !vinculums;
      convert();
    });
    root.querySelectorAll("[data-vinculum-letter]").forEach((button) => {
      button.addEventListener("click", () => {
        const token = `${button.dataset.vinculumLetter}\u0305`;
        const start = textInput.selectionStart ?? textInput.value.length;
        const end = textInput.selectionEnd ?? start;
        textInput.setRangeText(token, start, end, "end");
        textInput.focus();
        convert();
      });
    });
    root.querySelector("#romanConvert").addEventListener("click", convert);
    numberInput.addEventListener("input", convert);
    textInput.addEventListener("input", convert);
    [numberInput, textInput].forEach((input) => {
      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") convert();
      });
    });
    updateMode("toRoman");
  }

  /* Number base converter */
  function renderBaseConverter() {
    return `
      <div class="tool-layout">
        <div class="game-panel panel-coral">
          <span class="field-title">The input is written in</span>
          <div class="segmented base-selector" aria-label="Input number base">
            <button class="tab-button" data-source-base="2">Binary</button>
            <button class="tab-button" data-source-base="8">Octal</button>
            <button class="tab-button" data-source-base="10">Decimal</button>
            <button class="tab-button active" data-source-base="16" aria-selected="true">Hex</button>
            <button class="tab-button" data-source-base="36">Base-36</button>
          </div>
          <div class="field-stack" style="margin-top: 16px">
            <label for="baseInput">Number</label>
            <input class="chunky-input" id="baseInput" value="FF" maxlength="256" autocomplete="off" spellcheck="false" />
          </div>
          <p class="graph-error" id="baseError" role="status"></p>
        </div>
        <div class="base-outputs" id="baseOutputs" aria-live="polite">
          ${[
            [2, "Binary"],
            [8, "Octal"],
            [10, "Decimal"],
            [16, "Hexadecimal"],
            [36, "Base-36"],
          ]
            .map(
              ([base, name]) => `
                <button class="base-output" data-output-base="${base}" aria-label="Use ${name} result as the input">
                  <span class="base-output-label">${name} · base ${base}</span>
                  <strong class="base-output-value" id="baseOutput${base}">—</strong>
                </button>
              `,
            )
            .join("")}
        </div>
        <p class="panel-note">Tap any result card to make it the new input.</p>
      </div>
    `;
  }

  function parseBigIntInBase(raw, base) {
    const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let text = raw.trim().toUpperCase();
    if (!text) throw new Error("Give this converter a number to carry.");
    let negative = false;
    if (text.startsWith("-")) {
      negative = true;
      text = text.slice(1);
    }
    if (!text) throw new Error("A minus sign needs a number beside it.");
    let value = 0n;
    for (const character of text) {
      const digit = alphabet.indexOf(character);
      if (digit < 0 || digit >= base) throw new Error(`“${character}” is not a base-${base} digit.`);
      value = value * BigInt(base) + BigInt(digit);
    }
    return negative ? -value : value;
  }

  function initBaseConverter(root) {
    const input = root.querySelector("#baseInput");
    const error = root.querySelector("#baseError");
    const bases = [2, 8, 10, 16, 36];
    let sourceBase = 16;

    function update() {
      try {
        const value = parseBigIntInBase(input.value, sourceBase);
        error.textContent = "";
        bases.forEach((base) => {
          root.querySelector(`#baseOutput${base}`).textContent = value.toString(base).toUpperCase();
        });
      } catch (caught) {
        error.textContent = caught.message;
        bases.forEach((base) => {
          root.querySelector(`#baseOutput${base}`).textContent = "—";
        });
      }
    }

    root.querySelectorAll("[data-source-base]").forEach((button) => {
      button.addEventListener("click", () => {
        let value = null;
        try {
          value = parseBigIntInBase(input.value, sourceBase);
        } catch {
          value = null;
        }
        sourceBase = Number(button.dataset.sourceBase);
        root.querySelectorAll("[data-source-base]").forEach((tab) => {
          const active = tab === button;
          tab.classList.toggle("active", active);
          tab.setAttribute("aria-selected", String(active));
        });
        if (value !== null) input.value = value.toString(sourceBase).toUpperCase();
        update();
      });
    });
    root.querySelectorAll("[data-output-base]").forEach((button) => {
      button.addEventListener("click", () => {
        const nextBase = Number(button.dataset.outputBase);
        const value = button.querySelector(".base-output-value").textContent;
        if (value === "—") return;
        sourceBase = nextBase;
        input.value = value;
        root.querySelectorAll("[data-source-base]").forEach((tab) => {
          const active = Number(tab.dataset.sourceBase) === sourceBase;
          tab.classList.toggle("active", active);
          tab.setAttribute("aria-selected", String(active));
        });
        update();
        showToast(`Now reading base ${sourceBase}.`);
      });
    });
    input.addEventListener("input", update);
    update();
  }

  /* Prime checker */
  function renderPrimeChecker() {
    return `
      <div class="tool-layout prime-stage">
        <div class="game-panel panel-teal" style="width: min(100%, 570px)">
          <div class="field-stack">
            <label for="primeInput">Whole number</label>
            <input class="chunky-input" id="primeInput" inputmode="numeric" value="97" maxlength="20" />
          </div>
          <button class="game-button game-button-coral" id="checkPrime" style="width: 100%; margin-top: 14px">CHECK THIS NUMBER</button>
          <p class="panel-note">Checks whole numbers through 18,446,744,073,709,551,615.</p>
        </div>
        <div class="number-card" id="numberCard" aria-live="polite">
          <div>
            <strong class="prime-number" id="primeNumber">97</strong>
            <span class="prime-face" id="primeFace">•ᴗ•</span>
            <div class="prime-message" id="primeMessage">Ready for a prime check!</div>
          </div>
        </div>
      </div>
    `;
  }

  function modularPower(base, exponent, modulus) {
    let result = 1n;
    let factor = base % modulus;
    let power = exponent;
    while (power > 0n) {
      if (power & 1n) result = (result * factor) % modulus;
      factor = (factor * factor) % modulus;
      power >>= 1n;
    }
    return result;
  }

  function isPrimeBigInt(number) {
    if (number < 2n) return false;
    const smallPrimes = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n];
    if (smallPrimes.includes(number)) return true;
    if (smallPrimes.some((prime) => number % prime === 0n)) return false;

    let oddPart = number - 1n;
    let twos = 0n;
    while (oddPart % 2n === 0n) {
      oddPart /= 2n;
      twos += 1n;
    }
    const witnesses = [2n, 325n, 9375n, 28178n, 450775n, 9780504n, 1795265022n];
    for (const witness of witnesses) {
      const base = witness % number;
      if (base === 0n) continue;
      let value = modularPower(base, oddPart, number);
      if (value === 1n || value === number - 1n) continue;
      let passed = false;
      for (let round = 1n; round < twos; round += 1n) {
        value = (value * value) % number;
        if (value === number - 1n) {
          passed = true;
          break;
        }
      }
      if (!passed) return false;
    }
    return true;
  }

  function celebratePrime() {
    confettiField.innerHTML = "";
    for (let index = 0; index < 24; index += 1) {
      const piece = document.createElement("span");
      piece.className = "confetti-piece";
      piece.style.left = `${4 + Math.random() * 92}%`;
      piece.style.animationDelay = `${Math.random() * 0.28}s`;
      piece.style.animationDuration = `${1.15 + Math.random() * 0.65}s`;
      confettiField.append(piece);
    }
    window.setTimeout(() => {
      confettiField.innerHTML = "";
    }, 2200);
  }

  function initPrimeChecker(root) {
    const input = root.querySelector("#primeInput");
    const card = root.querySelector("#numberCard");
    const numberDisplay = root.querySelector("#primeNumber");
    const face = root.querySelector("#primeFace");
    const message = root.querySelector("#primeMessage");
    const maximum = 18446744073709551615n;

    function check() {
      const raw = input.value.trim();
      if (!/^\d+$/.test(raw)) {
        card.className = "number-card not-prime";
        numberDisplay.textContent = "?";
        face.textContent = "•︵•";
        message.textContent = "Pop in a positive whole number.";
        return;
      }
      const value = BigInt(raw);
      if (value > maximum) {
        card.className = "number-card not-prime";
        numberDisplay.textContent = "BIG";
        face.textContent = "•︵•";
        message.textContent = "That number is beyond this shelf's range.";
        return;
      }
      const prime = isPrimeBigInt(value);
      card.className = "number-card";
      void card.offsetWidth;
      card.classList.add(prime ? "is-prime" : "not-prime");
      numberDisplay.textContent = value.toLocaleString("en-US");
      if (prime) {
        face.textContent = "•ᴗ•";
        message.textContent = "Prime! Only 1 and itself divide it.";
        celebratePrime();
        bounceCategoryMascot("math", "A prime! Hooray!");
      } else if (value < 2n) {
        face.textContent = "•‿•";
        message.textContent = "Neither prime nor composite.";
      } else {
        face.textContent = "•︵•";
        message.textContent = "Composite — it has extra factors.";
      }
    }

    root.querySelector("#checkPrime").addEventListener("click", check);
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") check();
    });
  }

  /* Sequence playground */
  function renderSequencePlayground() {
    const sequences = [
      ["fibonacci", "Fibonacci"],
      ["triangular", "Triangular"],
      ["square", "Square"],
      ["cube", "Cube"],
      ["prime", "Prime"],
      ["palindromic", "Palindromic"],
      ["happy", "Happy numbers"],
      ["perfect", "Perfect numbers"],
    ];
    return `
      <div class="tool-layout">
        <div class="sequence-grid" role="list" aria-label="Number sequences">
          ${sequences
            .map(
              ([key, name], index) => `
                <button class="sequence-tile ${index === 0 ? "active" : ""}" data-sequence="${key}" role="listitem">${name}</button>
              `,
            )
            .join("")}
        </div>
        <div class="game-panel panel-lilac sequence-preview">
          <div class="sequence-count">
            <div>
              <span class="result-kicker">Now playing</span>
              <h3 id="sequenceName">Fibonacci</h3>
            </div>
            <output class="slider-bubble" id="sequenceCountValue">10 tiles</output>
          </div>
          <input class="game-range" id="sequenceCount" type="range" min="5" max="12" value="10" aria-label="Number of sequence tiles" />
          <div class="sequence-track" id="sequenceTrack" aria-live="polite"></div>
        </div>
      </div>
    `;
  }

  function isHappyNumber(number) {
    let current = number;
    const seen = new Set();
    while (current !== 1 && !seen.has(current)) {
      seen.add(current);
      current = String(current)
        .split("")
        .reduce((sum, digit) => sum + Number(digit) ** 2, 0);
    }
    return current === 1;
  }

  function generateSequence(type, count) {
    if (type === "fibonacci") {
      const values = [];
      let a = 0n;
      let b = 1n;
      for (let index = 0; index < count; index += 1) {
        values.push(a.toString());
        [a, b] = [b, a + b];
      }
      return values;
    }
    if (type === "triangular") return Array.from({ length: count }, (_, index) => String(((index + 1) * (index + 2)) / 2));
    if (type === "square") return Array.from({ length: count }, (_, index) => String((index + 1) ** 2));
    if (type === "cube") return Array.from({ length: count }, (_, index) => String((index + 1) ** 3));
    if (type === "prime") {
      const values = [];
      let candidate = 2;
      while (values.length < count) {
        let prime = true;
        for (let divisor = 2; divisor * divisor <= candidate; divisor += 1) {
          if (candidate % divisor === 0) {
            prime = false;
            break;
          }
        }
        if (prime) values.push(String(candidate));
        candidate += 1;
      }
      return values;
    }
    if (type === "palindromic") {
      const values = [];
      let candidate = 1;
      while (values.length < count) {
        const text = String(candidate);
        if (text === [...text].reverse().join("")) values.push(text);
        candidate += 1;
      }
      return values;
    }
    if (type === "happy") {
      const values = [];
      let candidate = 1;
      while (values.length < count) {
        if (isHappyNumber(candidate)) values.push(String(candidate));
        candidate += 1;
      }
      return values;
    }
    if (type === "perfect") {
      const exponents = [2n, 3n, 5n, 7n, 13n, 17n, 19n, 31n, 61n, 89n, 107n, 127n];
      return exponents.slice(0, count).map((power) => {
        const perfect = (2n ** (power - 1n)) * (2n ** power - 1n);
        return perfect.toString();
      });
    }
    return [];
  }

  function initSequencePlayground(root) {
    const track = root.querySelector("#sequenceTrack");
    const countRange = root.querySelector("#sequenceCount");
    const countValue = root.querySelector("#sequenceCountValue");
    const name = root.querySelector("#sequenceName");
    let active = "fibonacci";
    const names = {
      fibonacci: "Fibonacci",
      triangular: "Triangular",
      square: "Square",
      cube: "Cube",
      prime: "Prime",
      palindromic: "Palindromic",
      happy: "Happy numbers",
      perfect: "Perfect numbers",
    };

    function draw() {
      const count = Number(countRange.value);
      countValue.textContent = `${count} tiles`;
      name.textContent = names[active];
      track.innerHTML = "";
      generateSequence(active, count).forEach((value, index) => {
        const tile = document.createElement("span");
        tile.className = "sequence-number";
        tile.textContent = value;
        tile.title = value;
        tile.style.animationDelay = `${index * 35}ms`;
        track.append(tile);
      });
      track.scrollLeft = 0;
    }

    root.querySelectorAll("[data-sequence]").forEach((button) => {
      button.addEventListener("click", () => {
        active = button.dataset.sequence;
        root.querySelectorAll("[data-sequence]").forEach((tile) => tile.classList.toggle("active", tile === button));
        draw();
      });
    });
    countRange.addEventListener("input", draw);
    draw();
  }


  /* Coding and developing utilities */
  async function copyGameText(text, successMessage = "Copied!") {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const helper = document.createElement("textarea");
      helper.value = text;
      helper.style.position = "fixed";
      helper.style.opacity = "0";
      document.body.append(helper);
      helper.select();
      document.execCommand("copy");
      helper.remove();
    }
    showToast(successMessage);
  }

  function renderJsonWorkshop() {
    return `
      <div class="tool-layout dev-tool-layout">
        <div class="game-panel panel-lilac">
          <div class="dev-tool-heading">
            <div><h3>Shape your JSON</h3><p class="panel-note">Format, minify, sort, and validate without sending data anywhere.</p></div>
            <span class="dev-local-badge">LOCAL</span>
          </div>
          <textarea class="chunky-textarea dev-code-input" id="jsonInput" spellcheck="false" aria-label="JSON input">{
  "snack": "waffle",
  "tools": ["format", "validate"],
  "ready": true
}</textarea>
          <div class="button-row dev-action-row">
            <button class="game-button" data-json-action="format">FORMAT</button>
            <button class="game-button game-button-coral" data-json-action="minify">MINIFY</button>
            <button class="game-button game-button-sage" data-json-action="sort">SORT KEYS</button>
            <button class="game-button game-button-small" id="copyJson">COPY</button>
          </div>
        </div>
        <div class="result-card dev-status-card" id="jsonStatus" aria-live="polite">
          <span class="result-kicker">JSON status</span>
          <strong class="result-big dev-status-title" id="jsonStatusTitle">Valid!</strong>
          <span class="result-detail" id="jsonStatusDetail">3 top-level keys</span>
        </div>
      </div>
    `;
  }

  function initJsonWorkshop(root) {
    const input = root.querySelector("#jsonInput");
    const status = root.querySelector("#jsonStatus");
    const title = root.querySelector("#jsonStatusTitle");
    const detail = root.querySelector("#jsonStatusDetail");

    function sortedJson(value) {
      if (Array.isArray(value)) return value.map(sortedJson);
      if (value && typeof value === "object") {
        return Object.keys(value).sort().reduce((result, key) => {
          result[key] = sortedJson(value[key]);
          return result;
        }, {});
      }
      return value;
    }

    function parse() {
      try {
        const value = JSON.parse(input.value);
        status.classList.remove("dev-status-error");
        title.textContent = "Valid!";
        if (Array.isArray(value)) detail.textContent = `${value.length} item${value.length === 1 ? "" : "s"} in the top-level array`;
        else if (value && typeof value === "object") {
          const count = Object.keys(value).length;
          detail.textContent = `${count} top-level key${count === 1 ? "" : "s"}`;
        } else detail.textContent = `Top-level ${value === null ? "null" : typeof value}`;
        return value;
      } catch (error) {
        status.classList.add("dev-status-error");
        title.textContent = "Not valid yet";
        detail.textContent = error.message;
        return null;
      }
    }

    input.addEventListener("input", parse);
    root.querySelectorAll("[data-json-action]").forEach((button) => {
      button.addEventListener("click", () => {
        const value = parse();
        if (value === null) return;
        if (button.dataset.jsonAction === "format") input.value = JSON.stringify(value, null, 2);
        if (button.dataset.jsonAction === "minify") input.value = JSON.stringify(value);
        if (button.dataset.jsonAction === "sort") input.value = JSON.stringify(sortedJson(value), null, 2);
        parse();
      });
    });
    root.querySelector("#copyJson").addEventListener("click", () => copyGameText(input.value, "JSON copied!"));
    parse();
  }

  function renderRegexPlayground() {
    return `
      <div class="tool-layout dev-tool-layout">
        <div class="game-panel">
          <div class="field-stack">
            <label for="regexPattern">Pattern</label>
            <div class="regex-pattern-row"><span>/</span><input class="chunky-input" id="regexPattern" value="\\b[A-Z]\\w+" spellcheck="false" /><span>/</span></div>
          </div>
          <div class="regex-flags" aria-label="Regular expression flags">
            <button class="tab-button active" data-regex-flag="g" aria-pressed="true">g · all</button>
            <button class="tab-button" data-regex-flag="i" aria-pressed="false">i · ignore case</button>
            <button class="tab-button" data-regex-flag="m" aria-pressed="false">m · multiline</button>
          </div>
          <div class="field-stack" style="margin-top:15px">
            <label for="regexText">Test text</label>
            <textarea class="chunky-textarea" id="regexText">Waffles are warm. CodeHub likes Python, JavaScript, and Cocoa.</textarea>
          </div>
          <p class="graph-error" id="regexError" role="status"></p>
        </div>
        <div class="game-panel panel-teal">
          <div class="dev-tool-heading"><h3>Match board</h3><span class="dev-local-badge" id="regexCount">0 MATCHES</span></div>
          <div class="regex-highlight" id="regexHighlight" aria-live="polite"></div>
          <div class="regex-match-list" id="regexMatchList"></div>
        </div>
      </div>
    `;
  }

  function initRegexPlayground(root) {
    const pattern = root.querySelector("#regexPattern");
    const text = root.querySelector("#regexText");
    const error = root.querySelector("#regexError");
    const highlight = root.querySelector("#regexHighlight");
    const list = root.querySelector("#regexMatchList");
    const count = root.querySelector("#regexCount");
    const flags = new Set(["g"]);

    function draw() {
      highlight.innerHTML = "";
      list.innerHTML = "";
      error.textContent = "";
      try {
        const expression = new RegExp(pattern.value, [...flags].join(""));
        const source = text.value;
        const matches = [];
        if (flags.has("g")) {
          let match;
          while ((match = expression.exec(source)) !== null) {
            matches.push(match);
            if (match[0] === "") expression.lastIndex += 1;
            if (matches.length >= 250) break;
          }
        } else {
          const match = expression.exec(source);
          if (match) matches.push(match);
        }
        let cursor = 0;
        matches.forEach((match, index) => {
          highlight.append(document.createTextNode(source.slice(cursor, match.index)));
          const marked = document.createElement("mark");
          marked.textContent = match[0] || "∅";
          marked.title = `Match ${index + 1}`;
          highlight.append(marked);
          cursor = match.index + match[0].length;
          const chip = document.createElement("span");
          chip.textContent = `${index + 1}: ${match[0] || "empty match"}`;
          list.append(chip);
        });
        highlight.append(document.createTextNode(source.slice(cursor)));
        count.textContent = `${matches.length} MATCH${matches.length === 1 ? "" : "ES"}`;
        if (!matches.length) {
          const chip = document.createElement("span");
          chip.textContent = "No matches yet";
          list.append(chip);
        }
      } catch (caught) {
        error.textContent = caught.message;
        count.textContent = "PATTERN ERROR";
        highlight.textContent = text.value;
      }
    }

    root.querySelectorAll("[data-regex-flag]").forEach((button) => {
      button.addEventListener("click", () => {
        const flag = button.dataset.regexFlag;
        if (flags.has(flag)) flags.delete(flag);
        else flags.add(flag);
        button.classList.toggle("active", flags.has(flag));
        button.setAttribute("aria-pressed", String(flags.has(flag)));
        draw();
      });
    });
    pattern.addEventListener("input", draw);
    text.addEventListener("input", draw);
    draw();
  }

  function renderDataCodec() {
    return `
      <div class="tool-layout dev-tool-layout">
        <div class="game-panel panel-coral">
          <div class="segmented" role="tablist" aria-label="Codec type">
            <button class="tab-button active" data-codec-mode="base64" aria-selected="true">Base64</button>
            <button class="tab-button" data-codec-mode="url" aria-selected="false">URL</button>
          </div>
          <div class="segmented codec-direction" role="tablist" aria-label="Codec direction">
            <button class="tab-button active" data-codec-direction="encode" aria-selected="true">Encode</button>
            <button class="tab-button" data-codec-direction="decode" aria-selected="false">Decode</button>
          </div>
          <div class="field-stack"><label for="codecInput">Input</label><textarea class="chunky-textarea" id="codecInput">Waffles + code = cozy!</textarea></div>
          <button class="game-button" id="runCodec">ENCODE</button>
          <p class="graph-error" id="codecError" role="status"></p>
        </div>
        <div class="game-panel panel-teal">
          <div class="field-stack"><label for="codecOutput">Output</label><textarea class="chunky-textarea dev-output" id="codecOutput" readonly></textarea></div>
          <div class="button-row dev-action-row">
            <button class="game-button game-button-sage" id="swapCodec">⇄ USE AS INPUT</button>
            <button class="game-button game-button-small" id="copyCodec">COPY</button>
          </div>
        </div>
      </div>
    `;
  }

  function initDataCodec(root) {
    const input = root.querySelector("#codecInput");
    const output = root.querySelector("#codecOutput");
    const error = root.querySelector("#codecError");
    const runButton = root.querySelector("#runCodec");
    let mode = "base64";
    let direction = "encode";

    function encodeBase64(value) {
      const bytes = new TextEncoder().encode(value);
      let binary = "";
      bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
      return btoa(binary);
    }

    function decodeBase64(value) {
      const binary = atob(value.replace(/\s+/g, ""));
      const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
      return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    }

    function run() {
      try {
        error.textContent = "";
        if (mode === "base64") output.value = direction === "encode" ? encodeBase64(input.value) : decodeBase64(input.value);
        else output.value = direction === "encode" ? encodeURIComponent(input.value) : decodeURIComponent(input.value);
      } catch (caught) {
        output.value = "";
        error.textContent = caught.message || "That data could not be decoded.";
      }
    }

    root.querySelectorAll("[data-codec-mode]").forEach((button) => {
      button.addEventListener("click", () => {
        mode = button.dataset.codecMode;
        root.querySelectorAll("[data-codec-mode]").forEach((tab) => {
          const active = tab === button;
          tab.classList.toggle("active", active);
          tab.setAttribute("aria-selected", String(active));
        });
        run();
      });
    });
    root.querySelectorAll("[data-codec-direction]").forEach((button) => {
      button.addEventListener("click", () => {
        direction = button.dataset.codecDirection;
        root.querySelectorAll("[data-codec-direction]").forEach((tab) => {
          const active = tab === button;
          tab.classList.toggle("active", active);
          tab.setAttribute("aria-selected", String(active));
        });
        runButton.textContent = direction.toUpperCase();
        run();
      });
    });
    runButton.addEventListener("click", run);
    root.querySelector("#swapCodec").addEventListener("click", () => {
      input.value = output.value;
      direction = direction === "encode" ? "decode" : "encode";
      root.querySelectorAll("[data-codec-direction]").forEach((tab) => {
        const active = tab.dataset.codecDirection === direction;
        tab.classList.toggle("active", active);
        tab.setAttribute("aria-selected", String(active));
      });
      runButton.textContent = direction.toUpperCase();
      run();
    });
    root.querySelector("#copyCodec").addEventListener("click", () => copyGameText(output.value, "Encoded data copied!"));
    run();
  }

  function renderHashGenerator() {
    return `
      <div class="tool-layout dev-tool-layout">
        <div class="game-panel panel-sage">
          <div class="segmented" aria-label="Hash algorithm">
            <button class="tab-button active" data-hash-algorithm="SHA-256" aria-selected="true">SHA-256</button>
            <button class="tab-button" data-hash-algorithm="SHA-384" aria-selected="false">SHA-384</button>
            <button class="tab-button" data-hash-algorithm="SHA-512" aria-selected="false">SHA-512</button>
          </div>
          <div class="field-stack" style="margin-top:15px"><label for="hashInput">Text to hash</label><textarea class="chunky-textarea" id="hashInput">Bite Sized Utilities</textarea></div>
          <button class="game-button" id="generateHash">GENERATE HASH</button>
        </div>
        <div class="result-card hash-result" aria-live="polite">
          <span class="result-kicker" id="hashLabel">SHA-256 digest</span>
          <output class="hash-output" id="hashOutput">Working…</output>
          <button class="game-button game-button-small" id="copyHash">COPY HASH</button>
        </div>
      </div>
    `;
  }

  function initHashGenerator(root) {
    const input = root.querySelector("#hashInput");
    const output = root.querySelector("#hashOutput");
    const label = root.querySelector("#hashLabel");
    let algorithm = "SHA-256";

    async function generate() {
      try {
        output.textContent = "Working…";
        const bytes = new TextEncoder().encode(input.value);
        const digest = await crypto.subtle.digest(algorithm, bytes);
        output.textContent = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
        label.textContent = `${algorithm} digest`;
      } catch (error) {
        output.textContent = error.message || "Hashing is unavailable in this browser.";
      }
    }

    root.querySelectorAll("[data-hash-algorithm]").forEach((button) => {
      button.addEventListener("click", () => {
        algorithm = button.dataset.hashAlgorithm;
        root.querySelectorAll("[data-hash-algorithm]").forEach((tab) => {
          const active = tab === button;
          tab.classList.toggle("active", active);
          tab.setAttribute("aria-selected", String(active));
        });
        generate();
      });
    });
    root.querySelector("#generateHash").addEventListener("click", generate);
    root.querySelector("#copyHash").addEventListener("click", () => copyGameText(output.textContent, "Hash copied!"));
    generate();
  }

  function renderUuidForge() {
    return `
      <div class="tool-layout dev-tool-layout">
        <div class="game-panel panel-teal">
          <h3>Forge UUID v4 tokens</h3>
          <p class="panel-note">Cryptographically random identifiers, made locally in your browser.</p>
          <div class="face-count-control uuid-count-control">
            <button class="step-button" id="removeUuid" aria-label="Generate fewer UUIDs">−</button>
            <strong class="face-count"><span id="uuidCount">3</span> UUIDs</strong>
            <button class="step-button" id="addUuid" aria-label="Generate more UUIDs">+</button>
          </div>
          <button class="game-button" id="generateUuid" style="width:100%">FORGE NEW UUIDs</button>
        </div>
        <div class="game-panel panel-lilac">
          <textarea class="chunky-textarea dev-output uuid-output" id="uuidOutput" readonly aria-label="Generated UUIDs"></textarea>
          <button class="game-button game-button-small" id="copyUuid" style="width:100%;margin-top:12px">COPY ALL</button>
        </div>
      </div>
    `;
  }

  function initUuidForge(root) {
    const countLabel = root.querySelector("#uuidCount");
    const output = root.querySelector("#uuidOutput");
    let count = 3;

    function uuidV4() {
      if (crypto.randomUUID) return crypto.randomUUID();
      const bytes = crypto.getRandomValues(new Uint8Array(16));
      bytes[6] = (bytes[6] & 15) | 64;
      bytes[8] = (bytes[8] & 63) | 128;
      const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, "0"));
      return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10).join("")}`;
    }

    function generate() {
      output.value = Array.from({ length: count }, uuidV4).join("\n");
      countLabel.textContent = String(count);
    }

    root.querySelector("#removeUuid").addEventListener("click", () => {
      count = Math.max(1, count - 1);
      generate();
    });
    root.querySelector("#addUuid").addEventListener("click", () => {
      count = Math.min(20, count + 1);
      generate();
    });
    root.querySelector("#generateUuid").addEventListener("click", generate);
    root.querySelector("#copyUuid").addEventListener("click", () => copyGameText(output.value, "UUIDs copied!"));
    generate();
  }

  /* More coding and developing utilities */
  function escapeMarkup(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function renderJwtInspector() {
    return `
      <div class="tool-layout dev-tool-layout">
        <div class="game-panel panel-lilac">
          <div class="dev-tool-heading">
            <div><h3>Open the token</h3><p class="panel-note">Decode JWT sections locally. Signatures are displayed, never trusted or verified.</p></div>
            <span class="dev-local-badge">LOCAL</span>
          </div>
          <div class="field-stack">
            <label for="jwtInput">JSON Web Token</label>
            <textarea class="chunky-textarea dev-code-input jwt-input" id="jwtInput" spellcheck="false" aria-label="JSON Web Token"></textarea>
          </div>
          <div class="button-row dev-action-row">
            <button class="game-button" id="inspectJwt">INSPECT TOKEN</button>
            <button class="game-button game-button-coral" id="sampleJwt">FRESH SAMPLE</button>
            <button class="game-button game-button-small" id="copyJwtPayload">COPY PAYLOAD</button>
          </div>
          <p class="graph-error" id="jwtError" role="status"></p>
        </div>
        <div class="jwt-results">
          <section class="jwt-part-card jwt-header-card">
            <span class="result-kicker">Header</span>
            <pre id="jwtHeader">{}</pre>
          </section>
          <section class="jwt-part-card jwt-payload-card">
            <span class="result-kicker">Payload</span>
            <pre id="jwtPayload">{}</pre>
          </section>
          <section class="result-card jwt-status-card" aria-live="polite">
            <span class="result-kicker">Token status</span>
            <strong class="dev-status-title" id="jwtStatus">Waiting for a token</strong>
            <span class="result-detail" id="jwtDetails">Nothing leaves this browser.</span>
          </section>
        </div>
      </div>
    `;
  }

  function initJwtInspector(root) {
    const input = root.querySelector("#jwtInput");
    const headerOutput = root.querySelector("#jwtHeader");
    const payloadOutput = root.querySelector("#jwtPayload");
    const status = root.querySelector("#jwtStatus");
    const details = root.querySelector("#jwtDetails");
    const error = root.querySelector("#jwtError");
    let decodedPayload = "{}";

    function base64UrlEncode(value) {
      const bytes = new TextEncoder().encode(value);
      let binary = "";
      bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
      return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    }

    function base64UrlDecode(segment) {
      const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
      const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
      const binary = atob(padded);
      const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
      return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    }

    function makeSample() {
      const now = Math.floor(Date.now() / 1000);
      const header = { alg: "none", typ: "JWT" };
      const payload = { sub: "waffle-chef", name: "CodeHub", iat: now, exp: now + 3600, cozy: true };
      input.value = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(JSON.stringify(payload))}.`;
      inspect();
    }

    function inspect() {
      error.textContent = "";
      try {
        const parts = input.value.trim().split(".");
        if (parts.length !== 3 || !parts[0] || !parts[1]) throw new Error("A JWT needs header, payload, and signature sections separated by dots.");
        const header = JSON.parse(base64UrlDecode(parts[0]));
        const payload = JSON.parse(base64UrlDecode(parts[1]));
        decodedPayload = JSON.stringify(payload, null, 2);
        headerOutput.textContent = JSON.stringify(header, null, 2);
        payloadOutput.textContent = decodedPayload;
        const now = Math.floor(Date.now() / 1000);
        const notes = [];
        if (Number.isFinite(payload.iat)) notes.push(`Issued ${new Date(payload.iat * 1000).toLocaleString()}`);
        if (Number.isFinite(payload.exp)) notes.push(`Expires ${new Date(payload.exp * 1000).toLocaleString()}`);
        if (!parts[2]) {
          status.textContent = Number.isFinite(payload.exp) && payload.exp < now ? "Expired · unsigned" : "Unexpired · unsigned";
          notes.push("No signature is attached");
        } else if (Number.isFinite(payload.exp) && payload.exp < now) {
          status.textContent = "Expired token";
          notes.push("Signature present, not verified");
        } else {
          status.textContent = Number.isFinite(payload.exp)
            ? `Unexpired for ${Math.max(0, Math.ceil((payload.exp - now) / 60))} min`
            : "Decoded token";
          notes.push("Signature present, not verified");
        }
        details.textContent = notes.join(" · ") || `${Object.keys(payload).length} payload claims`;
      } catch (caught) {
        headerOutput.textContent = "{}";
        payloadOutput.textContent = "{}";
        decodedPayload = "{}";
        status.textContent = "Could not decode";
        details.textContent = "Check the token structure and JSON sections.";
        error.textContent = caught.message || "That token could not be decoded.";
      }
    }

    root.querySelector("#inspectJwt").addEventListener("click", inspect);
    root.querySelector("#sampleJwt").addEventListener("click", makeSample);
    root.querySelector("#copyJwtPayload").addEventListener("click", () => copyGameText(decodedPayload, "JWT payload copied!"));
    input.addEventListener("input", inspect);
    makeSample();
  }

  function renderDiffChecker() {
    return `
      <div class="tool-layout dev-tool-layout diff-layout">
        <div class="diff-input-grid">
          <div class="game-panel panel-coral field-stack">
            <label for="diffBefore">Original</label>
            <textarea class="chunky-textarea dev-code-input diff-input" id="diffBefore" spellcheck="false">const snack = "waffle";
console.log(snack);</textarea>
          </div>
          <div class="game-panel panel-sage field-stack">
            <label for="diffAfter">Changed</label>
            <textarea class="chunky-textarea dev-code-input diff-input" id="diffAfter" spellcheck="false">const snack = "waffle";
const topping = "cocoa";
console.log(snack, topping);</textarea>
          </div>
        </div>
        <div class="game-panel diff-result-panel">
          <div class="dev-tool-heading">
            <div><h3>Line-by-line changes</h3><p class="panel-note">Green was added, coral was removed.</p></div>
            <button class="tab-button" id="diffWhitespace" aria-pressed="false">IGNORE SPACES</button>
          </div>
          <div class="diff-stats" id="diffStats" aria-live="polite"></div>
          <div class="diff-output" id="diffOutput"></div>
        </div>
      </div>
    `;
  }

  function initDiffChecker(root) {
    const before = root.querySelector("#diffBefore");
    const after = root.querySelector("#diffAfter");
    const output = root.querySelector("#diffOutput");
    const stats = root.querySelector("#diffStats");
    const whitespace = root.querySelector("#diffWhitespace");
    let ignoreWhitespace = false;
    let timer = null;

    function compareLines(left, right) {
      const a = left.split("\n").slice(0, 300);
      const b = right.split("\n").slice(0, 300);
      const normalize = (line) => ignoreWhitespace ? line.replace(/\s+/g, " ").trim() : line;
      const matrix = Array.from({ length: a.length + 1 }, () => new Uint16Array(b.length + 1));
      for (let i = a.length - 1; i >= 0; i -= 1) {
        for (let j = b.length - 1; j >= 0; j -= 1) {
          matrix[i][j] = normalize(a[i]) === normalize(b[j]) ? matrix[i + 1][j + 1] + 1 : Math.max(matrix[i + 1][j], matrix[i][j + 1]);
        }
      }
      const changes = [];
      let i = 0;
      let j = 0;
      while (i < a.length || j < b.length) {
        if (i < a.length && j < b.length && normalize(a[i]) === normalize(b[j])) {
          changes.push({ kind: "same", text: a[i] }); i += 1; j += 1;
        } else if (j < b.length && (i === a.length || matrix[i][j + 1] >= matrix[i + 1][j])) {
          changes.push({ kind: "add", text: b[j] }); j += 1;
        } else {
          changes.push({ kind: "remove", text: a[i] }); i += 1;
        }
      }
      return changes;
    }

    function draw() {
      const changes = compareLines(before.value, after.value);
      output.innerHTML = "";
      let additions = 0;
      let removals = 0;
      changes.forEach((change) => {
        if (change.kind === "add") additions += 1;
        if (change.kind === "remove") removals += 1;
        const row = document.createElement("div");
        row.className = `diff-line diff-${change.kind}`;
        const marker = document.createElement("span");
        marker.textContent = change.kind === "add" ? "+" : change.kind === "remove" ? "−" : " ";
        const code = document.createElement("code");
        code.textContent = change.text || " ";
        row.append(marker, code);
        output.append(row);
      });
      stats.innerHTML = `<span class="diff-added">+${additions} added</span><span class="diff-removed">−${removals} removed</span><span>${changes.length - additions - removals} unchanged</span>`;
    }

    function schedule() {
      window.clearTimeout(timer);
      timer = window.setTimeout(draw, 160);
    }
    before.addEventListener("input", schedule);
    after.addEventListener("input", schedule);
    whitespace.addEventListener("click", () => {
      ignoreWhitespace = !ignoreWhitespace;
      whitespace.classList.toggle("active", ignoreWhitespace);
      whitespace.setAttribute("aria-pressed", String(ignoreWhitespace));
      draw();
    });
    addCleanup(() => window.clearTimeout(timer));
    draw();
  }

  function renderMarkdownStudio() {
    return `
      <div class="tool-layout markdown-layout">
        <section class="game-panel panel-teal markdown-editor-panel">
          <div class="dev-tool-heading">
            <div><h3>Markdown</h3><p class="panel-note">Headings, lists, links, quotes, emphasis, and code.</p></div>
            <span class="dev-local-badge" id="markdownStats">0 WORDS</span>
          </div>
          <textarea class="chunky-textarea dev-code-input markdown-input" id="markdownInput" spellcheck="false"># Waffle Notes

Build **small tools** that feel _delightful_.

- Runs locally
- Works on every screen
- Tastes great with \`console.log()\`

> Tiny tools can still be powerful.

[Visit CodeHub](#codehub)</textarea>
          <button class="game-button game-button-small" id="copyMarkdownHtml">COPY HTML</button>
        </section>
        <section class="game-panel markdown-preview-panel">
          <div class="dev-tool-heading"><h3>Safe preview</h3><span class="dev-local-badge">LIVE</span></div>
          <article class="markdown-preview" id="markdownPreview"></article>
        </section>
      </div>
    `;
  }

  function initMarkdownStudio(root) {
    const input = root.querySelector("#markdownInput");
    const preview = root.querySelector("#markdownPreview");
    const stats = root.querySelector("#markdownStats");

    function inlineMarkdown(value) {
      let safe = escapeMarkup(value);
      safe = safe.replace(/`([^`]+)`/g, "<code>$1</code>");
      safe = safe.replace(/\[([^\]]+)\]\(((?:https?:\/\/|#)[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
      safe = safe.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
      safe = safe.replace(/__([^_]+)__/g, "<strong>$1</strong>");
      safe = safe.replace(/\*([^*]+)\*/g, "<em>$1</em>");
      safe = safe.replace(/_([^_]+)_/g, "<em>$1</em>");
      return safe;
    }

    function markdownToHtml(source) {
      const lines = source.replace(/\r/g, "").split("\n");
      const html = [];
      let inCode = false;
      let codeLines = [];
      let listType = null;
      const closeList = () => {
        if (listType) html.push(`</${listType}>`);
        listType = null;
      };
      lines.forEach((line) => {
        if (line.trim().startsWith("```")) {
          closeList();
          if (inCode) {
            html.push(`<pre><code>${escapeMarkup(codeLines.join("\n"))}</code></pre>`);
            codeLines = [];
          }
          inCode = !inCode;
          return;
        }
        if (inCode) { codeLines.push(line); return; }
        const unordered = line.match(/^\s*[-*+]\s+(.+)$/);
        const ordered = line.match(/^\s*\d+\.\s+(.+)$/);
        if (unordered || ordered) {
          const nextType = unordered ? "ul" : "ol";
          if (listType !== nextType) { closeList(); html.push(`<${nextType}>`); listType = nextType; }
          html.push(`<li>${inlineMarkdown((unordered || ordered)[1])}</li>`);
          return;
        }
        closeList();
        const heading = line.match(/^(#{1,6})\s+(.+)$/);
        if (heading) { const level = heading[1].length; html.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`); return; }
        if (/^\s*---+\s*$/.test(line)) { html.push("<hr>"); return; }
        if (/^>\s?/.test(line)) { html.push(`<blockquote>${inlineMarkdown(line.replace(/^>\s?/, ""))}</blockquote>`); return; }
        if (!line.trim()) { html.push(""); return; }
        html.push(`<p>${inlineMarkdown(line)}</p>`);
      });
      closeList();
      if (inCode) html.push(`<pre><code>${escapeMarkup(codeLines.join("\n"))}</code></pre>`);
      return html.join("\n");
    }

    function draw() {
      preview.innerHTML = markdownToHtml(input.value);
      const words = input.value.trim() ? input.value.trim().split(/\s+/).length : 0;
      stats.textContent = `${words} WORD${words === 1 ? "" : "S"} · ${input.value.length} CHARS`;
    }
    input.addEventListener("input", draw);
    root.querySelector("#copyMarkdownHtml").addEventListener("click", () => copyGameText(preview.innerHTML, "Rendered HTML copied!"));
    draw();
  }

  function renderTimestampLab() {
    return `
      <div class="tool-layout dev-tool-layout">
        <div class="game-panel">
          <div class="segmented" role="tablist" aria-label="Timestamp direction">
            <button class="tab-button active" data-time-mode="fromUnix" aria-selected="true">Unix → Date</button>
            <button class="tab-button" data-time-mode="toUnix" aria-selected="false">Date → Unix</button>
          </div>
          <div id="unixTimePanel" class="timestamp-input-panel">
            <div class="field-stack"><label for="unixTimeInput">Unix timestamp</label><input class="chunky-input" id="unixTimeInput" inputmode="numeric" /></div>
            <div class="segmented timestamp-units" aria-label="Timestamp units">
              <button class="tab-button active" data-time-unit="auto" aria-selected="true">Auto detect</button>
              <button class="tab-button" data-time-unit="seconds" aria-selected="false">Seconds</button>
              <button class="tab-button" data-time-unit="milliseconds" aria-selected="false">Milliseconds</button>
            </div>
          </div>
          <div id="dateTimePanel" class="timestamp-input-panel" hidden>
            <div class="field-stack"><label for="dateTimeInput">Local date and time</label><input class="chunky-input timestamp-date-input" id="dateTimeInput" type="datetime-local" /></div>
          </div>
          <div class="button-row dev-action-row">
            <button class="game-button" id="convertTimestamp">CONVERT</button>
            <button class="game-button game-button-coral" id="timestampNow">USE NOW</button>
          </div>
          <p class="graph-error" id="timestampError" role="status"></p>
        </div>
        <div class="timestamp-results" aria-live="polite">
          <section class="result-card timestamp-primary">
            <span class="result-kicker">Local time</span>
            <strong id="timeLocal">—</strong>
            <span class="result-detail" id="timeRelative">—</span>
          </section>
          <section class="game-panel panel-teal timestamp-detail-grid">
            <div><span>UTC</span><strong id="timeUtc">—</strong></div>
            <div><span>ISO 8601</span><strong id="timeIso">—</strong></div>
            <div><span>Unix seconds</span><strong id="timeSeconds">—</strong></div>
            <div><span>Milliseconds</span><strong id="timeMilliseconds">—</strong></div>
          </section>
        </div>
      </div>
    `;
  }

  function initTimestampLab(root) {
    const unixPanel = root.querySelector("#unixTimePanel");
    const datePanel = root.querySelector("#dateTimePanel");
    const unixInput = root.querySelector("#unixTimeInput");
    const dateInput = root.querySelector("#dateTimeInput");
    const error = root.querySelector("#timestampError");
    const localOutput = root.querySelector("#timeLocal");
    const relativeOutput = root.querySelector("#timeRelative");
    const utcOutput = root.querySelector("#timeUtc");
    const isoOutput = root.querySelector("#timeIso");
    const secondsOutput = root.querySelector("#timeSeconds");
    const millisecondsOutput = root.querySelector("#timeMilliseconds");
    let mode = "fromUnix";
    let unit = "auto";

    function localDateTimeValue(date) {
      const shifted = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
      return shifted.toISOString().slice(0, 16);
    }

    function relativeTime(date) {
      const seconds = Math.round((date.getTime() - Date.now()) / 1000);
      const absolute = Math.abs(seconds);
      if (absolute < 5) return "right now";
      const ranges = [[31536000, "year"], [2592000, "month"], [86400, "day"], [3600, "hour"], [60, "minute"], [1, "second"]];
      const [size, name] = ranges.find(([size]) => absolute >= size);
      const amount = Math.round(absolute / size);
      return seconds < 0 ? `${amount} ${name}${amount === 1 ? "" : "s"} ago` : `in ${amount} ${name}${amount === 1 ? "" : "s"}`;
    }

    function display(date) {
      if (Number.isNaN(date.getTime())) throw new Error("That date or timestamp is not valid.");
      localOutput.textContent = date.toLocaleString();
      relativeOutput.textContent = relativeTime(date);
      utcOutput.textContent = date.toUTCString();
      isoOutput.textContent = date.toISOString();
      secondsOutput.textContent = String(Math.floor(date.getTime() / 1000));
      millisecondsOutput.textContent = String(date.getTime());
    }

    function convert() {
      error.textContent = "";
      try {
        let date;
        if (mode === "fromUnix") {
          const raw = Number(unixInput.value.trim());
          if (!Number.isFinite(raw)) throw new Error("Enter a numeric Unix timestamp.");
          const milliseconds = unit === "seconds" ? raw * 1000 : unit === "milliseconds" ? raw : Math.abs(raw) < 100000000000 ? raw * 1000 : raw;
          date = new Date(milliseconds);
        } else {
          if (!dateInput.value) throw new Error("Choose a local date and time first.");
          date = new Date(dateInput.value);
        }
        display(date);
      } catch (caught) {
        error.textContent = caught.message || "That timestamp could not be converted.";
      }
    }

    function useNow() {
      const now = new Date();
      unixInput.value = String(Math.floor(now.getTime() / 1000));
      dateInput.value = localDateTimeValue(now);
      convert();
    }

    root.querySelectorAll("[data-time-mode]").forEach((button) => {
      button.addEventListener("click", () => {
        mode = button.dataset.timeMode;
        root.querySelectorAll("[data-time-mode]").forEach((tab) => {
          const active = tab === button;
          tab.classList.toggle("active", active);
          tab.setAttribute("aria-selected", String(active));
        });
        unixPanel.hidden = mode !== "fromUnix";
        datePanel.hidden = mode !== "toUnix";
        convert();
      });
    });
    root.querySelectorAll("[data-time-unit]").forEach((button) => {
      button.addEventListener("click", () => {
        unit = button.dataset.timeUnit;
        root.querySelectorAll("[data-time-unit]").forEach((tab) => {
          const active = tab === button;
          tab.classList.toggle("active", active);
          tab.setAttribute("aria-selected", String(active));
        });
        convert();
      });
    });
    root.querySelector("#convertTimestamp").addEventListener("click", convert);
    root.querySelector("#timestampNow").addEventListener("click", useNow);
    unixInput.addEventListener("input", convert);
    dateInput.addEventListener("input", convert);
    useNow();
  }

  /* CodeHub */
  const codeHubRuntimeState = {
    endpoint: "/api/submissions",
    ready: true,
  };

  const codeHubTemplates = {
    web: {
      html: `<main class="hello-card">
  <span class="badge">CodeHub</span>
  <h1>Hello, tiny web!</h1>
  <p id="message">HTML, CSS, and JavaScript are playing together.</p>
  <button id="spark">Make a spark</button>
</main>`,
      css: `body {
  min-height: 100vh;
  margin: 0;
  display: grid;
  place-items: center;
  background: #f5dba8;
  color: #4f2f23;
  font-family: system-ui, sans-serif;
}

.hello-card {
  width: min(360px, 80vw);
  padding: 32px;
  border: 5px solid #4f2f23;
  border-radius: 28px;
  background: #fff1cf;
  box-shadow: 0 12px 0 #a96840;
  text-align: center;
}

.badge, button {
  display: inline-block;
  padding: 9px 14px;
  border: 3px solid #4f2f23;
  border-radius: 14px;
  background: #82b9b3;
  font-weight: 800;
}

button {
  background: #efb94f;
  cursor: pointer;
}`,
      js: `const button = document.querySelector('#spark');
const message = document.querySelector('#message');
let sparks = 0;

button.addEventListener('click', () => {
  sparks += 1;
  message.textContent = \`You made \${sparks} spark\${sparks === 1 ? '' : 's'}!\`;
  console.log('Spark count:', sparks);
});`,
    },
    javascript: `// JavaScript runs on our in-kitchen sandbox (Node.js v22)
const name = "Waffles";
for (let i = 1; i <= 3; i++) {
  console.log(\`\${i}: Hello, \${name}!\`);
}
const squares = Array.from({length: 5}, (_, i) => (i + 1) ** 2);
console.log("Tiny squares:", squares);
console.log("Node:", process.version);`,
    python: `name = input("What is your name? ")
for bite in range(1, 4):
    print(f"{bite}: Hello, {name}!")

squares = [number ** 2 for number in range(1, 6)]
print("Tiny squares:", squares)`,
    c: `#include <stdio.h>

int main(void) {
    char name[64];
    printf("What is your name? ");
    if (scanf("%63s", name) != 1) return 1;

    for (int bite = 1; bite <= 3; ++bite) {
        printf("%d: Hello, %s!\\n", bite, name);
    }
    return 0;
}`,
    cpp: `#include <iostream>
#include <string>
#include <vector>

int main() {
    std::string name;
    std::cout << "What is your name? ";
    std::cin >> name;

    std::vector<int> squares;
    for (int number = 1; number <= 5; ++number) {
        squares.push_back(number * number);
    }

    std::cout << "Hello, " << name << "! Tiny squares:";
    for (int value : squares) std::cout << ' ' << value;
    std::cout << '\\n';
    return 0;
}`,
  };

  // Judge0-CE language IDs on our self-hosted runner.
  const JUDGE0_LANG = { javascript: 93, python: 71, c: 50, cpp: 54 };

  function renderCodeHub() {
    return `
      <div class="codehub-shell">
        <div class="codehub-top-panel">
          <div class="segmented codehub-language-tabs" role="tablist" aria-label="CodeHub language">
            <button class="tab-button active" data-code-language="web" aria-selected="true">HTML · CSS · JS</button>
            <button class="tab-button" data-code-language="javascript" aria-selected="false">JavaScript</button>
            <button class="tab-button" data-code-language="python" aria-selected="false">Python</button>
            <button class="tab-button" data-code-language="c" aria-selected="false">C</button>
            <button class="tab-button" data-code-language="cpp" aria-selected="false">C++</button>
          </div>
          <div class="codehub-runtime-card" aria-live="polite">
            <span class="runtime-dot ready" id="codeRuntimeDot"></span>
            <div>
              <span>Runtime</span>
              <strong id="codeRuntimeLabel">Your browser · ready</strong>
            </div>
            <div class="runtime-progress" aria-hidden="true"><span id="runtimeProgressBar"></span></div>
          </div>
        </div>

        <div class="codehub-workspace">
          <section class="codehub-editor-card">
            <div class="codehub-file-tabs" id="webFileTabs" role="tablist" aria-label="Web files">
              <button class="code-file-tab active" data-web-file="html" aria-selected="true">index.html</button>
              <button class="code-file-tab" data-web-file="css" aria-selected="false">style.css</button>
              <button class="code-file-tab" data-web-file="js" aria-selected="false">script.js</button>
            </div>
            <div class="codehub-editor-heading">
              <span class="code-file-name" id="codeFileName">index.html</span>
              <span class="code-language-pill" id="codeLanguagePill">WEB TRIO</span>
            </div>
            <textarea class="code-editor" id="codeEditor" aria-label="Code editor" spellcheck="false" autocapitalize="off" autocomplete="off"></textarea>
            <div class="codehub-action-row" id="codeHubActions">
              <button class="game-button game-button-coral" id="runCode">▶ RUN CODE</button>
              <button class="game-button game-button-small" id="resetCode">RESET</button>
            </div>
          </section>

          <section class="codehub-result-card">
            <div class="codehub-result-heading">
              <strong id="codeResultTitle">Live preview</strong>
              <span id="codeRunTime">Browser sandbox</span>
            </div>
            <iframe class="code-preview" id="codePreview" title="CodeHub web preview" sandbox="allow-scripts"></iframe>
            <div class="code-console-wrap" id="codeConsoleWrap">
              <span class="console-label">Console</span>
              <pre class="code-console" id="codeConsole" aria-live="polite">Ready.</pre>
            </div>
          </section>
        </div>
      </div>
    `;
  }

  async function runOnServer(languageKey, source, stdinText, onStatus) {
    const language_id = JUDGE0_LANG[languageKey];
    onStatus(`Kitchen sandbox · ${languageKey.toUpperCase()} · queued`, 0.1, "loading");
    const response = await fetch(codeHubRuntimeState.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language_id, source_code: source, stdin: stdinText || "" }),
    });
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Runner error (${response.status}): ${text || "no response"}`);
    }
    onStatus(`Kitchen sandbox · ${languageKey.toUpperCase()} · running`, 0.7, "loading");
    return response.json();
  }

  function initCodeHub(root) {
    const editor = root.querySelector("#codeEditor");
    const actionRow = root.querySelector("#codeHubActions");
    const webFileTabs = root.querySelector("#webFileTabs");
    const fileName = root.querySelector("#codeFileName");
    const languagePill = root.querySelector("#codeLanguagePill");
    const runtimeLabel = root.querySelector("#codeRuntimeLabel");
    const runtimeDot = root.querySelector("#codeRuntimeDot");
    const runtimeProgress = root.querySelector("#runtimeProgressBar");
    const runButton = root.querySelector("#runCode");
    const resetButton = root.querySelector("#resetCode");
    const preview = root.querySelector("#codePreview");
    const consoleOutput = root.querySelector("#codeConsole");
    const resultTitle = root.querySelector("#codeResultTitle");
    const runTime = root.querySelector("#codeRunTime");
    const consoleWrap = root.querySelector("#codeConsoleWrap");
    const sources = {
      web: { ...codeHubTemplates.web },
      javascript: codeHubTemplates.javascript,
      python: codeHubTemplates.python,
      c: codeHubTemplates.c,
      cpp: codeHubTemplates.cpp,
    };
    const fileNames = { html: "index.html", css: "style.css", js: "script.js" };
    const languageNames = {
      web: "WEB TRIO",
      javascript: "JAVASCRIPT · NODE",
      python: "PYTHON 3",
      c: "C · GCC",
      cpp: "C++ · G++",
    };
    const channel = `codehub-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    let language = "web";
    let webFile = "html";
    let previewTimer = null;
    let running = false;
    let stdinWrap = null;
    let stdin = null;
    let programInput = "Waffle";

    function updateProgramInputControl() {
      if (stdin) programInput = stdin.value;
      if (stdinWrap) stdinWrap.remove();
      stdinWrap = null;
      stdin = null;
      const usesProgramInput = language !== "web";
      if (!usesProgramInput) return;

      stdinWrap = document.createElement("div");
      stdinWrap.id = "codeStdinWrap";
      stdinWrap.className = "codehub-stdin";
      const label = document.createElement("label");
      label.htmlFor = "codeStdin";
      const prettyName = { javascript: "JavaScript", python: "Python", c: "C", cpp: "C++" }[language] || language;
      label.textContent = `${prettyName} program stdin`;
      const input = document.createElement("textarea");
      input.id = "codeStdin";
      input.className = "code-stdin-input";
      input.spellcheck = false;
      input.value = programInput;
      stdinWrap.append(label, input);
      actionRow.before(stdinWrap);
      stdin = input;
    }

    function setStatus(message, progress = 1, state = "ready") {
      if (!root.isConnected) return;
      runtimeLabel.textContent = message;
      runtimeDot.className = `runtime-dot ${state}`;
      runtimeProgress.style.width = `${Math.max(0, Math.min(1, progress)) * 100}%`;
    }

    function saveEditor() {
      if (language === "web") sources.web[webFile] = editor.value;
      else sources[language] = editor.value;
    }

    function updateEditor() {
      editor.value = language === "web" ? sources.web[webFile] : sources[language];
      const fileMap = { web: fileNames[webFile], javascript: "main.js", python: "main.py", c: "main.c", cpp: "main.cpp" };
      fileName.textContent = fileMap[language];
      languagePill.textContent = languageNames[language];
    }

    function writeConsole(text, tone = "normal") {
      consoleOutput.textContent = text || "Program finished with no output.";
      consoleOutput.dataset.tone = tone;
      consoleWrap.scrollTop = consoleWrap.scrollHeight;
    }

    function runWeb() {
      saveEditor();
      const logs = [];
      writeConsole("Running in the browser…");
      const safeJavaScript = sources.web.js.replace(/<\/script/gi, "<\\/script");
      const bridge = `
        const __send = (type, values) => parent.postMessage({ source: 'codehub-preview', channel: ${JSON.stringify(channel)}, type, text: values.map(value => {
          try { return typeof value === 'object' ? JSON.stringify(value) : String(value); }
          catch { return String(value); }
        }).join(' ') }, '*');
        ['log', 'info', 'warn', 'error'].forEach(type => {
          const original = console[type];
          console[type] = (...values) => { __send(type, values); original.apply(console, values); };
        });
        window.addEventListener('error', event => __send('error', [event.message]));
      `;
      preview.srcdoc = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${sources.web.css}</style></head><body>${sources.web.html}<script>${bridge}${safeJavaScript}<\/script></body></html>`;
      writeConsole(logs.length ? logs.join("\n") : "Preview ready. Console messages will appear here.");
      setStatus("Your browser · ready", 1, "ready");
      runTime.textContent = "Browser sandbox";
    }

    const previewMessageHandler = (event) => {
      if (event.source !== preview.contentWindow || event.data?.source !== "codehub-preview" || event.data.channel !== channel) return;
      const prefix = event.data.type === "error" ? "Error: " : event.data.type === "warn" ? "Warning: " : "";
      const previous = consoleOutput.textContent.includes("Preview ready") ? "" : `${consoleOutput.textContent}\n`;
      writeConsole(`${previous}${prefix}${event.data.text}`, event.data.type === "error" ? "error" : "normal");
    };
    window.addEventListener("message", previewMessageHandler);
    addCleanup(() => window.removeEventListener("message", previewMessageHandler));

    async function runServerLanguage(languageKey) {
      const started = performance.now();
      const src = sources[languageKey];
      const inputText = (languageKey === "c" || languageKey === "cpp" || languageKey === "javascript" || languageKey === "python")
        ? (stdin ? stdin.value : programInput)
        : "";
      const result = await runOnServer(languageKey, src, inputText, setStatus);
      let output = "";
      let tone = "normal";
      if (result.status?.id === 11) {
        output = result.compile_output || "Compilation failed.";
        tone = "error";
      } else if (result.status?.id === 5) {
        output = (result.stdout || "") + (result.stderr || "") + "\n⌛ Time limit exceeded (4s CPU).";
        tone = "error";
      } else if (result.status?.id === 6 || result.status?.id === 13) {
        output = (result.stdout || "") + (result.stderr || "");
        if (!output) output = `Runtime error (${result.status?.description || "unknown"}).`;
        tone = "error";
      } else {
        output = (result.stdout || "") + (result.stderr || "");
        if (!output) output = "Program finished with no output.";
      }
      writeConsole(output, tone);
      setStatus(
        result.status?.id === 3 ? "Kitchen sandbox · ready" : `Kitchen sandbox · ${result.status?.description || "stopped"}`,
        1,
        result.status?.id === 3 ? "ready" : result.status?.id === 5 ? "loading" : "error"
      );
      const ms = Math.round((parseFloat(result.time) || (performance.now() - started)/1000) * 1000);
      runTime.textContent = `${languageKey.toUpperCase()} · ${ms} ms · ${result.status?.description || "done"}`;
    }

    async function runCode() {
      if (running) return;
      saveEditor();
      running = true;
      runButton.disabled = true;
      runButton.textContent = language === "web" ? "▶ REFRESHING" : "● RUNNING";
      writeConsole(language === "web" ? "Refreshing preview…" : "Starting runtime…");
      try {
        if (language === "web") runWeb();
        else await runServerLanguage(language);
      } catch (error) {
        writeConsole(error?.stack || error?.message || String(error), "error");
        setStatus("Runtime needs attention", 1, "error");
        runTime.textContent = "Run stopped";
      } finally {
        if (root.isConnected) {
          running = false;
          runButton.disabled = false;
          runButton.textContent = "▶ RUN CODE";
        }
      }
    }

    function selectLanguage(nextLanguage) {
      if (nextLanguage === language) return;
      saveEditor();
      language = nextLanguage;
      root.querySelectorAll("[data-code-language]").forEach((button) => {
        const active = button.dataset.codeLanguage === language;
        button.classList.toggle("active", active);
        button.setAttribute("aria-selected", String(active));
      });
      webFileTabs.hidden = language !== "web";
      updateProgramInputControl();
      preview.hidden = language !== "web";
      resultTitle.textContent = language === "web" ? "Live preview" : "Program output";
      consoleWrap.classList.toggle("console-large", language !== "web");
      if (language === "web") {
        setStatus("Your browser · ready", 1, "ready");
        runTime.textContent = "Browser sandbox";
      } else {
        setStatus("Kitchen sandbox · ready", 1, "ready");
        const pretty = languageNames[language];
        runTime.textContent = `${pretty} · self-hosted sandbox`;
        writeConsole(`Press RUN CODE to execute ${language} on the in-kitchen sandbox (CPU 4s · 256MB · no network).`);
      }
      updateEditor();
      if (language === "web") runWeb();
    }

    root.querySelectorAll("[data-code-language]").forEach((button) => {
      button.addEventListener("click", () => selectLanguage(button.dataset.codeLanguage));
    });
    root.querySelectorAll("[data-web-file]").forEach((button) => {
      button.addEventListener("click", () => {
        if (language !== "web" || button.dataset.webFile === webFile) return;
        sources.web[webFile] = editor.value;
        webFile = button.dataset.webFile;
        root.querySelectorAll("[data-web-file]").forEach((tab) => {
          const active = tab === button;
          tab.classList.toggle("active", active);
          tab.setAttribute("aria-selected", String(active));
        });
        updateEditor();
      });
    });
    editor.addEventListener("input", () => {
      if (language !== "web") return;
      window.clearTimeout(previewTimer);
      previewTimer = window.setTimeout(runWeb, 480);
    });
    runButton.addEventListener("click", runCode);
    resetButton.addEventListener("click", () => {
      if (language === "web") sources.web = { ...codeHubTemplates.web };
      else sources[language] = codeHubTemplates[language];
      updateEditor();
      writeConsole("Starter code restored.");
      if (language === "web") runWeb();
    });
    addCleanup(() => window.clearTimeout(previewTimer));
    updateEditor();
    runWeb();
  }

  // Expose openTool for external UI (search, keyboard shortcuts).
  window.openTool = openTool;
})();
