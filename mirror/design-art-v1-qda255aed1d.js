(() => {
  "use strict";

  const escapeMarkup = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const wrapHue = (hue) => (((Math.round(hue) % 360) + 360) % 360);

  /* ---------- Pure Color & Geometry Helpers ---------- */

  function normalizeHex(input, fallback = "#f49ac2") {
    const raw = String(input ?? "").trim().replace(/^#/, "");
    if (/^[0-9a-f]{3}$/i.test(raw)) {
      return `#${raw
        .split("")
        .map((ch) => ch + ch)
        .join("")
        .toLowerCase()}`;
    }
    if (/^[0-9a-f]{6}$/i.test(raw)) {
      return `#${raw.toLowerCase()}`;
    }
    return fallback;
  }

  function hexToRgb(hex) {
    const clean = normalizeHex(hex).slice(1);
    const num = Number.parseInt(clean, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  }

  function rgbToHex(r, g, b) {
    const toByte = (channel) => clamp(Math.round(Number(channel) || 0), 0, 255).toString(16).padStart(2, "0");
    return `#${toByte(r)}${toByte(g)}${toByte(b)}`;
  }

  function rgbToHsl(r, g, b) {
    const rn = clamp(r, 0, 255) / 255;
    const gn = clamp(g, 0, 255) / 255;
    const bn = clamp(b, 0, 255) / 255;
    const max = Math.max(rn, gn, bn);
    const min = Math.min(rn, gn, bn);
    const delta = max - min;
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (delta !== 0) {
      s = delta / (1 - Math.abs(2 * l - 1));
      if (max === rn) {
        h = ((gn - bn) / delta) % 6;
      } else if (max === gn) {
        h = (bn - rn) / delta + 2;
      } else {
        h = (rn - gn) / delta + 4;
      }
      h = wrapHue(h * 60);
    }

    return {
      h: wrapHue(h),
      s: clamp(Math.round(s * 100), 0, 100),
      l: clamp(Math.round(l * 100), 0, 100),
    };
  }

  function hslToRgb(h, s, l) {
    const hue = wrapHue(h);
    const sat = clamp(Number(s) || 0, 0, 100) / 100;
    const light = clamp(Number(l) || 0, 0, 100) / 100;
    const c = (1 - Math.abs(2 * light - 1)) * sat;
    const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
    const m = light - c / 2;
    let r1 = 0;
    let g1 = 0;
    let b1 = 0;

    if (hue < 60) {
      [r1, g1, b1] = [c, x, 0];
    } else if (hue < 120) {
      [r1, g1, b1] = [x, c, 0];
    } else if (hue < 180) {
      [r1, g1, b1] = [0, c, x];
    } else if (hue < 240) {
      [r1, g1, b1] = [0, x, c];
    } else if (hue < 300) {
      [r1, g1, b1] = [x, 0, c];
    } else {
      [r1, g1, b1] = [c, 0, x];
    }

    return {
      r: clamp(Math.round((r1 + m) * 255), 0, 255),
      g: clamp(Math.round((g1 + m) * 255), 0, 255),
      b: clamp(Math.round((b1 + m) * 255), 0, 255),
    };
  }

  function hsvToRgb(h, s, v) {
    const hue = wrapHue(h);
    const sat = clamp(Number(s) || 0, 0, 100) / 100;
    const val = clamp(Number(v) || 0, 0, 100) / 100;
    const c = val * sat;
    const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
    const m = val - c;
    let r1 = 0;
    let g1 = 0;
    let b1 = 0;
    if (hue < 60) [r1, g1, b1] = [c, x, 0];
    else if (hue < 120) [r1, g1, b1] = [x, c, 0];
    else if (hue < 180) [r1, g1, b1] = [0, c, x];
    else if (hue < 240) [r1, g1, b1] = [0, x, c];
    else if (hue < 300) [r1, g1, b1] = [x, 0, c];
    else [r1, g1, b1] = [c, 0, x];

    return {
      r: clamp(Math.round((r1 + m) * 255), 0, 255),
      g: clamp(Math.round((g1 + m) * 255), 0, 255),
      b: clamp(Math.round((b1 + m) * 255), 0, 255),
    };
  }

  function rgbToHsv(r, g, b) {
    const rn = clamp(r, 0, 255) / 255;
    const gn = clamp(g, 0, 255) / 255;
    const bn = clamp(b, 0, 255) / 255;
    const max = Math.max(rn, gn, bn);
    const min = Math.min(rn, gn, bn);
    const delta = max - min;
    let h = 0;
    if (delta !== 0) {
      if (max === rn) h = ((gn - bn) / delta) % 6;
      else if (max === gn) h = (bn - rn) / delta + 2;
      else h = (rn - gn) / delta + 4;
      h = wrapHue(h * 60);
    }
    const s = max === 0 ? 0 : Math.round((delta / max) * 100);
    const v = Math.round(max * 100);
    return { h, s, v };
  }

  function rgbToCmyk(r, g, b) {
    const rn = clamp(r, 0, 255) / 255;
    const gn = clamp(g, 0, 255) / 255;
    const bn = clamp(b, 0, 255) / 255;
    const k = 1 - Math.max(rn, gn, bn);
    if (k >= 0.9999) {
      return { c: 0, m: 0, y: 0, k: 100 };
    }
    return {
      c: Math.round(((1 - rn - k) / (1 - k)) * 100),
      m: Math.round(((1 - gn - k) / (1 - k)) * 100),
      y: Math.round(((1 - bn - k) / (1 - k)) * 100),
      k: Math.round(k * 100),
    };
  }

  function relativeLuminance({ r, g, b }) {
    const transform = (channel) => {
      const unit = clamp(channel, 0, 255) / 255;
      return unit <= 0.03928 ? unit / 12.92 : ((unit + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * transform(r) + 0.7152 * transform(g) + 0.0722 * transform(b);
  }

  function contrastRatio(hexA, hexB) {
    const lumA = relativeLuminance(hexToRgb(hexA));
    const lumB = relativeLuminance(hexToRgb(hexB));
    const brightest = Math.max(lumA, lumB);
    const darkest = Math.min(lumA, lumB);
    return Number(((brightest + 0.05) / (darkest + 0.05)).toFixed(2));
  }

  function wcagRating(ratio) {
    if (ratio >= 7) return { badge: "AAA", summary: "Crisp on all text" };
    if (ratio >= 4.5) return { badge: "AA", summary: "Great for body & UI" };
    if (ratio >= 3) return { badge: "AA Large", summary: "Headings & icons only" };
    return { badge: "Low", summary: "Decorative / low contrast" };
  }

  function mixColors(hexA, hexB, weightB = 0.5) {
    const ratio = clamp(Number(weightB) || 0, 0, 1);
    const a = hexToRgb(hexA);
    const b = hexToRgb(hexB);
    return rgbToHex(
      a.r + (b.r - a.r) * ratio,
      a.g + (b.g - a.g) * ratio,
      a.b + (b.b - a.b) * ratio
    );
  }

  function computeScale(hex, steps = 9) {
    const { r, g, b } = hexToRgb(hex);
    const { h, s } = rgbToHsl(r, g, b);
    const result = [];
    for (let index = 0; index < steps; index += 1) {
      const lightness = Math.round(92 - (index * 76) / Math.max(1, steps - 1));
      const adjustedSat = lightness > 84 ? Math.max(24, Math.round(s * 0.78)) : s;
      const rgb = hslToRgb(h, adjustedSat, lightness);
      result.push(rgbToHex(rgb.r, rgb.g, rgb.b));
    }
    return result;
  }

  function computeHarmonies(hex, mode = "candy") {
    const { r, g, b } = hexToRgb(hex);
    const { h, s, l } = rgbToHsl(r, g, b);
    const make = (hueOffset, satVal = s, lightVal = l, label = "") => {
      const rgb = hslToRgb(wrapHue(h + hueOffset), clamp(satVal, 15, 96), clamp(lightVal, 18, 90));
      return { hex: rgbToHex(rgb.r, rgb.g, rgb.b), label };
    };

    switch (mode) {
      case "complementary":
        return [
          { hex: normalizeHex(hex), label: "Base" },
          make(180, s, l, "Complement"),
          make(0, Math.max(28, s - 18), Math.min(88, l + 16), "Soft Base"),
          make(180, Math.max(28, s - 15), Math.min(86, l + 14), "Soft Comp"),
          make(180, Math.min(95, s + 8), Math.max(24, l - 18), "Deep Comp"),
        ];
      case "analogous":
        return [
          make(-40, s, l, "-40° Warm"),
          make(-20, s, l, "-20° Near"),
          { hex: normalizeHex(hex), label: "Base" },
          make(20, s, l, "+20° Near"),
          make(40, s, l, "+40° Cool"),
        ];
      case "triadic":
        return [
          { hex: normalizeHex(hex), label: "Base" },
          make(120, s, l, "Triad +120°"),
          make(240, s, l, "Triad +240°"),
          make(120, Math.max(35, s - 16), Math.min(86, l + 14), "Pastel +120°"),
          make(240, Math.max(35, s - 16), Math.min(86, l + 14), "Pastel +240°"),
        ];
      case "split":
        return [
          { hex: normalizeHex(hex), label: "Base" },
          make(150, s, l, "Split +150°"),
          make(210, s, l, "Split +210°"),
          make(0, Math.max(30, s - 20), Math.min(88, l + 16), "Creamy Tint"),
          make(180, Math.min(90, s), Math.max(24, l - 22), "Anchor Shade"),
        ];
      case "tetradic":
        return [
          { hex: normalizeHex(hex), label: "Base" },
          make(90, s, l, "+90° Accent"),
          make(180, s, l, "+180° Opposite"),
          make(270, s, l, "+270° Partner"),
          make(45, Math.max(35, s - 15), Math.min(86, l + 14), "Highlight"),
        ];
      case "candy":
      default:
        return [
          { hex: normalizeHex(hex), label: "Spun Sugar" },
          make(28, Math.max(68, s), Math.min(85, Math.max(72, l)), "Peach Puff"),
          make(165, Math.max(58, s - 8), Math.min(84, Math.max(72, l)), "Mint Fizz"),
          make(215, Math.max(66, s), Math.min(85, Math.max(74, l)), "Blueberry Cloud"),
          make(290, Math.max(62, s), Math.min(84, Math.max(74, l)), "Lavender Taffy"),
        ];
    }
  }

  function describeColorVibe(hex) {
    const { r, g, b } = hexToRgb(hex);
    const { h, s, l } = rgbToHsl(r, g, b);
    if (l >= 93) return "Whipped Sugar Cream";
    if (l <= 14) return "Roasted Espresso Ink";
    if (s <= 12) return l > 60 ? "Warm Flour Dust" : "Cast-Iron Skillet";

    const prefix = l >= 75 ? "Cotton Candy" : l <= 35 ? "Velvet" : "Cozy";
    if (h >= 315 || h < 12) return `${prefix} Berry Pink`;
    if (h < 32) return `${prefix} Coral Glaze`;
    if (h < 62) return `${prefix} Honey Butter`;
    if (h < 150) return `${prefix} Sage Mint`;
    if (h < 200) return `${prefix} Seafoam Teal`;
    if (h < 255) return `${prefix} Blueberry Sky`;
    return `${prefix} Lilac Frosting`;
  }

  function symmetryPoints(x, y, width, height, mode = "none") {
    const cx = width / 2;
    const cy = height / 2;
    const mx = width - x;
    const my = height - y;

    if (mode === "horizontal") {
      return [
        { x, y },
        { x: mx, y },
      ];
    }
    if (mode === "vertical") {
      return [
        { x, y },
        { x, y: my },
      ];
    }
    if (mode === "quad") {
      return [
        { x, y },
        { x: mx, y },
        { x, y: my },
        { x: mx, y: my },
      ];
    }
    if (mode === "mandala") {
      const dx = x - cx;
      const dy = y - cy;
      const points = [];
      for (let i = 0; i < 8; i += 1) {
        const angle = (i * Math.PI) / 4;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        points.push({
          x: cx + dx * cos - dy * sin,
          y: cy + dx * sin + dy * cos,
        });
      }
      return points;
    }
    return [{ x, y }];
  }

  /* ---------- Art Studio Utility ---------- */

  const STUDIO_SWATCHES = [
    ["#f49ac2", "Cotton Candy"],
    ["#ff66a3", "Bubblegum"],
    ["#d81b60", "Raspberry Jam"],
    ["#e53935", "Cherry Glaze"],
    ["#e78167", "Coral Glaze"],
    ["#fb8c00", "Tangerine"],
    ["#ffb798", "Peach Cream"],
    ["#f6a637", "Apricot Tart"],
    ["#efb94f", "Honey Butter"],
    ["#fdd835", "Lemon Zest"],
    ["#c0ca33", "Key Lime"],
    ["#66bb6a", "Mint Leaf"],
    ["#91b782", "Sage Leaf"],
    ["#2e7d32", "Forest Herb"],
    ["#4db6ac", "Seafoam"],
    ["#82b9b3", "Teal Cup"],
    ["#29b6f6", "Sky Splash"],
    ["#88aeca", "Blueberry Frost"],
    ["#3949ab", "Cobalt Berry"],
    ["#5e35b1", "Grape Soda"],
    ["#8e24aa", "Plum Tart"],
    ["#c4add0", "Lilac Sugar"],
    ["#e1bee7", "Lavender Mist"],
    ["#ffd1e6", "Spun Sugar"],
    ["#fff1cf", "Waffle Cream"],
    ["#efd39b", "Parchment"],
    ["#c98550", "Cinnamon"],
    ["#a96840", "Caramel Wood"],
    ["#6e3f29", "Cocoa Bean"],
    ["#4f2f23", "Espresso Ink"],
    ["#262626", "Charcoal"],
    ["#ffffff", "Powdered Sugar"],
  ];

  const PAPER_PRESETS = {
    cream: { label: "Cream Paper", bg: "#fff6e0" },
    candy: { label: "Cotton Candy", bg: "#ffe6f1" },
    white: { label: "Pure White", bg: "#ffffff" },
    night: { label: "Chalkboard", bg: "#2c1d18" },
  };

  function renderArtStudio() {
    const swatchesMarkup = STUDIO_SWATCHES.map(
      ([hex, name], index) =>
        `<button type="button" class="art-swatch-btn${index === 0 ? " active" : ""}" data-art-swatch="${hex}" style="background:${hex}" aria-label="${escapeMarkup(name)} (${hex})" title="${escapeMarkup(name)}"></button>`
    ).join("");

    return `
      <div class="art-studio-layout">
        <section class="game-panel panel-pink art-easel-panel">
          <div class="dev-tool-heading">
            <div>
              <h3>Cotton Candy Easel</h3>
              <p class="panel-note">Paint freehand, snap to a pixel grid, stamp kitchen treats, or spin up an 8-way kaleidoscope.</p>
            </div>
            <span class="dev-local-badge" id="artStatusBadge">BRUSH · 1×</span>
          </div>

          <div class="art-canvas-stage" id="artCanvasStage">
            <canvas id="artMainCanvas" width="640" height="440" aria-label="Art Studio drawing canvas"></canvas>
            <canvas id="artPreviewCanvas" width="640" height="440" aria-hidden="true"></canvas>
          </div>

          <div class="button-row art-action-bar">
            <button type="button" class="game-button game-button-small" id="artUndoBtn" aria-label="Undo stroke">↶ UNDO</button>
            <button type="button" class="game-button game-button-small" id="artRedoBtn" aria-label="Redo stroke">↷ REDO</button>
            <button type="button" class="game-button game-button-small game-button-pink" id="artSurpriseBtn">✦ SURPRISE ART</button>
            <button type="button" class="game-button game-button-small game-button-coral" id="artClearBtn">CLEAR</button>
            <button type="button" class="game-button game-button-small game-button-teal" id="artCopyBtn">COPY PNG</button>
            <button type="button" class="game-button game-button-small game-button-sage" id="artDownloadBtn">DOWNLOAD PNG</button>
          </div>
        </section>

        <section class="game-panel panel-honey art-controls-panel">
          <div class="field-stack">
            <span class="field-title">Drawing tool</span>
            <div class="segmented art-tool-grid" role="group" aria-label="Drawing tools">
              <button type="button" class="tab-button active" data-art-tool="brush" aria-pressed="true">🖌 Brush</button>
              <button type="button" class="tab-button" data-art-tool="marker" aria-pressed="false">🖍 Marker</button>
              <button type="button" class="tab-button" data-art-tool="pixel" aria-pressed="false">▦ Pixel</button>
              <button type="button" class="tab-button" data-art-tool="spray" aria-pressed="false">🫧 Spray</button>
              <button type="button" class="tab-button" data-art-tool="rainbow" aria-pressed="false">🌈 Rainbow</button>
              <button type="button" class="tab-button" data-art-tool="fill" aria-pressed="false">🪣 Fill</button>
              <button type="button" class="tab-button" data-art-tool="line" aria-pressed="false">╱ Line</button>
              <button type="button" class="tab-button" data-art-tool="rect" aria-pressed="false">▭ Box</button>
              <button type="button" class="tab-button" data-art-tool="circle" aria-pressed="false">◯ Circle</button>
              <button type="button" class="tab-button" data-art-tool="stamp" aria-pressed="false">✦ Stamp</button>
              <button type="button" class="tab-button" data-art-tool="eraser" aria-pressed="false">⌫ Eraser</button>
            </div>
          </div>

          <div class="field-stack">
            <span class="field-title">Kitchen stamps</span>
            <div class="segmented art-stamp-grid" role="group" aria-label="Stamp shapes">
              <button type="button" class="tab-button active" data-art-stamp="waffle" aria-pressed="true">🧇 Waffle</button>
              <button type="button" class="tab-button" data-art-stamp="heart" aria-pressed="false">♥ Heart</button>
              <button type="button" class="tab-button" data-art-stamp="star" aria-pressed="false">★ Star</button>
              <button type="button" class="tab-button" data-art-stamp="sparkle" aria-pressed="false">✦ Sparkle</button>
              <button type="button" class="tab-button" data-art-stamp="flower" aria-pressed="false">✿ Blossom</button>
            </div>
          </div>

          <div class="field-stack">
            <span class="field-title">Mirror &amp; symmetry</span>
            <div class="segmented" role="group" aria-label="Symmetry modes">
              <button type="button" class="tab-button active" data-art-symmetry="none" aria-pressed="true">1× Off</button>
              <button type="button" class="tab-button" data-art-symmetry="horizontal" aria-pressed="false">↔ Mirror X</button>
              <button type="button" class="tab-button" data-art-symmetry="vertical" aria-pressed="false">↕ Mirror Y</button>
              <button type="button" class="tab-button" data-art-symmetry="quad" aria-pressed="false">✦ 4-Way</button>
              <button type="button" class="tab-button" data-art-symmetry="mandala" aria-pressed="false">✺ 8-Way</button>
            </div>
          </div>

          <div class="field-stack">
            <div class="art-slider-header">
              <label for="artColorInput">Paint palette (32 colors)</label>
              <strong id="artColorHexLabel">#F49AC2</strong>
            </div>
            <div class="art-color-bar">
              <input type="color" id="artColorInput" class="art-color-well" value="#f49ac2" aria-label="Custom paint color" />
              <div class="art-swatch-grid" id="artSwatchGrid">${swatchesMarkup}</div>
            </div>
          </div>

          <div class="art-sliders-row">
            <div class="field-stack">
              <div class="art-slider-header">
                <label for="artBrushSize">Brush size</label>
                <strong id="artBrushSizeLabel">14 px</strong>
              </div>
              <input type="range" id="artBrushSize" class="art-range" min="2" max="56" value="14" />
            </div>
            <div class="field-stack">
              <div class="art-slider-header">
                <label for="artBrushOpacity">Opacity</label>
                <strong id="artBrushOpacityLabel">100%</strong>
              </div>
              <input type="range" id="artBrushOpacity" class="art-range" min="15" max="100" value="100" />
            </div>
          </div>

          <div class="field-stack">
            <span class="field-title">Canvas paper &amp; guides</span>
            <div class="segmented" role="group" aria-label="Canvas paper color">
              <button type="button" class="tab-button active" data-art-paper="cream" aria-pressed="true">Cream</button>
              <button type="button" class="tab-button" data-art-paper="candy" aria-pressed="false">Candy Pink</button>
              <button type="button" class="tab-button" data-art-paper="white" aria-pressed="false">White</button>
              <button type="button" class="tab-button" data-art-paper="night" aria-pressed="false">Chalkboard</button>
              <button type="button" class="tab-button" id="artGridToggle" aria-pressed="false">▦ Grid</button>
            </div>
          </div>
        </section>
      </div>`;
  }

  function initArtStudio(root, api = {}) {
    const showToast = api.showToast || (() => {});
    const addCleanup = api.addCleanup || (() => {});

    const mainCanvas = root.querySelector("#artMainCanvas");
    const previewCanvas = root.querySelector("#artPreviewCanvas");
    const ctx = mainCanvas.getContext("2d", { willReadFrequently: true });
    const previewCtx = previewCanvas.getContext("2d");

    const statusBadge = root.querySelector("#artStatusBadge");
    const colorInput = root.querySelector("#artColorInput");
    const colorHexLabel = root.querySelector("#artColorHexLabel");
    const sizeRange = root.querySelector("#artBrushSize");
    const sizeLabel = root.querySelector("#artBrushSizeLabel");
    const opacityRange = root.querySelector("#artBrushOpacity");
    const opacityLabel = root.querySelector("#artBrushOpacityLabel");
    const gridToggle = root.querySelector("#artGridToggle");

    let activeTool = "brush";
    let activeStamp = "waffle";
    let symmetryMode = "none";
    let activeColor = "#f49ac2";
    let brushSize = 14;
    let brushOpacity = 1;
    let paperKey = "cream";
    let showGrid = false;
    let rainbowHue = 330;

    let isDrawing = false;
    let startPoint = null;
    let lastPoint = null;
    const undoStack = [];
    const redoStack = [];
    const MAX_HISTORY = 24;

    function updateStatusBadge() {
      const symLabels = {
        none: "1×",
        horizontal: "↔ 2×",
        vertical: "↕ 2×",
        quad: "✦ 4×",
        mandala: "✺ 8×",
      };
      statusBadge.textContent = `${activeTool.toUpperCase()} · ${symLabels[symmetryMode] || "1×"}`;
    }

    function pushHistory() {
      try {
        const snapshot = ctx.getImageData(0, 0, mainCanvas.width, mainCanvas.height);
        undoStack.push(snapshot);
        if (undoStack.length > MAX_HISTORY) undoStack.shift();
        redoStack.length = 0;
      } catch {
        // Ignore security/canvas errors in restricted environments
      }
    }

    function fillPaper(key, resetHistory = false) {
      paperKey = PAPER_PRESETS[key] ? key : "cream";
      ctx.save();
      ctx.globalAlpha = 1;
      ctx.fillStyle = PAPER_PRESETS[paperKey].bg;
      ctx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
      ctx.restore();
      if (resetHistory) {
        undoStack.length = 0;
        redoStack.length = 0;
        pushHistory();
      }
      renderGuides();
    }

    function renderGuides() {
      previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
      const w = previewCanvas.width;
      const h = previewCanvas.height;

      if (showGrid || activeTool === "pixel") {
        const step = activeTool === "pixel" ? Math.max(8, Math.min(32, brushSize)) : 20;
        previewCtx.save();
        previewCtx.strokeStyle = paperKey === "night" ? "rgba(255, 241, 207, 0.14)" : "rgba(79, 47, 35, 0.11)";
        previewCtx.lineWidth = 1;
        previewCtx.beginPath();
        for (let x = step; x < w; x += step) {
          previewCtx.moveTo(x + 0.5, 0);
          previewCtx.lineTo(x + 0.5, h);
        }
        for (let y = step; y < h; y += step) {
          previewCtx.moveTo(0, y + 0.5);
          previewCtx.lineTo(w, y + 0.5);
        }
        previewCtx.stroke();
        previewCtx.restore();
      }

      if (symmetryMode !== "none") {
        previewCtx.save();
        previewCtx.strokeStyle = "rgba(244, 154, 194, 0.75)";
        previewCtx.lineWidth = 2;
        previewCtx.setLineDash([6, 6]);
        previewCtx.beginPath();
        if (symmetryMode === "horizontal" || symmetryMode === "quad" || symmetryMode === "mandala") {
          previewCtx.moveTo(w / 2, 0);
          previewCtx.lineTo(w / 2, h);
        }
        if (symmetryMode === "vertical" || symmetryMode === "quad" || symmetryMode === "mandala") {
          previewCtx.moveTo(0, h / 2);
          previewCtx.lineTo(w, h / 2);
        }
        if (symmetryMode === "mandala") {
          const r = Math.hypot(w, h);
          previewCtx.moveTo(w / 2 - r, h / 2 - r);
          previewCtx.lineTo(w / 2 + r, h / 2 + r);
          previewCtx.moveTo(w / 2 + r, h / 2 - r);
          previewCtx.lineTo(w / 2 - r, h / 2 + r);
        }
        previewCtx.stroke();
        previewCtx.restore();
      }
    }

    function canvasCoords(event) {
      const rect = mainCanvas.getBoundingClientRect();
      const scaleX = mainCanvas.width / Math.max(1, rect.width);
      const scaleY = mainCanvas.height / Math.max(1, rect.height);
      return {
        x: clamp((event.clientX - rect.left) * scaleX, 0, mainCanvas.width),
        y: clamp((event.clientY - rect.top) * scaleY, 0, mainCanvas.height),
      };
    }

    function strokeColorForTool() {
      if (activeTool === "eraser") return PAPER_PRESETS[paperKey].bg;
      if (activeTool === "rainbow") {
        rainbowHue = wrapHue(rainbowHue + 4);
        const { r, g, b } = hslToRgb(rainbowHue, 85, 68);
        return rgbToHex(r, g, b);
      }
      return activeColor;
    }

    function drawStampShape(targetCtx, x, y, stamp, size, color) {
      const radius = Math.max(10, size * 1.4);
      targetCtx.save();
      targetCtx.translate(x, y);
      targetCtx.fillStyle = color;
      targetCtx.strokeStyle = "#4f2f23";
      targetCtx.lineWidth = Math.max(2, radius * 0.12);
      targetCtx.lineJoin = "round";
      targetCtx.lineCap = "round";

      if (stamp === "heart") {
        targetCtx.beginPath();
        targetCtx.moveTo(0, radius * 0.75);
        targetCtx.bezierCurveTo(-radius * 1.1, radius * 0.1, -radius * 0.95, -radius * 0.85, 0, -radius * 0.25);
        targetCtx.bezierCurveTo(radius * 0.95, -radius * 0.85, radius * 1.1, radius * 0.1, 0, radius * 0.75);
        targetCtx.closePath();
        targetCtx.fill();
        targetCtx.stroke();
      } else if (stamp === "star" || stamp === "sparkle") {
        const spikes = stamp === "sparkle" ? 4 : 5;
        const inner = stamp === "sparkle" ? radius * 0.32 : radius * 0.45;
        targetCtx.beginPath();
        for (let i = 0; i < spikes * 2; i += 1) {
          const r = i % 2 === 0 ? radius : inner;
          const angle = (i * Math.PI) / spikes - Math.PI / 2;
          const px = Math.cos(angle) * r;
          const py = Math.sin(angle) * r;
          if (i === 0) targetCtx.moveTo(px, py);
          else targetCtx.lineTo(px, py);
        }
        targetCtx.closePath();
        targetCtx.fill();
        targetCtx.stroke();
      } else if (stamp === "flower") {
        const petals = 6;
        for (let i = 0; i < petals; i += 1) {
          const angle = (i * Math.PI * 2) / petals;
          targetCtx.beginPath();
          targetCtx.arc(
            Math.cos(angle) * radius * 0.52,
            Math.sin(angle) * radius * 0.52,
            radius * 0.42,
            0,
            Math.PI * 2
          );
          targetCtx.fill();
          targetCtx.stroke();
        }
        targetCtx.beginPath();
        targetCtx.fillStyle = "#efb94f";
        targetCtx.arc(0, 0, radius * 0.32, 0, Math.PI * 2);
        targetCtx.fill();
        targetCtx.stroke();
      } else {
        const box = radius * 1.5;
        const half = box / 2;
        targetCtx.beginPath();
        targetCtx.roundRect(-half, -half, box, box, radius * 0.28);
        targetCtx.fill();
        targetCtx.stroke();
        targetCtx.beginPath();
        targetCtx.moveTo(-half * 0.35, -half * 0.78);
        targetCtx.lineTo(-half * 0.35, half * 0.78);
        targetCtx.moveTo(half * 0.35, -half * 0.78);
        targetCtx.lineTo(half * 0.35, half * 0.78);
        targetCtx.moveTo(-half * 0.78, -half * 0.35);
        targetCtx.lineTo(half * 0.78, -half * 0.35);
        targetCtx.moveTo(-half * 0.78, half * 0.35);
        targetCtx.lineTo(half * 0.78, half * 0.35);
        targetCtx.stroke();
      }
      targetCtx.restore();
    }

    function drawSegmentWithSymmetry(from, to) {
      const w = mainCanvas.width;
      const h = mainCanvas.height;
      const color = strokeColorForTool();

      if (activeTool === "pixel") {
        const cell = Math.max(8, Math.min(32, brushSize));
        const pts = symmetryPoints(to.x, to.y, w, h, symmetryMode);
        ctx.save();
        ctx.globalAlpha = brushOpacity;
        ctx.fillStyle = color;
        pts.forEach((pt) => {
          const gx = Math.floor(pt.x / cell) * cell;
          const gy = Math.floor(pt.y / cell) * cell;
          ctx.fillRect(gx, gy, cell, cell);
        });
        ctx.restore();
        return;
      }

      if (activeTool === "spray") {
        const pts = symmetryPoints(to.x, to.y, w, h, symmetryMode);
        const density = Math.max(10, Math.round(brushSize * 1.4));
        const radius = Math.max(6, brushSize * 1.1);
        ctx.save();
        ctx.globalAlpha = brushOpacity * 0.65;
        ctx.fillStyle = color;
        pts.forEach((pt) => {
          for (let i = 0; i < density; i += 1) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * radius;
            ctx.fillRect(pt.x + Math.cos(angle) * dist, pt.y + Math.sin(angle) * dist, 2, 2);
          }
        });
        ctx.restore();
        return;
      }

      const fromPts = symmetryPoints(from.x, from.y, w, h, symmetryMode);
      const toPts = symmetryPoints(to.x, to.y, w, h, symmetryMode);

      ctx.save();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = color;
      ctx.lineWidth = activeTool === "marker" ? brushSize * 1.45 : brushSize;
      ctx.globalAlpha = activeTool === "marker" ? Math.min(0.32, brushOpacity * 0.35) : brushOpacity;

      for (let index = 0; index < fromPts.length; index += 1) {
        ctx.beginPath();
        ctx.moveTo(fromPts[index].x, fromPts[index].y);
        ctx.lineTo(toPts[index].x, toPts[index].y);
        ctx.stroke();
      }
      ctx.restore();
    }

    function drawShape(targetCtx, from, to) {
      targetCtx.save();
      targetCtx.strokeStyle = activeColor;
      targetCtx.fillStyle = activeColor;
      targetCtx.lineWidth = brushSize;
      targetCtx.lineCap = "round";
      targetCtx.lineJoin = "round";
      targetCtx.globalAlpha = brushOpacity;

      const fromPts = symmetryPoints(from.x, from.y, mainCanvas.width, mainCanvas.height, symmetryMode);
      const toPts = symmetryPoints(to.x, to.y, mainCanvas.width, mainCanvas.height, symmetryMode);

      for (let i = 0; i < fromPts.length; i += 1) {
        const a = fromPts[i];
        const b = toPts[i];
        targetCtx.beginPath();
        if (activeTool === "line") {
          targetCtx.moveTo(a.x, a.y);
          targetCtx.lineTo(b.x, b.y);
          targetCtx.stroke();
        } else if (activeTool === "rect") {
          targetCtx.strokeRect(
            Math.min(a.x, b.x),
            Math.min(a.y, b.y),
            Math.abs(b.x - a.x),
            Math.abs(b.y - a.y)
          );
        } else if (activeTool === "circle") {
          const rx = Math.abs(b.x - a.x) / 2;
          const ry = Math.abs(b.y - a.y) / 2;
          const cx = (a.x + b.x) / 2;
          const cy = (a.y + b.y) / 2;
          targetCtx.ellipse(cx, cy, Math.max(1, rx), Math.max(1, ry), 0, 0, Math.PI * 2);
          targetCtx.stroke();
        }
      }
      targetCtx.restore();
    }

    function floodFillCanvas(startX, startY, fillHex) {
      const width = mainCanvas.width;
      const height = mainCanvas.height;
      const sx = clamp(Math.floor(startX), 0, width - 1);
      const sy = clamp(Math.floor(startY), 0, height - 1);
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      const fillRgb = hexToRgb(fillHex);

      const startIdx = (sy * width + sx) * 4;
      const targetR = data[startIdx];
      const targetG = data[startIdx + 1];
      const targetB = data[startIdx + 2];
      const targetA = data[startIdx + 3];

      const tolerance = 24;
      if (
        Math.abs(targetR - fillRgb.r) <= 4 &&
        Math.abs(targetG - fillRgb.g) <= 4 &&
        Math.abs(targetB - fillRgb.b) <= 4 &&
        targetA >= 250
      ) {
        return;
      }

      const visited = new Uint8Array(width * height);
      const stack = [sx + sy * width];
      visited[sx + sy * width] = 1;

      while (stack.length > 0) {
        const pos = stack.pop();
        const px = pos % width;
        const py = (pos - px) / width;
        const idx = pos * 4;

        data[idx] = fillRgb.r;
        data[idx + 1] = fillRgb.g;
        data[idx + 2] = fillRgb.b;
        data[idx + 3] = 255;

        const neighbors = [];
        if (px > 0) neighbors.push(pos - 1);
        if (px < width - 1) neighbors.push(pos + 1);
        if (py > 0) neighbors.push(pos - width);
        if (py < height - 1) neighbors.push(pos + width);

        for (let i = 0; i < neighbors.length; i += 1) {
          const nPos = neighbors[i];
          if (visited[nPos]) continue;
          const nIdx = nPos * 4;
          if (
            Math.abs(data[nIdx] - targetR) <= tolerance &&
            Math.abs(data[nIdx + 1] - targetG) <= tolerance &&
            Math.abs(data[nIdx + 2] - targetB) <= tolerance &&
            Math.abs(data[nIdx + 3] - targetA) <= tolerance
          ) {
            visited[nPos] = 1;
            stack.push(nPos);
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);
    }

    function paintSurpriseArt() {
      const w = mainCanvas.width;
      const h = mainCanvas.height;
      const cx = w / 2;
      const cy = h / 2;

      ctx.save();
      ctx.globalAlpha = 1;
      ctx.fillStyle = PAPER_PRESETS[paperKey].bg;
      ctx.fillRect(0, 0, w, h);

      const palette = ["#f49ac2", "#ff66a3", "#efb94f", "#82b9b3", "#c4add0", "#e78167", "#91b782", "#29b6f6"];
      const petals = 12;
      for (let ring = 3; ring >= 1; ring -= 1) {
        const radius = ring * 44;
        const ringColor = palette[(ring + Math.floor(Math.random() * palette.length)) % palette.length];
        for (let i = 0; i < petals; i += 1) {
          const angle = (i * Math.PI * 2) / petals + ring * 0.26;
          const px = cx + Math.cos(angle) * radius;
          const py = cy + Math.sin(angle) * radius;
          ctx.beginPath();
          ctx.fillStyle = ringColor;
          ctx.strokeStyle = "#4f2f23";
          ctx.lineWidth = 4;
          ctx.arc(px, py, 22 + ring * 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
      }

      const stamps = ["waffle", "heart", "star", "sparkle", "flower"];
      const chosenStamp = stamps[Math.floor(Math.random() * stamps.length)];
      drawStampShape(ctx, cx, cy, chosenStamp, 22, "#f49ac2");

      for (let i = 0; i < 8; i += 1) {
        const angle = (i * Math.PI) / 4;
        const sx = cx + Math.cos(angle) * 172;
        const sy = cy + Math.sin(angle) * 145;
        drawStampShape(ctx, sx, sy, i % 2 === 0 ? "sparkle" : "heart", 10, palette[i % palette.length]);
      }

      ctx.restore();
      pushHistory();
      showToast("Fresh cotton-candy mandala baked!");
    }

    mainCanvas.addEventListener("pointerdown", (event) => {
      if (event.button !== undefined && event.button !== 0) return;
      event.preventDefault();
      mainCanvas.setPointerCapture?.(event.pointerId);
      const pt = canvasCoords(event);

      if (activeTool === "fill") {
        floodFillCanvas(pt.x, pt.y, activeColor);
        pushHistory();
        return;
      }

      if (activeTool === "stamp") {
        const pts = symmetryPoints(pt.x, pt.y, mainCanvas.width, mainCanvas.height, symmetryMode);
        ctx.save();
        ctx.globalAlpha = brushOpacity;
        pts.forEach((symPt) => {
          drawStampShape(ctx, symPt.x, symPt.y, activeStamp, brushSize, activeColor);
        });
        ctx.restore();
        pushHistory();
        return;
      }

      isDrawing = true;
      startPoint = pt;
      lastPoint = pt;

      if (activeTool !== "line" && activeTool !== "rect" && activeTool !== "circle") {
        drawSegmentWithSymmetry(pt, pt);
      }
    });

    mainCanvas.addEventListener("pointermove", (event) => {
      if (!isDrawing) return;
      event.preventDefault();
      const pt = canvasCoords(event);

      if (activeTool === "line" || activeTool === "rect" || activeTool === "circle") {
        renderGuides();
        drawShape(previewCtx, startPoint, pt);
        return;
      }

      drawSegmentWithSymmetry(lastPoint, pt);
      lastPoint = pt;
    });

    function finishStroke(event) {
      if (!isDrawing) return;
      if (event && (activeTool === "line" || activeTool === "rect" || activeTool === "circle")) {
        const pt = canvasCoords(event);
        drawShape(ctx, startPoint, pt);
        renderGuides();
      }
      isDrawing = false;
      startPoint = null;
      lastPoint = null;
      pushHistory();
    }

    mainCanvas.addEventListener("pointerup", finishStroke);
    mainCanvas.addEventListener("pointercancel", () => {
      isDrawing = false;
      renderGuides();
    });

    root.querySelectorAll("[data-art-tool]").forEach((button) => {
      button.addEventListener("click", () => {
        activeTool = button.dataset.artTool;
        root.querySelectorAll("[data-art-tool]").forEach((btn) => {
          const isActive = btn === button;
          btn.classList.toggle("active", isActive);
          btn.setAttribute("aria-pressed", String(isActive));
        });
        updateStatusBadge();
        renderGuides();
      });
    });

    root.querySelectorAll("[data-art-stamp]").forEach((button) => {
      button.addEventListener("click", () => {
        activeStamp = button.dataset.artStamp;
        root.querySelectorAll("[data-art-stamp]").forEach((btn) => {
          const isActive = btn === button;
          btn.classList.toggle("active", isActive);
          btn.setAttribute("aria-pressed", String(isActive));
        });
        const stampToolBtn = root.querySelector('[data-art-tool="stamp"]');
        if (stampToolBtn && activeTool !== "stamp") {
          stampToolBtn.click();
        }
      });
    });

    root.querySelectorAll("[data-art-symmetry]").forEach((button) => {
      button.addEventListener("click", () => {
        symmetryMode = button.dataset.artSymmetry;
        root.querySelectorAll("[data-art-symmetry]").forEach((btn) => {
          const isActive = btn === button;
          btn.classList.toggle("active", isActive);
          btn.setAttribute("aria-pressed", String(isActive));
        });
        updateStatusBadge();
        renderGuides();
      });
    });

    function selectColor(hex) {
      activeColor = normalizeHex(hex);
      colorInput.value = activeColor;
      colorHexLabel.textContent = activeColor.toUpperCase();
      root.querySelectorAll("[data-art-swatch]").forEach((swatch) => {
        swatch.classList.toggle("active", swatch.dataset.artSwatch.toLowerCase() === activeColor);
      });
      if (activeTool === "eraser") {
        root.querySelector('[data-art-tool="brush"]')?.click();
      }
    }

    colorInput.addEventListener("input", () => selectColor(colorInput.value));
    root.querySelectorAll("[data-art-swatch]").forEach((swatch) => {
      swatch.addEventListener("click", () => selectColor(swatch.dataset.artSwatch));
    });

    sizeRange.addEventListener("input", () => {
      brushSize = Number(sizeRange.value) || 14;
      sizeLabel.textContent = `${brushSize} px`;
      renderGuides();
    });

    opacityRange.addEventListener("input", () => {
      const pct = Number(opacityRange.value) || 100;
      brushOpacity = clamp(pct / 100, 0.15, 1);
      opacityLabel.textContent = `${pct}%`;
    });

    root.querySelectorAll("[data-art-paper]").forEach((button) => {
      button.addEventListener("click", () => {
        root.querySelectorAll("[data-art-paper]").forEach((btn) => {
          const isActive = btn === button;
          btn.classList.toggle("active", isActive);
          btn.setAttribute("aria-pressed", String(isActive));
        });
        fillPaper(button.dataset.artPaper, false);
        pushHistory();
      });
    });

    gridToggle.addEventListener("click", () => {
      showGrid = !showGrid;
      gridToggle.classList.toggle("active", showGrid);
      gridToggle.setAttribute("aria-pressed", String(showGrid));
      renderGuides();
    });

    function undo() {
      if (undoStack.length <= 1) {
        showToast("Nothing more to undo!");
        return;
      }
      const current = undoStack.pop();
      redoStack.push(current);
      const prev = undoStack[undoStack.length - 1];
      ctx.putImageData(prev, 0, 0);
    }

    function redo() {
      if (!redoStack.length) {
        showToast("Nothing to redo!");
        return;
      }
      const next = redoStack.pop();
      undoStack.push(next);
      ctx.putImageData(next, 0, 0);
    }

    root.querySelector("#artUndoBtn").addEventListener("click", undo);
    root.querySelector("#artRedoBtn").addEventListener("click", redo);
    root.querySelector("#artSurpriseBtn").addEventListener("click", paintSurpriseArt);
    root.querySelector("#artClearBtn").addEventListener("click", () => {
      fillPaper(paperKey, false);
      pushHistory();
      showToast("Fresh canvas ready!");
    });

    root.querySelector("#artDownloadBtn").addEventListener("click", () => {
      mainCanvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "cotton-candy-art.png";
        document.body.append(anchor);
        anchor.click();
        anchor.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        showToast("Artwork downloaded!");
      }, "image/png");
    });

    root.querySelector("#artCopyBtn").addEventListener("click", () => {
      if (navigator.clipboard && typeof window.ClipboardItem === "function") {
        mainCanvas.toBlob(async (blob) => {
          if (!blob) return;
          try {
            await navigator.clipboard.write([new window.ClipboardItem({ "image/png": blob })]);
            showToast("Artwork PNG copied to clipboard!");
          } catch {
            showToast("Use Download PNG in this browser.");
          }
        }, "image/png");
      } else {
        showToast("Use Download PNG in this browser.");
      }
    });

    const onKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
      } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y") {
        event.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    addCleanup(() => window.removeEventListener("keydown", onKeyDown));

    fillPaper("cream", true);
    updateStatusBadge();
  }

  /* ---------- Simplified Color Picker Utility ---------- */

  const SAVED_SWATCHES_KEY = "bite-sized-color-picker-swatches-v1";
  const DEFAULT_SAVED_SWATCHES = [
    "#f49ac2",
    "#ff66a3",
    "#efb94f",
    "#e78167",
    "#82b9b3",
    "#91b782",
    "#29b6f6",
    "#c4add0",
    "#fff1cf",
    "#4f2f23",
  ];

  function renderColorPicker() {
    return `
      <div class="color-picker-layout">
        <section class="game-panel panel-pink cp-loupe-panel">
          <div class="dev-tool-heading">
            <div>
              <h3>Pick a Color</h3>
              <p class="panel-note">Drag inside the color box and slide the rainbow bar to find your shade.</p>
            </div>
            <span class="dev-local-badge" id="cpVibeBadge">Cotton Candy Berry Pink</span>
          </div>

          <div class="cp-picker-stage">
            <div class="cp-sv-wrap">
              <canvas id="cpSvCanvas" width="320" height="200" aria-label="Color saturation and brightness picker"></canvas>
              <span class="cp-sv-cursor" id="cpSvCursor" aria-hidden="true"></span>
            </div>
            <div class="field-stack">
              <div class="art-slider-header">
                <label for="cpHueSlider">Rainbow hue</label>
                <strong id="cpHueDegreeLabel">333°</strong>
              </div>
              <input type="range" id="cpHueSlider" class="cp-hue-slider" min="0" max="360" value="333" />
            </div>
          </div>

          <div class="cp-hero-card">
            <div class="cp-hero-swatch" id="cpHeroSwatch">
              <span class="cp-hero-kicker">SELECTED COLOR</span>
              <strong id="cpHeroHex">#F49AC2</strong>
            </div>
            <div class="button-row cp-hero-actions">
              <label class="game-button game-button-small cp-native-picker-btn" for="cpNativeColor">
                <span>🎨 COLOR WHEEL</span>
                <input type="color" id="cpNativeColor" value="#f49ac2" aria-label="Open system color wheel" />
              </label>
              <button type="button" class="game-button game-button-small game-button-pink" id="cpRandomSweetBtn">✦ RANDOM COLOR</button>
              <button type="button" class="game-button game-button-small game-button-sage" id="cpSaveSwatchBtn">+ SAVE</button>
            </div>
          </div>

          <div class="field-stack">
            <span class="field-title">Saved colors (click to pick)</span>
            <div class="cp-saved-tray" id="cpSavedTray" aria-label="Saved color swatches"></div>
          </div>
        </section>

        <section class="game-panel panel-honey cp-Inspector-panel">
          <div class="dev-tool-heading">
            <div>
              <h3>Copy &amp; Match</h3>
              <p class="panel-note">One-click copy for your color codes, plus ready-made shades and matching colors.</p>
            </div>
          </div>

          <div class="cp-codes-grid">
            <div class="cp-code-row">
              <label for="cpHexField">HEX</label>
              <input class="chunky-input cp-mono-input" id="cpHexField" value="#F49AC2" spellcheck="false" maxlength="7" />
              <button type="button" class="game-button game-button-small game-button-pink" id="cpCopyHex">COPY</button>
            </div>

            <div class="cp-code-row">
              <span class="control-label">RGB</span>
              <input class="chunky-input cp-mono-input" id="cpRgbField" value="rgb(244, 154, 194)" readonly aria-label="RGB color code" />
              <button type="button" class="game-button game-button-small" id="cpCopyRgb">COPY</button>
            </div>

            <div class="cp-code-row">
              <span class="control-label">HSL</span>
              <input class="chunky-input cp-mono-input" id="cpHslField" value="hsl(333, 80%, 78%)" readonly aria-label="HSL color code" />
              <button type="button" class="game-button game-button-small" id="cpCopyHsl">COPY</button>
            </div>
          </div>

          <div class="field-stack">
            <span class="field-title">Light to dark shades (click to pick &amp; copy)</span>
            <div class="cp-scale-strip" id="cpScaleStrip"></div>
          </div>

          <div class="field-stack">
            <span class="field-title">Matching palette (click to pick &amp; copy)</span>
            <div class="cp-harmony-grid" id="cpHarmonyGrid" data-cp-harmony="candy"></div>
          </div>
        </section>
      </div>`;
  }

  function initColorPicker(root, api = {}) {
    const showToast = api.showToast || (() => {});
    const copyGameText = api.copyGameText || ((text, msg) => showToast(msg || `Copied ${text}`));

    const svCanvas = root.querySelector("#cpSvCanvas");
    const svCtx = svCanvas.getContext("2d");
    const svCursor = root.querySelector("#cpSvCursor");
    const hueSlider = root.querySelector("#cpHueSlider");
    const hueDegreeLabel = root.querySelector("#cpHueDegreeLabel");
    const vibeBadge = root.querySelector("#cpVibeBadge");
    const heroSwatch = root.querySelector("#cpHeroSwatch");
    const heroHex = root.querySelector("#cpHeroHex");
    const nativeColor = root.querySelector("#cpNativeColor");
    const savedTray = root.querySelector("#cpSavedTray");

    const hexField = root.querySelector("#cpHexField");
    const rgbField = root.querySelector("#cpRgbField");
    const hslField = root.querySelector("#cpHslField");
    const scaleStrip = root.querySelector("#cpScaleStrip");
    const harmonyGrid = root.querySelector("#cpHarmonyGrid");

    let hsv = { h: 333, s: 23, v: 96 };
    let currentHex = "#f49ac2";
    let savedSwatches = [...DEFAULT_SAVED_SWATCHES];

    try {
      const stored = JSON.parse(window.localStorage.getItem(SAVED_SWATCHES_KEY) || "null");
      if (Array.isArray(stored) && stored.length) {
        savedSwatches = stored.map((item) => normalizeHex(item));
      }
    } catch {
      savedSwatches = [...DEFAULT_SAVED_SWATCHES];
    }

    function saveSwatchList() {
      try {
        window.localStorage.setItem(SAVED_SWATCHES_KEY, JSON.stringify(savedSwatches));
      } catch {
        // Storage unavailable
      }
    }

    function drawSvField() {
      const width = svCanvas.width;
      const height = svCanvas.height;
      const { r, g, b } = hslToRgb(hsv.h, 100, 50);

      svCtx.clearRect(0, 0, width, height);
      svCtx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      svCtx.fillRect(0, 0, width, height);

      const whiteGrad = svCtx.createLinearGradient(0, 0, width, 0);
      whiteGrad.addColorStop(0, "rgba(255,255,255,1)");
      whiteGrad.addColorStop(1, "rgba(255,255,255,0)");
      svCtx.fillStyle = whiteGrad;
      svCtx.fillRect(0, 0, width, height);

      const blackGrad = svCtx.createLinearGradient(0, 0, 0, height);
      blackGrad.addColorStop(0, "rgba(0,0,0,0)");
      blackGrad.addColorStop(1, "rgba(0,0,0,1)");
      svCtx.fillStyle = blackGrad;
      svCtx.fillRect(0, 0, width, height);

      svCursor.style.left = `${hsv.s}%`;
      svCursor.style.top = `${100 - hsv.v}%`;
      svCursor.style.backgroundColor = currentHex;
    }

    function renderSavedTray() {
      savedTray.innerHTML = savedSwatches
        .map(
          (hex) => `
          <button type="button" class="cp-saved-swatch${hex === currentHex ? " active" : ""}" data-saved-hex="${hex}" style="background:${hex}" title="Pick ${hex.toUpperCase()}" aria-label="Pick saved color ${hex.toUpperCase()}"></button>`
        )
        .join("");

      savedTray.querySelectorAll("[data-saved-hex]").forEach((btn) => {
        btn.addEventListener("click", () => {
          setFromHex(btn.dataset.savedHex);
        });
      });
    }

    function renderScaleAndHarmonies() {
      const scale = computeScale(currentHex, 6);
      scaleStrip.innerHTML = scale
        .map((hex) => {
          const textInk = contrastRatio(hex, "#4f2f23") >= contrastRatio(hex, "#fff1cf") ? "#4f2f23" : "#fff1cf";
          return `<button type="button" class="cp-scale-chip" data-scale-hex="${hex}" style="background:${hex};color:${textInk}" title="Pick & copy ${hex.toUpperCase()}"><span>${hex.toUpperCase()}</span></button>`;
        })
        .join("");

      scaleStrip.querySelectorAll("[data-scale-hex]").forEach((chip) => {
        chip.addEventListener("click", () => {
          const hex = chip.dataset.scaleHex;
          setFromHex(hex);
          copyGameText(hex.toUpperCase(), `Copied ${hex.toUpperCase()}!`);
        });
      });

      const harmonies = computeHarmonies(currentHex, "candy");
      harmonyGrid.innerHTML = harmonies
        .map(({ hex, label }) => {
          const textInk = contrastRatio(hex, "#4f2f23") >= contrastRatio(hex, "#fff1cf") ? "#4f2f23" : "#fff1cf";
          return `
            <button type="button" class="cp-harmony-card" data-harmony-hex="${hex}">
              <span class="cp-harmony-swatch" style="background:${hex};color:${textInk}">${hex.toUpperCase()}</span>
              <strong>${escapeMarkup(label)}</strong>
            </button>`;
        })
        .join("");

      harmonyGrid.querySelectorAll("[data-harmony-hex]").forEach((card) => {
        card.addEventListener("click", () => {
          const hex = card.dataset.harmonyHex;
          setFromHex(hex);
          copyGameText(hex.toUpperCase(), `Copied ${hex.toUpperCase()}!`);
        });
      });
    }

    function syncAllUI(skipField = null) {
      const rgb = hexToRgb(currentHex);
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

      hueSlider.value = String(hsv.h);
      hueDegreeLabel.textContent = `${hsv.h}°`;
      vibeBadge.textContent = describeColorVibe(currentHex);

      heroSwatch.style.backgroundColor = currentHex;
      const heroTextInk = contrastRatio(currentHex, "#4f2f23") >= contrastRatio(currentHex, "#fff1cf") ? "#4f2f23" : "#fff1cf";
      heroSwatch.style.color = heroTextInk;
      heroHex.textContent = currentHex.toUpperCase();
      nativeColor.value = currentHex;

      if (skipField !== "hex") hexField.value = currentHex.toUpperCase();
      rgbField.value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
      hslField.value = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

      drawSvField();
      renderSavedTray();
      renderScaleAndHarmonies();
    }

    function setFromHex(hex, skipField = null) {
      currentHex = normalizeHex(hex, currentHex);
      const rgb = hexToRgb(currentHex);
      const nextHsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
      if (nextHsv.s > 0) hsv.h = nextHsv.h;
      hsv.s = nextHsv.s;
      hsv.v = nextHsv.v;
      syncAllUI(skipField);
    }

    function setFromHsv(h, s, v) {
      hsv = {
        h: wrapHue(h),
        s: clamp(Math.round(s), 0, 100),
        v: clamp(Math.round(v), 0, 100),
      };
      const rgb = hsvToRgb(hsv.h, hsv.s, hsv.v);
      currentHex = rgbToHex(rgb.r, rgb.g, rgb.b);
      syncAllUI();
    }

    let draggingSv = false;
    function updateSvFromPointer(event) {
      const rect = svCanvas.getBoundingClientRect();
      const s = clamp(((event.clientX - rect.left) / Math.max(1, rect.width)) * 100, 0, 100);
      const v = clamp(100 - ((event.clientY - rect.top) / Math.max(1, rect.height)) * 100, 0, 100);
      setFromHsv(hsv.h, s, v);
    }

    svCanvas.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      draggingSv = true;
      svCanvas.setPointerCapture?.(event.pointerId);
      updateSvFromPointer(event);
    });
    svCanvas.addEventListener("pointermove", (event) => {
      if (!draggingSv) return;
      event.preventDefault();
      updateSvFromPointer(event);
    });
    svCanvas.addEventListener("pointerup", () => {
      draggingSv = false;
    });
    svCanvas.addEventListener("pointercancel", () => {
      draggingSv = false;
    });

    hueSlider.addEventListener("input", () => {
      setFromHsv(Number(hueSlider.value) || 0, hsv.s, hsv.v);
    });

    nativeColor.addEventListener("input", () => setFromHex(nativeColor.value));

    root.querySelector("#cpRandomSweetBtn").addEventListener("click", () => {
      const randomHue = Math.floor(Math.random() * 360);
      const randomSat = 55 + Math.floor(Math.random() * 40);
      const randomVal = 78 + Math.floor(Math.random() * 20);
      setFromHsv(randomHue, randomSat, randomVal);
      showToast(`Picked ${currentHex.toUpperCase()}!`);
    });

    root.querySelector("#cpSaveSwatchBtn").addEventListener("click", () => {
      if (!savedSwatches.includes(currentHex)) {
        savedSwatches.unshift(currentHex);
        if (savedSwatches.length > 14) savedSwatches.pop();
        saveSwatchList();
        renderSavedTray();
      }
      showToast(`Saved ${currentHex.toUpperCase()}!`);
    });

    hexField.addEventListener("input", () => {
      const raw = hexField.value.trim();
      if (/^#?[0-9a-f]{6}$/i.test(raw)) {
        setFromHex(raw, "hex");
      }
    });

    root.querySelector("#cpCopyHex").addEventListener("click", () => {
      copyGameText(currentHex.toUpperCase(), `HEX ${currentHex.toUpperCase()} copied!`);
    });
    root.querySelector("#cpCopyRgb").addEventListener("click", () => {
      copyGameText(rgbField.value, "RGB copied!");
    });
    root.querySelector("#cpCopyHsl").addEventListener("click", () => {
      copyGameText(hslField.value, "HSL copied!");
    });

    setFromHex("#f49ac2");
  }

  /* ---------- 3. Pixel Painter Utility ---------- */

  function renderPixelPainter() {
    const swatchesMarkup = STUDIO_SWATCHES.slice(0, 16)
      .map(
        ([hex, name], index) =>
          `<button type="button" class="art-swatch-btn${index === 0 ? " active" : ""}" data-px-swatch="${hex}" style="background:${hex}" aria-label="${escapeMarkup(name)}" title="${escapeMarkup(name)}"></button>`
      )
      .join("");

    return `
      <div class="art-studio-layout">
        <section class="game-panel panel-pink art-easel-panel">
          <div class="dev-tool-heading">
            <div>
              <h3>Pixel Sprite Grid</h3>
              <p class="panel-note">Click or drag across the grid to paint crisp retro sprites.</p>
            </div>
            <span class="dev-local-badge" id="pxGridBadge">16 × 16</span>
          </div>
          <div class="px-canvas-wrap">
            <canvas id="pxCanvas" width="384" height="384" aria-label="Pixel painter grid"></canvas>
          </div>
          <div class="button-row art-action-bar">
            <button type="button" class="game-button game-button-small game-button-pink" id="pxPresetHeart">♥ HEART</button>
            <button type="button" class="game-button game-button-small" id="pxPresetCupcake">🧁 CUPCAKE</button>
            <button type="button" class="game-button game-button-small game-button-teal" id="pxPresetStar">★ STAR</button>
            <button type="button" class="game-button game-button-small game-button-coral" id="pxClearBtn">CLEAR</button>
            <button type="button" class="game-button game-button-small game-button-sage" id="pxDownloadBtn">SAVE PNG</button>
          </div>
        </section>

        <section class="game-panel panel-honey art-controls-panel">
          <div class="field-stack">
            <span class="field-title">Grid size</span>
            <div class="segmented" role="group" aria-label="Pixel grid size">
              <button type="button" class="tab-button" data-px-size="8">8 × 8</button>
              <button type="button" class="tab-button" data-px-size="12">12 × 12</button>
              <button type="button" class="tab-button active" data-px-size="16">16 × 16</button>
              <button type="button" class="tab-button" data-px-size="24">24 × 24</button>
            </div>
          </div>

          <div class="field-stack">
            <span class="field-title">Mode</span>
            <div class="segmented" role="group" aria-label="Pixel draw mode">
              <button type="button" class="tab-button active" data-px-mode="draw">✏ Paint</button>
              <button type="button" class="tab-button" data-px-mode="erase">⌫ Erase</button>
              <button type="button" class="tab-button" id="pxMirrorToggle" aria-pressed="false">↔ Mirror X</button>
            </div>
          </div>

          <div class="field-stack">
            <div class="art-slider-header">
              <label for="pxColorInput">Pixel color</label>
              <strong id="pxColorHex">#F49AC2</strong>
            </div>
            <div class="art-color-bar">
              <input type="color" id="pxColorInput" class="art-color-well" value="#f49ac2" />
              <div class="art-swatch-grid">${swatchesMarkup}</div>
            </div>
          </div>
        </section>
      </div>`;
  }

  function initPixelPainter(root, api = {}) {
    const showToast = api.showToast || (() => {});
    const canvas = root.querySelector("#pxCanvas");
    const ctx = canvas.getContext("2d");
    const badge = root.querySelector("#pxGridBadge");
    const colorInput = root.querySelector("#pxColorInput");
    const colorHex = root.querySelector("#pxColorHex");
    const mirrorBtn = root.querySelector("#pxMirrorToggle");

    let gridSize = 16;
    let cells = Array.from({ length: gridSize * gridSize }, () => null);
    let activeColor = "#f49ac2";
    let mode = "draw";
    let mirror = false;
    let painting = false;

    function drawGrid() {
      const w = canvas.width;
      const cellPx = w / gridSize;
      ctx.clearRect(0, 0, w, w);

      for (let y = 0; y < gridSize; y += 1) {
        for (let x = 0; x < gridSize; x += 1) {
          ctx.fillStyle = (x + y) % 2 === 0 ? "#fff6e0" : "#f7e8c6";
          ctx.fillRect(x * cellPx, y * cellPx, cellPx, cellPx);
          const fill = cells[y * gridSize + x];
          if (fill) {
            ctx.fillStyle = fill;
            ctx.fillRect(x * cellPx, y * cellPx, cellPx, cellPx);
          }
          ctx.strokeStyle = "rgba(79, 47, 35, 0.16)";
          ctx.lineWidth = 1;
          ctx.strokeRect(x * cellPx + 0.5, y * cellPx + 0.5, cellPx - 1, cellPx - 1);
        }
      }
    }

    function paintAtEvent(event) {
      const rect = canvas.getBoundingClientRect();
      const gx = clamp(Math.floor(((event.clientX - rect.left) / Math.max(1, rect.width)) * gridSize), 0, gridSize - 1);
      const gy = clamp(Math.floor(((event.clientY - rect.top) / Math.max(1, rect.height)) * gridSize), 0, gridSize - 1);
      const value = mode === "erase" ? null : activeColor;
      cells[gy * gridSize + gx] = value;
      if (mirror) {
        cells[gy * gridSize + (gridSize - 1 - gx)] = value;
      }
      drawGrid();
    }

    function loadPreset(type) {
      gridSize = 16;
      badge.textContent = "16 × 16";
      root.querySelectorAll("[data-px-size]").forEach((btn) => btn.classList.toggle("active", btn.dataset.pxSize === "16"));
      cells = Array.from({ length: 256 }, () => null);
      const setPx = (x, y, c) => {
        if (x >= 0 && x < 16 && y >= 0 && y < 16) {
          cells[y * 16 + x] = c;
          cells[y * 16 + (15 - x)] = c;
        }
      };
      if (type === "heart") {
        const rows = [
          "   ###   ",
          "  #####  ",
          " ####### ",
          " ####### ",
          " ####### ",
          "  #####  ",
          "   ###   ",
          "    #    ",
        ];
        rows.forEach((row, ry) => {
          [...row].forEach((ch, rx) => {
            if (ch === "#") setPx(rx + 3, ry + 4, ry < 3 ? "#ff66a3" : "#f49ac2");
          });
        });
      } else if (type === "cupcake") {
        for (let x = 5; x <= 7; x += 1) setPx(x, 3, "#e53935");
        for (let y = 4; y <= 8; y += 1) {
          for (let x = 3; x <= 7; x += 1) setPx(x, y, "#f49ac2");
        }
        for (let y = 9; y <= 13; y += 1) {
          for (let x = 4; x <= 7; x += 1) setPx(x, y, "#c98550");
        }
      } else {
        for (let y = 2; y <= 13; y += 1) {
          const span = y <= 7 ? y - 1 : 14 - y;
          for (let x = 8 - span; x <= 7; x += 1) setPx(x, y, "#efb94f");
        }
      }
      drawGrid();
    }

    canvas.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      painting = true;
      canvas.setPointerCapture?.(e.pointerId);
      paintAtEvent(e);
    });
    canvas.addEventListener("pointermove", (e) => {
      if (!painting) return;
      e.preventDefault();
      paintAtEvent(e);
    });
    canvas.addEventListener("pointerup", () => {
      painting = false;
    });

    root.querySelectorAll("[data-px-size]").forEach((btn) => {
      btn.addEventListener("click", () => {
        gridSize = Number(btn.dataset.pxSize) || 16;
        cells = Array.from({ length: gridSize * gridSize }, () => null);
        badge.textContent = `${gridSize} × ${gridSize}`;
        root.querySelectorAll("[data-px-size]").forEach((b) => b.classList.toggle("active", b === btn));
        drawGrid();
      });
    });

    root.querySelectorAll("[data-px-mode]").forEach((btn) => {
      btn.addEventListener("click", () => {
        mode = btn.dataset.pxMode;
        root.querySelectorAll("[data-px-mode]").forEach((b) => b.classList.toggle("active", b === btn));
      });
    });

    mirrorBtn.addEventListener("click", () => {
      mirror = !mirror;
      mirrorBtn.classList.toggle("active", mirror);
      mirrorBtn.setAttribute("aria-pressed", String(mirror));
    });

    colorInput.addEventListener("input", () => {
      activeColor = normalizeHex(colorInput.value);
      colorHex.textContent = activeColor.toUpperCase();
      mode = "draw";
    });

    root.querySelectorAll("[data-px-swatch]").forEach((sw) => {
      sw.addEventListener("click", () => {
        activeColor = sw.dataset.pxSwatch;
        colorInput.value = activeColor;
        colorHex.textContent = activeColor.toUpperCase();
        root.querySelectorAll("[data-px-swatch]").forEach((b) => b.classList.toggle("active", b === sw));
        mode = "draw";
      });
    });

    root.querySelector("#pxPresetHeart").addEventListener("click", () => loadPreset("heart"));
    root.querySelector("#pxPresetCupcake").addEventListener("click", () => loadPreset("cupcake"));
    root.querySelector("#pxPresetStar").addEventListener("click", () => loadPreset("star"));
    root.querySelector("#pxClearBtn").addEventListener("click", () => {
      cells = Array.from({ length: gridSize * gridSize }, () => null);
      drawGrid();
      showToast("Pixel grid cleared!");
    });

    root.querySelector("#pxDownloadBtn").addEventListener("click", () => {
      const out = document.createElement("canvas");
      out.width = 512;
      out.height = 512;
      const octx = out.getContext("2d");
      const step = 512 / gridSize;
      cells.forEach((color, idx) => {
        if (!color) return;
        const x = idx % gridSize;
        const y = (idx - x) / gridSize;
        octx.fillStyle = color;
        octx.fillRect(x * step, y * step, step, step);
      });
      out.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "pixel-sprite.png";
        document.body.append(a);
        a.click();
        a.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        showToast("Pixel sprite saved!");
      });
    });

    loadPreset("heart");
  }

  /* ---------- 4. Gradient Mixer Utility ---------- */

  function renderGradientMixer() {
    return `
      <div class="art-studio-layout">
        <section class="game-panel panel-pink art-easel-panel">
          <div class="dev-tool-heading">
            <div>
              <h3>Gradient Preview</h3>
              <p class="panel-note">Blend sweet colors together and copy the ready-to-use CSS gradient.</p>
            </div>
            <span class="dev-local-badge" id="gradBadge">LINEAR · 135°</span>
          </div>
          <div class="grad-preview-box" id="gradPreviewBox"></div>
          <div class="cp-code-row">
            <label for="gradCssOutput">CSS</label>
            <input class="chunky-input cp-mono-input" id="gradCssOutput" readonly />
            <button type="button" class="game-button game-button-small game-button-pink" id="gradCopyCss">COPY CSS</button>
          </div>
        </section>

        <section class="game-panel panel-honey art-controls-panel">
          <div class="field-stack">
            <span class="field-title">Style</span>
            <div class="segmented" role="group">
              <button type="button" class="tab-button active" data-grad-type="linear">Linear</button>
              <button type="button" class="tab-button" data-grad-type="radial">Radial</button>
              <button type="button" class="tab-button" data-grad-type="conic">Conic</button>
            </div>
          </div>

          <div class="field-stack">
            <div class="art-slider-header">
              <label for="gradAngle">Angle</label>
              <strong id="gradAngleLabel">135°</strong>
            </div>
            <input type="range" id="gradAngle" class="art-range" min="0" max="360" value="135" />
          </div>

          <div class="art-sliders-row">
            <div class="field-stack">
              <label for="gradColor1">Start color</label>
              <input type="color" id="gradColor1" class="art-color-well" value="#f49ac2" style="width:100%" />
            </div>
            <div class="field-stack">
              <label for="gradColor2">Middle color</label>
              <input type="color" id="gradColor2" class="art-color-well" value="#ffd1e6" style="width:100%" />
            </div>
            <div class="field-stack">
              <label for="gradColor3">End color</label>
              <input type="color" id="gradColor3" class="art-color-well" value="#88aeca" style="width:100%" />
            </div>
          </div>

          <div class="field-stack">
            <span class="field-title">Sweet presets</span>
            <div class="segmented">
              <button type="button" class="tab-button" data-grad-preset="#f49ac2,#ffd1e6,#88aeca">Cotton Candy</button>
              <button type="button" class="tab-button" data-grad-preset="#ff66a3,#efb94f,#fff1cf">Peach Tart</button>
              <button type="button" class="tab-button" data-grad-preset="#82b9b3,#91b782,#efb94f">Matcha Honey</button>
              <button type="button" class="tab-button" data-grad-preset="#c4add0,#f49ac2,#e78167">Berry Sunset</button>
            </div>
          </div>
        </section>
      </div>`;
  }

  function initGradientMixer(root, api = {}) {
    const copyGameText = api.copyGameText || (() => {});
    const preview = root.querySelector("#gradPreviewBox");
    const cssOut = root.querySelector("#gradCssOutput");
    const badge = root.querySelector("#gradBadge");
    const angleInput = root.querySelector("#gradAngle");
    const angleLabel = root.querySelector("#gradAngleLabel");
    const c1 = root.querySelector("#gradColor1");
    const c2 = root.querySelector("#gradColor2");
    const c3 = root.querySelector("#gradColor3");
    let type = "linear";

    function update() {
      const deg = Number(angleInput.value) || 135;
      angleLabel.textContent = `${deg}°`;
      badge.textContent = `${type.toUpperCase()} · ${deg}°`;
      let css = `linear-gradient(${deg}deg, ${c1.value}, ${c2.value}, ${c3.value})`;
      if (type === "radial") {
        css = `radial-gradient(circle, ${c1.value}, ${c2.value}, ${c3.value})`;
      } else if (type === "conic") {
        css = `conic-gradient(from ${deg}deg, ${c1.value}, ${c2.value}, ${c3.value}, ${c1.value})`;
      }
      preview.style.background = css;
      cssOut.value = `background: ${css};`;
    }

    root.querySelectorAll("[data-grad-type]").forEach((btn) => {
      btn.addEventListener("click", () => {
        type = btn.dataset.gradType;
        root.querySelectorAll("[data-grad-type]").forEach((b) => b.classList.toggle("active", b === btn));
        update();
      });
    });

    root.querySelectorAll("[data-grad-preset]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const [a, b, c] = btn.dataset.gradPreset.split(",");
        c1.value = a;
        c2.value = b;
        c3.value = c;
        update();
      });
    });

    [angleInput, c1, c2, c3].forEach((el) => el.addEventListener("input", update));
    root.querySelector("#gradCopyCss").addEventListener("click", () => copyGameText(cssOut.value, "Gradient CSS copied!"));
    update();
  }

  /* ---------- 5. Palette Baker Utility ---------- */

  const PALETTE_THEMES = {
    candy: ["#f49ac2", "#ff66a3", "#ffd1e6", "#88aeca", "#c4add0"],
    cafe: ["#c98550", "#efb94f", "#fff1cf", "#a96840", "#4f2f23"],
    mint: ["#82b9b3", "#91b782", "#c6dcba", "#fff1cf", "#4f7d79"],
    berry: ["#d81b60", "#e78167", "#f49ac2", "#efb94f", "#5e35b1"],
  };

  function renderPaletteBaker() {
    return `
      <div class="tool-layout">
        <section class="game-panel panel-pink">
          <div class="dev-tool-heading">
            <div>
              <h3>5-Color Theme Deck</h3>
              <p class="panel-note">Pick a theme mood or bake a fresh random palette. Click any swatch to copy its HEX!</p>
            </div>
            <button type="button" class="game-button game-button-small game-button-pink" id="palBakeBtn">✦ BAKE NEW PALETTE</button>
          </div>
          <div class="segmented" style="margin-bottom:14px">
            <button type="button" class="tab-button active" data-pal-theme="candy">Cotton Candy</button>
            <button type="button" class="tab-button" data-pal-theme="cafe">Cozy Cafe</button>
            <button type="button" class="tab-button" data-pal-theme="mint">Matcha Mint</button>
            <button type="button" class="tab-button" data-pal-theme="berry">Berry Pop</button>
          </div>
          <div class="pal-deck-grid" id="palDeckGrid"></div>
          <div class="button-row" style="margin-top:14px">
            <button type="button" class="game-button game-button-small" id="palCopyAllBtn">COPY ALL HEX CODES</button>
          </div>
        </section>
      </div>`;
  }

  function initPaletteBaker(root, api = {}) {
    const copyGameText = api.copyGameText || (() => {});
    const grid = root.querySelector("#palDeckGrid");
    let colors = [...PALETTE_THEMES.candy];

    function renderDeck() {
      grid.innerHTML = colors
        .map((hex) => {
          const textInk = contrastRatio(hex, "#4f2f23") >= contrastRatio(hex, "#fff1cf") ? "#4f2f23" : "#fff1cf";
          return `
            <button type="button" class="pal-card-btn" data-pal-hex="${hex}" style="background:${hex};color:${textInk}">
              <strong>${hex.toUpperCase()}</strong>
              <small>${escapeMarkup(describeColorVibe(hex))}</small>
            </button>`;
        })
        .join("");

      grid.querySelectorAll("[data-pal-hex]").forEach((btn) => {
        btn.addEventListener("click", () => {
          copyGameText(btn.dataset.palHex.toUpperCase(), `Copied ${btn.dataset.palHex.toUpperCase()}!`);
        });
      });
    }

    root.querySelectorAll("[data-pal-theme]").forEach((btn) => {
      btn.addEventListener("click", () => {
        root.querySelectorAll("[data-pal-theme]").forEach((b) => b.classList.toggle("active", b === btn));
        colors = [...(PALETTE_THEMES[btn.dataset.palTheme] || PALETTE_THEMES.candy)];
        renderDeck();
      });
    });

    root.querySelector("#palBakeBtn").addEventListener("click", () => {
      const baseHue = Math.floor(Math.random() * 360);
      colors = [0, 35, 145, 210, 310].map((offset, idx) => {
        const rgb = hslToRgb(wrapHue(baseHue + offset), 68 + (idx % 2) * 14, 62 + (idx % 3) * 10);
        return rgbToHex(rgb.r, rgb.g, rgb.b);
      });
      renderDeck();
    });

    root.querySelector("#palCopyAllBtn").addEventListener("click", () => {
      copyGameText(colors.map((c) => c.toUpperCase()).join(", "), "Palette copied!");
    });

    renderDeck();
  }

  /* ---------- 6. Shadow & Glow Utility ---------- */

  function renderBoxShadow() {
    return `
      <div class="art-studio-layout">
        <section class="game-panel panel-pink art-easel-panel">
          <div class="dev-tool-heading">
            <div>
              <h3>Shadow &amp; Glow Stage</h3>
              <p class="panel-note">Sculpt chunky 3D kitchen shadows or soft cotton-candy neon glows.</p>
            </div>
          </div>
          <div class="bs-stage">
            <div class="bs-preview-card" id="bsPreviewCard">
              <strong>Sweet Card</strong>
              <small>Live shadow preview</small>
            </div>
          </div>
          <div class="cp-code-row">
            <label for="bsCssOut">CSS</label>
            <input class="chunky-input cp-mono-input" id="bsCssOut" readonly />
            <button type="button" class="game-button game-button-small game-button-pink" id="bsCopyBtn">COPY</button>
          </div>
        </section>

        <section class="game-panel panel-honey art-controls-panel">
          <div class="art-sliders-row">
            <div class="field-stack">
              <div class="art-slider-header"><label for="bsX">Offset X</label><strong id="bsXVal">0 px</strong></div>
              <input type="range" id="bsX" class="art-range" min="-40" max="40" value="0" />
            </div>
            <div class="field-stack">
              <div class="art-slider-header"><label for="bsY">Offset Y</label><strong id="bsYVal">12 px</strong></div>
              <input type="range" id="bsY" class="art-range" min="-40" max="40" value="12" />
            </div>
          </div>

          <div class="art-sliders-row">
            <div class="field-stack">
              <div class="art-slider-header"><label for="bsBlur">Blur</label><strong id="bsBlurVal">0 px</strong></div>
              <input type="range" id="bsBlur" class="art-range" min="0" max="60" value="0" />
            </div>
            <div class="field-stack">
              <div class="art-slider-header"><label for="bsRadius">Corner radius</label><strong id="bsRadiusVal">26 px</strong></div>
              <input type="range" id="bsRadius" class="art-range" min="4" max="60" value="26" />
            </div>
          </div>

          <div class="art-sliders-row">
            <div class="field-stack">
              <label for="bsCardColor">Card color</label>
              <input type="color" id="bsCardColor" class="art-color-well" value="#f49ac2" style="width:100%" />
            </div>
            <div class="field-stack">
              <label for="bsShadowColor">Shadow color</label>
              <input type="color" id="bsShadowColor" class="art-color-well" value="#b35983" style="width:100%" />
            </div>
          </div>

          <div class="segmented">
            <button type="button" class="tab-button active" data-bs-preset="chunky">Chunky 3D</button>
            <button type="button" class="tab-button" data-bs-preset="soft">Soft Float</button>
            <button type="button" class="tab-button" data-bs-preset="glow">Pink Glow</button>
          </div>
        </section>
      </div>`;
  }

  function initBoxShadow(root, api = {}) {
    const copyGameText = api.copyGameText || (() => {});
    const card = root.querySelector("#bsPreviewCard");
    const cssOut = root.querySelector("#bsCssOut");
    const xIn = root.querySelector("#bsX");
    const yIn = root.querySelector("#bsY");
    const blurIn = root.querySelector("#bsBlur");
    const radiusIn = root.querySelector("#bsRadius");
    const cardColor = root.querySelector("#bsCardColor");
    const shadowColor = root.querySelector("#bsShadowColor");

    function update() {
      const x = Number(xIn.value) || 0;
      const y = Number(yIn.value) || 0;
      const blur = Number(blurIn.value) || 0;
      const radius = Number(radiusIn.value) || 26;
      root.querySelector("#bsXVal").textContent = `${x} px`;
      root.querySelector("#bsYVal").textContent = `${y} px`;
      root.querySelector("#bsBlurVal").textContent = `${blur} px`;
      root.querySelector("#bsRadiusVal").textContent = `${radius} px`;

      card.style.backgroundColor = cardColor.value;
      card.style.borderRadius = `${radius}px`;
      const shadow = `${x}px ${y}px ${blur}px ${shadowColor.value}`;
      card.style.boxShadow = shadow;
      cssOut.value = `box-shadow: ${shadow}; border-radius: ${radius}px;`;
    }

    root.querySelectorAll("[data-bs-preset]").forEach((btn) => {
      btn.addEventListener("click", () => {
        root.querySelectorAll("[data-bs-preset]").forEach((b) => b.classList.toggle("active", b === btn));
        const p = btn.dataset.bsPreset;
        if (p === "chunky") {
          xIn.value = "0";
          yIn.value = "12";
          blurIn.value = "0";
          shadowColor.value = "#b35983";
        } else if (p === "soft") {
          xIn.value = "0";
          yIn.value = "18";
          blurIn.value = "32";
          shadowColor.value = "#8c536e";
        } else {
          xIn.value = "0";
          yIn.value = "0";
          blurIn.value = "36";
          shadowColor.value = "#ff66a3";
        }
        update();
      });
    });

    [xIn, yIn, blurIn, radiusIn, cardColor, shadowColor].forEach((el) => el.addEventListener("input", update));
    root.querySelector("#bsCopyBtn").addEventListener("click", () => copyGameText(cssOut.value, "Shadow CSS copied!"));
    update();
  }

  /* ---------- 7. Blob Maker Utility ---------- */

  function renderBlobMaker() {
    return `
      <div class="art-studio-layout">
        <section class="game-panel panel-pink art-easel-panel">
          <div class="dev-tool-heading">
            <div>
              <h3>Organic SVG Blob</h3>
              <p class="panel-note">Roll playful sticker blobs and copy or download the crisp vector SVG.</p>
            </div>
            <button type="button" class="game-button game-button-small game-button-pink" id="blobRollBtn">✦ ROLL NEW BLOB</button>
          </div>
          <div class="bs-stage" id="blobStage"></div>
          <div class="button-row">
            <button type="button" class="game-button game-button-small" id="blobCopySvgBtn">COPY SVG CODE</button>
            <button type="button" class="game-button game-button-small game-button-sage" id="blobDownloadBtn">DOWNLOAD .SVG</button>
          </div>
        </section>

        <section class="game-panel panel-honey art-controls-panel">
          <div class="field-stack">
            <div class="art-slider-header"><label for="blobPoints">Corners / points</label><strong id="blobPointsVal">7</strong></div>
            <input type="range" id="blobPoints" class="art-range" min="4" max="12" value="7" />
          </div>
          <div class="field-stack">
            <div class="art-slider-header"><label for="blobWildness">Wobbliness</label><strong id="blobWildnessVal">32%</strong></div>
            <input type="range" id="blobWildness" class="art-range" min="8" max="60" value="32" />
          </div>
          <div class="field-stack">
            <label for="blobFillColor">Blob color</label>
            <input type="color" id="blobFillColor" class="art-color-well" value="#f49ac2" style="width:100%" />
          </div>
        </section>
      </div>`;
  }

  function initBlobMaker(root, api = {}) {
    const copyGameText = api.copyGameText || (() => {});
    const showToast = api.showToast || (() => {});
    const stage = root.querySelector("#blobStage");
    const pointsIn = root.querySelector("#blobPoints");
    const wildIn = root.querySelector("#blobWildness");
    const fillIn = root.querySelector("#blobFillColor");
    let currentSvg = "";

    function makeBlobPath(count, wildness) {
      const cx = 120;
      const cy = 120;
      const baseR = 82;
      const pts = [];
      for (let i = 0; i < count; i += 1) {
        const angle = (i * Math.PI * 2) / count;
        const offset = (Math.random() - 0.5) * 2 * (wildness / 100) * baseR;
        const r = baseR + offset;
        pts.push({ x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
      }
      let d = "";
      for (let i = 0; i < count; i += 1) {
        const p0 = pts[i];
        const p1 = pts[(i + 1) % count];
        const midX = (p0.x + p1.x) / 2;
        const midY = (p0.y + p1.y) / 2;
        if (i === 0) {
          const prev = pts[count - 1];
          d += `M ${(( prev.x + p0.x) / 2).toFixed(1)} ${((prev.y + p0.y) / 2).toFixed(1)} `;
        }
        d += `Q ${p0.x.toFixed(1)} ${p0.y.toFixed(1)} ${midX.toFixed(1)} ${midY.toFixed(1)} `;
      }
      return `${d}Z`;
    }

    let lastPath = makeBlobPath(7, 32);

    function render(reroll = false) {
      const pts = Number(pointsIn.value) || 7;
      const wild = Number(wildIn.value) || 32;
      root.querySelector("#blobPointsVal").textContent = String(pts);
      root.querySelector("#blobWildnessVal").textContent = `${wild}%`;
      if (reroll) lastPath = makeBlobPath(pts, wild);
      currentSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="220" height="220"><path d="${lastPath}" fill="${fillIn.value}" stroke="#4f2f23" stroke-width="8" stroke-linejoin="round"/></svg>`;
      stage.innerHTML = currentSvg;
    }

    pointsIn.addEventListener("input", () => render(true));
    wildIn.addEventListener("input", () => render(true));
    fillIn.addEventListener("input", () => render(false));
    root.querySelector("#blobRollBtn").addEventListener("click", () => render(true));
    root.querySelector("#blobCopySvgBtn").addEventListener("click", () => copyGameText(currentSvg, "Blob SVG copied!"));
    root.querySelector("#blobDownloadBtn").addEventListener("click", () => {
      const url = URL.createObjectURL(new Blob([currentSvg], { type: "image/svg+xml" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = "cotton-candy-blob.svg";
      document.body.append(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast("Blob SVG downloaded!");
    });
    render(false);
  }

  /* ---------- 8. Pattern Tiles Utility ---------- */

  function renderPatternTiles() {
    return `
      <div class="art-studio-layout">
        <section class="game-panel panel-pink art-easel-panel">
          <div class="dev-tool-heading">
            <div>
              <h3>Seamless Wallpaper Preview</h3>
              <p class="panel-note">Design repeating kitchen &amp; candy patterns and save them as a wallpaper PNG.</p>
            </div>
          </div>
          <div class="art-canvas-stage">
            <canvas id="patCanvas" width="640" height="440" aria-label="Pattern preview canvas"></canvas>
          </div>
          <div class="button-row">
            <button type="button" class="game-button game-button-small game-button-sage" id="patDownloadBtn">DOWNLOAD WALLPAPER PNG</button>
          </div>
        </section>

        <section class="game-panel panel-honey art-controls-panel">
          <div class="field-stack">
            <span class="field-title">Pattern style</span>
            <div class="segmented">
              <button type="button" class="tab-button active" data-pat-style="dots">Polka Dots</button>
              <button type="button" class="tab-button" data-pat-style="checks">Gingham</button>
              <button type="button" class="tab-button" data-pat-style="hearts">Hearts</button>
              <button type="button" class="tab-button" data-pat-style="stars">Sparkles</button>
            </div>
          </div>
          <div class="field-stack">
            <div class="art-slider-header"><label for="patSpacing">Tile size</label><strong id="patSpacingVal">48 px</strong></div>
            <input type="range" id="patSpacing" class="art-range" min="28" max="96" value="48" />
          </div>
          <div class="art-sliders-row">
            <div class="field-stack">
              <label for="patFg">Pattern color</label>
              <input type="color" id="patFg" class="art-color-well" value="#f49ac2" style="width:100%" />
            </div>
            <div class="field-stack">
              <label for="patBg">Backdrop color</label>
              <input type="color" id="patBg" class="art-color-well" value="#fff6e0" style="width:100%" />
            </div>
          </div>
        </section>
      </div>`;
  }

  function initPatternTiles(root, api = {}) {
    const showToast = api.showToast || (() => {});
    const canvas = root.querySelector("#patCanvas");
    const ctx = canvas.getContext("2d");
    const spacingIn = root.querySelector("#patSpacing");
    const fgIn = root.querySelector("#patFg");
    const bgIn = root.querySelector("#patBg");
    let style = "dots";

    function draw() {
      const step = Number(spacingIn.value) || 48;
      root.querySelector("#patSpacingVal").textContent = `${step} px`;
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = bgIn.value;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = fgIn.value;

      for (let y = 0; y < h + step; y += step) {
        for (let x = 0; x < w + step; x += step) {
          const ox = (Math.floor(y / step) % 2) * (step / 2);
          const cx = x + ox;
          const cy = y;
          if (style === "dots") {
            ctx.beginPath();
            ctx.arc(cx, cy, step * 0.24, 0, Math.PI * 2);
            ctx.fill();
          } else if (style === "checks") {
            ctx.save();
            ctx.globalAlpha = 0.45;
            ctx.fillRect(x, 0, step * 0.45, h);
            ctx.fillRect(0, y, w, step * 0.45);
            ctx.restore();
          } else if (style === "hearts") {
            ctx.font = `${Math.round(step * 0.55)}px sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("♥", cx, cy);
          } else {
            ctx.font = `${Math.round(step * 0.55)}px sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("✦", cx, cy);
          }
        }
      }
    }

    root.querySelectorAll("[data-pat-style]").forEach((btn) => {
      btn.addEventListener("click", () => {
        style = btn.dataset.patStyle;
        root.querySelectorAll("[data-pat-style]").forEach((b) => b.classList.toggle("active", b === btn));
        draw();
      });
    });

    [spacingIn, fgIn, bgIn].forEach((el) => el.addEventListener("input", draw));
    root.querySelector("#patDownloadBtn").addEventListener("click", () => {
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "pattern-wallpaper.png";
        document.body.append(a);
        a.click();
        a.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        showToast("Wallpaper downloaded!");
      });
    });
    draw();
  }

  /* ---------- 9. Font Playground Utility ---------- */

  function renderFontPlayground() {
    return `
      <div class="art-studio-layout">
        <section class="game-panel panel-pink art-easel-panel">
          <div class="dev-tool-heading">
            <div>
              <h3>Typography Stage</h3>
              <p class="panel-note">Test font vibes, sizes, and colors for your headings and notes.</p>
            </div>
          </div>
          <div class="fp-preview-card" id="fpPreviewCard">
            <h4 id="fpPreviewHeading">Cotton Candy Kitchen</h4>
            <p id="fpPreviewBody">Freshly baked utilities served warm with sprinkles on top.</p>
          </div>
          <div class="field-stack">
            <label for="fpHeadingInput">Headline text</label>
            <input class="chunky-input" id="fpHeadingInput" value="Cotton Candy Kitchen" />
          </div>
          <div class="field-stack">
            <label for="fpBodyInput">Subtext</label>
            <input class="chunky-input" id="fpBodyInput" value="Freshly baked utilities served warm with sprinkles on top." />
          </div>
        </section>

        <section class="game-panel panel-honey art-controls-panel">
          <div class="field-stack">
            <span class="field-title">Font vibe</span>
            <div class="segmented">
              <button type="button" class="tab-button active" data-fp-font='var(--font-round)'>Rounded</button>
              <button type="button" class="tab-button" data-fp-font='Georgia, "Times New Roman", serif'>Storybook</button>
              <button type="button" class="tab-button" data-fp-font='ui-monospace, Menlo, Consolas, monospace'>Typewriter</button>
              <button type="button" class="tab-button" data-fp-font='"Comic Sans MS", "Chalkboard SE", cursive'>Playful</button>
            </div>
          </div>

          <div class="field-stack">
            <div class="art-slider-header"><label for="fpSize">Headline size</label><strong id="fpSizeVal">36 px</strong></div>
            <input type="range" id="fpSize" class="art-range" min="20" max="64" value="36" />
          </div>

          <div class="field-stack">
            <div class="art-slider-header"><label for="fpSpacing">Letter spacing</label><strong id="fpSpacingVal">0 px</strong></div>
            <input type="range" id="fpSpacing" class="art-range" min="-3" max="12" value="0" />
          </div>

          <div class="art-sliders-row">
            <div class="field-stack">
              <label for="fpTextColor">Text color</label>
              <input type="color" id="fpTextColor" class="art-color-well" value="#4f2f23" style="width:100%" />
            </div>
            <div class="field-stack">
              <label for="fpCardColor">Card backdrop</label>
              <input type="color" id="fpCardColor" class="art-color-well" value="#fff6e0" style="width:100%" />
            </div>
          </div>
        </section>
      </div>`;
  }

  function initFontPlayground(root) {
    const card = root.querySelector("#fpPreviewCard");
    const heading = root.querySelector("#fpPreviewHeading");
    const body = root.querySelector("#fpPreviewBody");
    const headingIn = root.querySelector("#fpHeadingInput");
    const bodyIn = root.querySelector("#fpBodyInput");
    const sizeIn = root.querySelector("#fpSize");
    const spacingIn = root.querySelector("#fpSpacing");
    const textCol = root.querySelector("#fpTextColor");
    const cardCol = root.querySelector("#fpCardColor");
    let fontStack = "var(--font-round)";

    function update() {
      heading.textContent = headingIn.value || "Cotton Candy Kitchen";
      body.textContent = bodyIn.value || "";
      const sz = Number(sizeIn.value) || 36;
      const sp = Number(spacingIn.value) || 0;
      root.querySelector("#fpSizeVal").textContent = `${sz} px`;
      root.querySelector("#fpSpacingVal").textContent = `${sp} px`;
      card.style.fontFamily = fontStack;
      card.style.backgroundColor = cardCol.value;
      card.style.color = textCol.value;
      heading.style.fontSize = `${sz}px`;
      heading.style.letterSpacing = `${sp}px`;
    }

    root.querySelectorAll("[data-fp-font]").forEach((btn) => {
      btn.addEventListener("click", () => {
        fontStack = btn.dataset.fpFont;
        root.querySelectorAll("[data-fp-font]").forEach((b) => b.classList.toggle("active", b === btn));
        update();
      });
    });

    [headingIn, bodyIn, sizeIn, spacingIn, textCol, cardCol].forEach((el) => el.addEventListener("input", update));
    update();
  }

  /* ---------- 10. Sticker Maker Utility ---------- */

  function renderStickerMaker() {
    return `
      <div class="art-studio-layout">
        <section class="game-panel panel-pink art-easel-panel">
          <div class="dev-tool-heading">
            <div>
              <h3>Sticker &amp; Badge Press</h3>
              <p class="panel-note">Stamp custom kitchen badges and download them as transparent PNG stickers.</p>
            </div>
          </div>
          <div class="bs-stage">
            <canvas id="stkCanvas" width="320" height="320" aria-label="Sticker preview"></canvas>
          </div>
          <div class="button-row">
            <button type="button" class="game-button game-button-small game-button-sage" id="stkDownloadBtn">DOWNLOAD STICKER PNG</button>
          </div>
        </section>

        <section class="game-panel panel-honey art-controls-panel">
          <div class="field-stack">
            <label for="stkText">Sticker label</label>
            <input class="chunky-input" id="stkText" value="SWEET BAKE" maxlength="18" />
          </div>

          <div class="field-stack">
            <span class="field-title">Badge shape</span>
            <div class="segmented">
              <button type="button" class="tab-button active" data-stk-shape="seal">Star Seal</button>
              <button type="button" class="tab-button" data-stk-shape="circle">Circle</button>
              <button type="button" class="tab-button" data-stk-shape="heart">Heart</button>
              <button type="button" class="tab-button" data-stk-shape="pill">Ribbon Pill</button>
            </div>
          </div>

          <div class="field-stack">
            <span class="field-title">Center icon</span>
            <div class="segmented">
              <button type="button" class="tab-button active" data-stk-icon="✦">✦ Sparkle</button>
              <button type="button" class="tab-button" data-stk-icon="♥">♥ Heart</button>
              <button type="button" class="tab-button" data-stk-icon="★">★ Star</button>
              <button type="button" class="tab-button" data-stk-icon="✿">✿ Flower</button>
              <button type="button" class="tab-button" data-stk-icon="♛">♛ Crown</button>
            </div>
          </div>

          <div class="art-sliders-row">
            <div class="field-stack">
              <label for="stkBgColor">Badge fill</label>
              <input type="color" id="stkBgColor" class="art-color-well" value="#f49ac2" style="width:100%" />
            </div>
            <div class="field-stack">
              <label for="stkAccentColor">Accent ring</label>
              <input type="color" id="stkAccentColor" class="art-color-well" value="#fff1cf" style="width:100%" />
            </div>
          </div>
        </section>
      </div>`;
  }

  function initStickerMaker(root, api = {}) {
    const showToast = api.showToast || (() => {});
    const canvas = root.querySelector("#stkCanvas");
    const ctx = canvas.getContext("2d");
    const textIn = root.querySelector("#stkText");
    const bgIn = root.querySelector("#stkBgColor");
    const accentIn = root.querySelector("#stkAccentColor");
    let shape = "seal";
    let icon = "✦";

    function draw() {
      ctx.clearRect(0, 0, 320, 320);
      const cx = 160;
      const cy = 160;

      ctx.save();
      ctx.fillStyle = bgIn.value;
      ctx.strokeStyle = "#4f2f23";
      ctx.lineWidth = 8;
      ctx.lineJoin = "round";

      ctx.beginPath();
      if (shape === "seal") {
        const points = 16;
        for (let i = 0; i < points * 2; i += 1) {
          const r = i % 2 === 0 ? 132 : 112;
          const a = (i * Math.PI) / points;
          const x = cx + Math.cos(a) * r;
          const y = cy + Math.sin(a) * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
      } else if (shape === "circle") {
        ctx.arc(cx, cy, 124, 0, Math.PI * 2);
      } else if (shape === "heart") {
        ctx.moveTo(cx, cy + 115);
        ctx.bezierCurveTo(cx - 155, cy + 20, cx - 135, cy - 115, cx, cy - 42);
        ctx.bezierCurveTo(cx + 135, cy - 115, cx + 155, cy + 20, cx, cy + 115);
        ctx.closePath();
      } else {
        ctx.roundRect(24, 82, 272, 156, 78);
      }
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = accentIn.value;
      ctx.lineWidth = 4;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      if (shape === "pill") {
        ctx.roundRect(40, 98, 240, 124, 62);
      } else {
        ctx.arc(cx, cy, 92, 0, Math.PI * 2);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = accentIn.value;
      ctx.strokeStyle = "#4f2f23";
      ctx.lineWidth = 5;
      ctx.font = "900 54px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.strokeText(icon, cx, cy - 20);
      ctx.fillText(icon, cx, cy - 20);

      const label = (textIn.value || "SWEET BAKE").toUpperCase();
      ctx.font = '900 22px "Arial Rounded MT Bold", "Trebuchet MS", sans-serif';
      ctx.fillStyle = "#4f2f23";
      ctx.fillText(label, cx, cy + 38);
      ctx.restore();
    }

    root.querySelectorAll("[data-stk-shape]").forEach((btn) => {
      btn.addEventListener("click", () => {
        shape = btn.dataset.stkShape;
        root.querySelectorAll("[data-stk-shape]").forEach((b) => b.classList.toggle("active", b === btn));
        draw();
      });
    });

    root.querySelectorAll("[data-stk-icon]").forEach((btn) => {
      btn.addEventListener("click", () => {
        icon = btn.dataset.stkIcon;
        root.querySelectorAll("[data-stk-icon]").forEach((b) => b.classList.toggle("active", b === btn));
        draw();
      });
    });

    [textIn, bgIn, accentIn].forEach((el) => el.addEventListener("input", draw));
    root.querySelector("#stkDownloadBtn").addEventListener("click", () => {
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "custom-sticker.png";
        document.body.append(a);
        a.click();
        a.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        showToast("Sticker PNG downloaded!");
      });
    });
    draw();
  }

  window.DesignArtTools = {
    renderArtStudio,
    initArtStudio,
    renderColorPicker,
    initColorPicker,
    renderPixelPainter,
    initPixelPainter,
    renderGradientMixer,
    initGradientMixer,
    renderPaletteBaker,
    initPaletteBaker,
    renderBoxShadow,
    initBoxShadow,
    renderBlobMaker,
    initBlobMaker,
    renderPatternTiles,
    initPatternTiles,
    renderFontPlayground,
    initFontPlayground,
    renderStickerMaker,
    initStickerMaker,
    normalizeHex,
    hexToRgb,
    rgbToHex,
    rgbToHsl,
    hslToRgb,
    hsvToRgb,
    rgbToHsv,
    rgbToCmyk,
    contrastRatio,
    wcagRating,
    mixColors,
    computeScale,
    computeHarmonies,
    describeColorVibe,
    symmetryPoints,
  };
})();
