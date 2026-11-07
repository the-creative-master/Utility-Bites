(() => {
  "use strict";

  const toolset = window.TextFilesTools || {};
  const scriptPromises = new Map();
  const escapeMarkup = (value) => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  const groups = {
    image: new Set(["png", "jpg", "jpeg", "jfif", "webp", "gif", "bmp", "svg", "avif", "ico"]),
    spreadsheet: new Set(["xlsx", "xls", "xlsb", "xlsm", "ods", "fods"]),
    document: new Set(["pdf", "docx", "odt", "pptx", "epub"]),
    archive: new Set(["zip", "tar", "tgz", "gz", "tar.gz"]),
    audio: new Set(["mp3", "wav", "wave", "ogg", "oga", "m4a", "aac", "flac", "opus", "weba"]),
    text: new Set(["txt", "text", "md", "markdown", "html", "htm", "rtf", "json", "jsonl", "xml", "yaml", "yml", "csv", "tsv", "log", "ini", "cfg", "conf", "toml", "tex", "vcf", "ics", "srt", "vtt", "css", "js", "mjs", "ts", "py", "java", "c", "h", "cpp", "hpp", "sql", "sh"]),
  };
  const formats = {
    image: [["png", "PNG image"], ["jpg", "JPEG image"], ["webp", "WebP image"], ["bmp", "BMP image"], ["ico", "ICO icon"], ["svg", "SVG image wrapper"], ["pdf", "PDF page"]],
    spreadsheet: [["xlsx", "Excel workbook (.xlsx)"], ["xls", "Excel 97–2003 (.xls)"], ["xlsb", "Excel binary (.xlsb)"], ["ods", "OpenDocument sheet (.ods)"], ["csv", "CSV table"], ["tsv", "TSV table"], ["json", "JSON records"], ["html", "HTML table"], ["pdf", "PDF text table"]],
    text: [["txt", "Plain text"], ["md", "Markdown"], ["html", "HTML document"], ["pdf", "PDF document"], ["docx", "Word document (.docx)"], ["odt", "OpenDocument text (.odt)"], ["epub", "EPUB ebook"], ["rtf", "Rich Text Format"], ["json", "JSON"], ["yaml", "YAML"], ["xml", "XML"], ["csv", "CSV"], ["tsv", "TSV"], ["xlsx", "Excel workbook"], ["ods", "OpenDocument sheet"]],
    document: [["txt", "Extracted plain text"], ["md", "Markdown"], ["html", "HTML document"], ["pdf", "PDF document"], ["docx", "Word document (.docx)"], ["odt", "OpenDocument text (.odt)"], ["epub", "EPUB ebook"], ["rtf", "Rich Text Format"], ["json", "JSON text record"], ["yaml", "YAML text record"]],
    archive: [["zip", "ZIP archive"], ["tar", "TAR archive"], ["tgz", "Gzipped TAR (.tar.gz)"], ["manifest", "File manifest (.json)"]],
    audio: [["wav", "WAV audio (PCM)"]],
    unknown: [],
  };
  const universal = [["base64", "Base64 text"], ["dataurl", "Data URL text"], ["hex", "Hex dump text"]];

  function extension(name) {
    const lower = String(name || "").toLowerCase();
    if (lower.endsWith(".tar.gz")) return "tar.gz";
    return lower.includes(".") ? lower.split(".").pop() : "";
  }

  function familyOf(file) {
    const ext = extension(file.name);
    for (const [family, extensions] of Object.entries(groups)) if (extensions.has(ext)) return family;
    if (file.type.startsWith("image/")) return "image";
    if (file.type.startsWith("audio/")) return "audio";
    if (file.type.startsWith("text/")) return "text";
    return "unknown";
  }

  function fileSize(bytes) {
    if (!Number.isFinite(bytes) || bytes < 1) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const index = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
    const value = bytes / 1024 ** index;
    return `${value >= 10 || index === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[index]}`;
  }

  function baseName(name) {
    return String(name || "converted").replace(/\.tar\.gz$/i, "").replace(/\.[^.]+$/, "") || "converted";
  }

  function mimeFor(ext) {
    return ({
      png: "image/png", jpg: "image/jpeg", webp: "image/webp", bmp: "image/bmp", ico: "image/x-icon", svg: "image/svg+xml", pdf: "application/pdf",
      txt: "text/plain", md: "text/markdown", html: "text/html", json: "application/json", yaml: "application/yaml", xml: "application/xml", csv: "text/csv", tsv: "text/tab-separated-values", rtf: "application/rtf",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", odt: "application/vnd.oasis.opendocument.text", epub: "application/epub+zip",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", xls: "application/vnd.ms-excel", xlsb: "application/vnd.ms-excel.sheet.binary.macroEnabled.12", ods: "application/vnd.oasis.opendocument.spreadsheet",
      zip: "application/zip", tar: "application/x-tar", tgz: "application/gzip", wav: "audio/wav",
    })[ext] || "application/octet-stream";
  }

  function bytesToBase64(bytes) {
    let binary = "";
    for (let offset = 0; offset < bytes.length; offset += 0x8000) binary += String.fromCharCode(...bytes.subarray(offset, Math.min(offset + 0x8000, bytes.length)));
    return btoa(binary);
  }

  function loadScript(name, ready) {
    if (ready()) return Promise.resolve();
    if (scriptPromises.has(name)) return scriptPromises.get(name);
    const promise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = new URL(`vendor/converter/${name}`, document.baseURI).href;
      script.async = true;
      script.onload = () => ready() ? resolve() : reject(new Error(`${name} did not expose its converter API.`));
      script.onerror = () => reject(new Error(`Could not load ${name}.`));
      document.head.append(script);
    }).catch((error) => { scriptPromises.delete(name); throw error; });
    scriptPromises.set(name, promise);
    return promise;
  }

  async function jsZip() {
    await loadScript("jszip.min.js", () => typeof window.JSZip === "function");
    return window.JSZip;
  }

  function parseDelimited(text, delimiter = ",") {
    const rows = [];
    let row = [], cell = "", quoted = false;
    for (let index = 0; index < text.length; index += 1) {
      const character = text[index];
      if (quoted) {
        if (character === '"' && text[index + 1] === '"') { cell += '"'; index += 1; }
        else if (character === '"') quoted = false;
        else cell += character;
      } else if (character === '"') quoted = true;
      else if (character === delimiter) { row.push(cell); cell = ""; }
      else if (character === "\n") { row.push(cell.replace(/\r$/, "")); rows.push(row); row = []; cell = ""; }
      else cell += character;
    }
    if (cell || row.length) { row.push(cell.replace(/\r$/, "")); rows.push(row); }
    if (!rows.length) return [];
    const headers = rows.shift().map((header, index) => header.trim() || `column_${index + 1}`);
    return rows.filter((entry) => entry.some(Boolean)).map((entry) => Object.fromEntries(headers.map((header, index) => [header, entry[index] ?? ""])));
  }

  function rowsFromData(data) {
    if (Array.isArray(data)) {
      if (!data.length) return { headers: [], rows: [] };
      if (data.every(Array.isArray)) return { headers: Array.from({ length: Math.max(...data.map((row) => row.length)) }, (_, index) => `column_${index + 1}`), rows: data };
      if (data.every((entry) => entry && typeof entry === "object")) {
        const headers = [...new Set(data.flatMap(Object.keys))];
        return { headers, rows: data.map((entry) => headers.map((header) => entry[header] ?? "")) };
      }
      return { headers: ["value"], rows: data.map((value) => [value]) };
    }
    if (data && typeof data === "object") return { headers: ["key", "value"], rows: Object.entries(data).map(([key, value]) => [key, typeof value === "object" ? JSON.stringify(value) : value]) };
    return { headers: ["value"], rows: [[data ?? ""]] };
  }

  function toDelimited(data, delimiter = ",") {
    const { headers, rows } = rowsFromData(data);
    const escapeCell = (value) => {
      const text = String(value ?? "");
      return text.includes(delimiter) || /["\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    };
    return [headers, ...rows].map((row) => row.map(escapeCell).join(delimiter)).join("\n");
  }

  function toHtmlTable(data) {
    const { headers, rows } = rowsFromData(data);
    return `<!doctype html><html><head><meta charset="utf-8"><title>Converted table</title><style>body{font-family:system-ui;padding:24px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #555;padding:8px;text-align:left}th{background:#eee}</style></head><body><table><thead><tr>${headers.map((value) => `<th>${escapeMarkup(value)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((value) => `<td>${escapeMarkup(value)}</td>`).join("")}</tr>`).join("\n")}</tbody></table></body></html>`;
  }

  function xmlValue(node) {
    if (!node.children.length) return node.textContent.trim();
    const result = {};
    [...node.children].forEach((child) => {
      const value = xmlValue(child);
      result[child.tagName] = Object.hasOwn(result, child.tagName) ? (Array.isArray(result[child.tagName]) ? [...result[child.tagName], value] : [result[child.tagName], value]) : value;
    });
    return result;
  }

  function xmlName(value) {
    const clean = String(value || "item").replace(/[^A-Za-z0-9_.-]/g, "_");
    return /^[A-Za-z_]/.test(clean) ? clean : `item_${clean}`;
  }

  function toXml(value, name = "item") {
    const tag = xmlName(name);
    if (Array.isArray(value)) return value.map((entry) => toXml(entry, tag)).join("");
    if (value && typeof value === "object") return `<${tag}>${Object.entries(value).map(([key, entry]) => toXml(entry, key)).join("")}</${tag}>`;
    return `<${tag}>${escapeMarkup(value)}</${tag}>`;
  }

  function stripHtml(html) {
    return (new DOMParser().parseFromString(String(html), "text/html").body.textContent || "").replace(/\n{3,}/g, "\n\n").trim();
  }

  function htmlToMarkdown(html) {
    const doc = new DOMParser().parseFromString(String(html), "text/html");
    const convert = (node) => {
      if (node.nodeType === Node.TEXT_NODE) return node.textContent;
      if (node.nodeType !== Node.ELEMENT_NODE) return "";
      const content = [...node.childNodes].map(convert).join("");
      const tag = node.tagName.toLowerCase();
      if (/^h[1-6]$/.test(tag)) return `${"#".repeat(Number(tag[1]))} ${content.trim()}\n\n`;
      if (tag === "p") return `${content.trim()}\n\n`;
      if (tag === "br") return "\n";
      if (tag === "strong" || tag === "b") return `**${content}**`;
      if (tag === "em" || tag === "i") return `_${content}_`;
      if (tag === "li") return `- ${content.trim()}\n`;
      if (tag === "a") return `[${content}](${node.getAttribute("href") || "#"})`;
      if (tag === "code") return `\`${content}\``;
      return content;
    };
    return convert(doc.body).replace(/\n{3,}/g, "\n\n").trim();
  }

  function markdownToHtml(markdown) {
    const inline = (value) => escapeMarkup(value).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/_([^_]+)_/g, "<em>$1</em>").replace(/`([^`]+)`/g, "<code>$1</code>");
    const body = String(markdown).replace(/\r/g, "").split("\n").map((line) => {
      const heading = line.match(/^(#{1,6})\s+(.+)$/);
      if (heading) return `<h${heading[1].length}>${inline(heading[2])}</h${heading[1].length}>`;
      if (/^[-*+]\s+/.test(line)) return `<p>• ${inline(line.replace(/^[-*+]\s+/, ""))}</p>`;
      return line.trim() ? `<p>${inline(line)}</p>` : "";
    }).join("\n");
    return `<!doctype html><html><head><meta charset="utf-8"><title>Converted document</title></head><body>${body}</body></html>`;
  }

  function stripRtf(rtf) {
    return String(rtf).replace(/\\par[d]?/g, "\n").replace(/\\'[0-9a-fA-F]{2}/g, (match) => String.fromCharCode(Number.parseInt(match.slice(2), 16))).replace(/\\[a-z]+-?\d* ?/gi, "").replace(/[{}]/g, "").replace(/\\([\\{}])/g, "$1").trim();
  }

  async function makeDocx(text, title) {
    const JSZip = await jsZip();
    const zip = new JSZip();
    const paragraphs = String(text).split(/\r?\n/).map((line) => `<w:p><w:r><w:t xml:space="preserve">${escapeMarkup(line)}</w:t></w:r></w:p>`).join("");
    zip.file("[Content_Types].xml", `<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`);
    zip.folder("_rels").file(".rels", `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`);
    zip.folder("word").file("document.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${paragraphs}<w:sectPr/></w:body></w:document>`);
    zip.folder("docProps").file("core.xml", `<?xml version="1.0"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>${escapeMarkup(title)}</dc:title></cp:coreProperties>`);
    return zip.generateAsync({ type: "blob", mimeType: mimeFor("docx"), compression: "DEFLATE" });
  }

  async function makeOdt(text, title) {
    const JSZip = await jsZip();
    const zip = new JSZip();
    zip.file("mimetype", "application/vnd.oasis.opendocument.text", { compression: "STORE" });
    zip.file("content.xml", `<?xml version="1.0"?><office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"><office:body><office:text><text:h>${escapeMarkup(title)}</text:h>${String(text).split(/\r?\n/).map((line) => `<text:p>${escapeMarkup(line)}</text:p>`).join("")}</office:text></office:body></office:document-content>`);
    zip.folder("META-INF").file("manifest.xml", `<?xml version="1.0"?><manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0"><manifest:file-entry manifest:full-path="/" manifest:media-type="application/vnd.oasis.opendocument.text"/><manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/></manifest:manifest>`);
    return zip.generateAsync({ type: "blob", mimeType: mimeFor("odt"), compression: "DEFLATE" });
  }

  async function makeEpub(text, title) {
    const JSZip = await jsZip();
    const zip = new JSZip();
    const id = `urn:uuid:${crypto.randomUUID ? crypto.randomUUID() : Date.now()}`;
    zip.file("mimetype", "application/epub+zip", { compression: "STORE" });
    zip.folder("META-INF").file("container.xml", `<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>`);
    const folder = zip.folder("OEBPS");
    folder.file("chapter.xhtml", `<?xml version="1.0"?><html xmlns="http://www.w3.org/1999/xhtml"><head><title>${escapeMarkup(title)}</title></head><body><h1>${escapeMarkup(title)}</h1>${String(text).split(/\r?\n/).map((line) => `<p>${escapeMarkup(line)}</p>`).join("")}</body></html>`);
    folder.file("nav.xhtml", `<?xml version="1.0"?><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><body><nav epub:type="toc"><ol><li><a href="chapter.xhtml">${escapeMarkup(title)}</a></li></ol></nav></body></html>`);
    folder.file("content.opf", `<?xml version="1.0"?><package version="3.0" xmlns="http://www.idpf.org/2007/opf" unique-identifier="id"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="id">${id}</dc:identifier><dc:title>${escapeMarkup(title)}</dc:title><dc:language>en</dc:language><meta property="dcterms:modified">${new Date().toISOString().replace(/\.\d{3}Z$/, "Z")}</meta></metadata><manifest><item id="chapter" href="chapter.xhtml" media-type="application/xhtml+xml"/><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/></manifest><spine><itemref idref="chapter"/></spine></package>`);
    return zip.generateAsync({ type: "blob", mimeType: mimeFor("epub"), compression: "DEFLATE" });
  }

  async function makePdf(text, title) {
    await loadScript("jspdf.umd.min.js", () => Boolean(window.jspdf?.jsPDF));
    const pdf = new window.jspdf.jsPDF({ unit: "pt", format: "a4" });
    pdf.setFont("helvetica", "bold"); pdf.setFontSize(16); pdf.text(String(title).slice(0, 90), 48, 54);
    pdf.setFont("helvetica", "normal"); pdf.setFontSize(10.5);
    let y = 78;
    pdf.splitTextToSize(String(text), 500).forEach((line) => { if (y > 790) { pdf.addPage(); y = 48; } pdf.text(line, 48, y); y += 14; });
    return pdf.output("blob");
  }

  async function makeSpreadsheet(data, ext) {
    await loadScript("xlsx.full.min.js", () => Boolean(window.XLSX?.utils));
    const { headers, rows } = rowsFromData(data);
    const workbook = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(workbook, window.XLSX.utils.aoa_to_sheet([headers, ...rows]), "Converted");
    return new Blob([window.XLSX.write(workbook, { bookType: ext, type: "array" })], { type: mimeFor(ext) });
  }

  async function extractDocument(file, ext) {
    const buffer = await file.arrayBuffer();
    if (ext === "docx") {
      await loadScript("mammoth.browser.min.js", () => Boolean(window.mammoth?.convertToHtml));
      const result = await window.mammoth.convertToHtml({ arrayBuffer: buffer });
      return { text: stripHtml(result.value), html: result.value, data: null };
    }
    if (ext === "pdf") {
      await loadScript("pdf.min.js", () => Boolean(window.pdfjsLib?.getDocument));
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("vendor/converter/pdf.worker.min.js", document.baseURI).href;
      const pdf = await window.pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
      const pages = [];
      for (let number = 1; number <= pdf.numPages; number += 1) {
        const content = await (await pdf.getPage(number)).getTextContent();
        pages.push(content.items.map((item) => item.str).join(" "));
      }
      return { text: pages.join("\n\n"), html: null, data: { pages } };
    }
    const JSZip = await jsZip();
    const zip = await JSZip.loadAsync(buffer);
    if (ext === "pptx") {
      const names = Object.keys(zip.files).filter((name) => /^ppt\/slides\/slide\d+\.xml$/i.test(name)).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
      const slides = [];
      for (const name of names) {
        const doc = new DOMParser().parseFromString(await zip.file(name).async("text"), "application/xml");
        slides.push([...doc.getElementsByTagNameNS("*", "t")].map((node) => node.textContent).join(" "));
      }
      return { text: slides.map((slide, index) => `Slide ${index + 1}\n${slide}`).join("\n\n"), html: null, data: { slides } };
    }
    if (ext === "odt") {
      const content = zip.file("content.xml");
      if (!content) throw new Error("This ODT has no content.xml file.");
      const doc = new DOMParser().parseFromString(await content.async("text"), "application/xml");
      return { text: [...doc.getElementsByTagNameNS("*", "p")].map((node) => node.textContent).join("\n"), html: null, data: null };
    }
    if (ext === "epub") {
      const names = Object.keys(zip.files).filter((name) => /\.(xhtml|html|htm)$/i.test(name) && !/nav\./i.test(name)).sort();
      const chapters = [];
      for (const name of names) chapters.push(stripHtml(await zip.file(name).async("text")));
      return { text: chapters.filter(Boolean).join("\n\n"), html: null, data: null };
    }
    throw new Error(`Cannot extract .${ext} in this browser.`);
  }

  async function extractText(file, ext) {
    if (groups.document.has(ext)) return extractDocument(file, ext);
    let text = await file.text(), data = null, html = null;
    if (ext === "json" || ext === "jsonl") data = ext === "jsonl" ? text.split(/\r?\n/).filter(Boolean).map(JSON.parse) : JSON.parse(text);
    else if (ext === "yaml" || ext === "yml") { await loadScript("js-yaml.min.js", () => Boolean(window.jsyaml?.load)); data = window.jsyaml.load(text); }
    else if (ext === "xml") { const doc = new DOMParser().parseFromString(text, "application/xml"); if (doc.querySelector("parsererror")) throw new Error("The XML document is invalid."); data = { [doc.documentElement.tagName]: xmlValue(doc.documentElement) }; }
    else if (ext === "csv" || ext === "tsv") data = parseDelimited(text, ext === "tsv" ? "\t" : ",");
    else if (ext === "html" || ext === "htm") { html = text; text = stripHtml(text); }
    else if (ext === "md" || ext === "markdown") html = markdownToHtml(text);
    else if (ext === "rtf") text = stripRtf(text);
    return { text, data, html };
  }

  async function convertText(file, ext, target) {
    const source = await extractText(file, ext);
    const data = source.data ?? { text: source.text };
    const title = baseName(file.name);
    if (target === "txt") return new Blob([source.text], { type: mimeFor(target) });
    if (target === "md") return new Blob([source.html ? htmlToMarkdown(source.html) : source.text], { type: mimeFor(target) });
    if (target === "html") return new Blob([source.data ? toHtmlTable(source.data) : source.html || markdownToHtml(source.text)], { type: mimeFor(target) });
    if (target === "json") return new Blob([JSON.stringify(data, null, 2)], { type: mimeFor(target) });
    if (target === "yaml") { await loadScript("js-yaml.min.js", () => Boolean(window.jsyaml?.dump)); return new Blob([window.jsyaml.dump(data, { noRefs: true })], { type: mimeFor(target) }); }
    if (target === "xml") return new Blob([`<?xml version="1.0" encoding="UTF-8"?>\n${toXml(data, "converted")}`], { type: mimeFor(target) });
    if (target === "csv" || target === "tsv") return new Blob([toDelimited(source.data ?? source.text.split(/\r?\n/), target === "tsv" ? "\t" : ",")], { type: mimeFor(target) });
    if (target === "rtf") return new Blob([`{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Arial;}}\\fs22 ${source.text.replace(/\\/g, "\\\\").replace(/[{}]/g, "\\$&").replace(/\n/g, "\\par\n")}}`], { type: mimeFor(target) });
    if (target === "pdf") return makePdf(source.text, title);
    if (target === "docx") return makeDocx(source.text, title);
    if (target === "odt") return makeOdt(source.text, title);
    if (target === "epub") return makeEpub(source.text, title);
    if (target === "xlsx" || target === "ods" || target === "xls") return makeSpreadsheet(source.data ?? source.text.split(/\r?\n/), target);
    throw new Error(`No text → ${target.toUpperCase()} recipe is available.`);
  }

  async function convertSpreadsheet(file, target, sheetName = null) {
    await loadScript("xlsx.full.min.js", () => Boolean(window.XLSX?.read));
    const workbook = window.XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: true });
    const sheet = workbook.Sheets[sheetName && workbook.SheetNames.includes(sheetName) ? sheetName : workbook.SheetNames[0]];
    if (!sheet) throw new Error("The workbook has no sheets.");
    if (["xlsx", "xls", "xlsb", "ods"].includes(target)) return new Blob([window.XLSX.write(workbook, { bookType: target, type: "array" })], { type: mimeFor(target) });
    if (target === "csv" || target === "tsv") return new Blob([window.XLSX.utils.sheet_to_csv(sheet, { FS: target === "tsv" ? "\t" : "," })], { type: mimeFor(target) });
    if (target === "json") return new Blob([JSON.stringify(window.XLSX.utils.sheet_to_json(sheet, { defval: "" }), null, 2)], { type: mimeFor(target) });
    if (target === "html") return new Blob([`<!doctype html><html><head><meta charset="utf-8"></head><body>${window.XLSX.utils.sheet_to_html(sheet)}</body></html>`], { type: mimeFor(target) });
    if (target === "pdf") return makePdf(window.XLSX.utils.sheet_to_csv(sheet), baseName(file.name));
    throw new Error(`No spreadsheet → ${target.toUpperCase()} recipe is available.`);
  }

  const canvasBlob = (canvas, type, quality) => new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error(`This browser cannot encode ${type}.`)), type, quality));

  async function imageCanvas(file, target, outputScale = 1) {
    const url = URL.createObjectURL(file);
    try {
      let drawable, width, height;
      try { drawable = await createImageBitmap(file); width = drawable.width; height = drawable.height; }
      catch { drawable = await new Promise((resolve, reject) => { const image = new Image(); image.onload = () => resolve(image); image.onerror = () => reject(new Error("This browser cannot decode that image format.")); image.src = url; }); width = drawable.naturalWidth; height = drawable.naturalHeight; }
      if (!width || !height) throw new Error("The image has no readable dimensions.");
      const scale = Math.min(1, 10000 / Math.max(width, height)) * (Number(outputScale) || 1);
      const canvas = document.createElement("canvas"); canvas.width = Math.max(1, Math.round(width * scale)); canvas.height = Math.max(1, Math.round(height * scale));
      const context = canvas.getContext("2d", { willReadFrequently: target === "bmp" });
      if (target === "jpg") { context.fillStyle = "#fff"; context.fillRect(0, 0, canvas.width, canvas.height); }
      context.drawImage(drawable, 0, 0, canvas.width, canvas.height); if (drawable.close) drawable.close();
      return canvas;
    } finally { URL.revokeObjectURL(url); }
  }

  function bmpFromCanvas(canvas) {
    const { width, height } = canvas, rgba = canvas.getContext("2d", { willReadFrequently: true }).getImageData(0, 0, width, height).data;
    const rowSize = Math.ceil(width * 3 / 4) * 4, buffer = new ArrayBuffer(54 + rowSize * height), view = new DataView(buffer), bytes = new Uint8Array(buffer);
    bytes[0] = 0x42; bytes[1] = 0x4d; view.setUint32(2, buffer.byteLength, true); view.setUint32(10, 54, true); view.setUint32(14, 40, true); view.setInt32(18, width, true); view.setInt32(22, height, true); view.setUint16(26, 1, true); view.setUint16(28, 24, true);
    for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) { const source = ((height - 1 - y) * width + x) * 4, output = 54 + y * rowSize + x * 3; bytes[output] = rgba[source + 2]; bytes[output + 1] = rgba[source + 1]; bytes[output + 2] = rgba[source]; }
    return new Blob([buffer], { type: "image/bmp" });
  }

  async function icoFromCanvas(canvas) {
    const size = Math.min(256, Math.max(canvas.width, canvas.height)), icon = document.createElement("canvas"); icon.width = size; icon.height = size;
    const scale = Math.min(size / canvas.width, size / canvas.height), width = Math.round(canvas.width * scale), height = Math.round(canvas.height * scale);
    icon.getContext("2d").drawImage(canvas, (size - width) / 2, (size - height) / 2, width, height);
    const png = new Uint8Array(await (await canvasBlob(icon, "image/png")).arrayBuffer()), header = new ArrayBuffer(22), view = new DataView(header);
    view.setUint16(2, 1, true); view.setUint16(4, 1, true); view.setUint8(6, size === 256 ? 0 : size); view.setUint8(7, size === 256 ? 0 : size); view.setUint16(10, 1, true); view.setUint16(12, 32, true); view.setUint32(14, png.length, true); view.setUint32(18, 22, true);
    return new Blob([header, png], { type: "image/x-icon" });
  }

  async function convertImage(file, target, quality, scale = 1) {
    const canvas = await imageCanvas(file, target, scale);
    if (target === "png") return canvasBlob(canvas, "image/png");
    if (target === "jpg") return canvasBlob(canvas, "image/jpeg", quality);
    if (target === "webp") return canvasBlob(canvas, "image/webp", quality);
    if (target === "bmp") return bmpFromCanvas(canvas);
    if (target === "ico") return icoFromCanvas(canvas);
    if (target === "svg") return new Blob([`<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}"><image width="100%" height="100%" href="${canvas.toDataURL("image/png")}"/></svg>`], { type: "image/svg+xml" });
    if (target === "pdf") { await loadScript("jspdf.umd.min.js", () => Boolean(window.jspdf?.jsPDF)); const pdf = new window.jspdf.jsPDF({ orientation: canvas.width > canvas.height ? "landscape" : "portrait", unit: "px", format: [canvas.width, canvas.height], hotfixes: ["px_scaling"] }); pdf.addImage(canvas.toDataURL("image/jpeg", quality), "JPEG", 0, 0, canvas.width, canvas.height); return pdf.output("blob"); }
    throw new Error(`No image → ${target.toUpperCase()} recipe is available.`);
  }

  function safePath(path) { return String(path).replace(/\\/g, "/").split("/").filter((part) => part && part !== "." && part !== "..").join("/") || "file"; }

  function readTar(bytes) {
    const result = [], decoder = new TextDecoder(); let offset = 0;
    const field = (start, length) => decoder.decode(bytes.subarray(offset + start, offset + start + length)).replace(/\0.*$/, "").trim();
    while (offset + 512 <= bytes.length) { const name = field(0, 100); if (!name) break; const size = Number.parseInt(field(124, 12) || "0", 8) || 0; if (field(156, 1) !== "5") result.push({ name: safePath(name), data: bytes.slice(offset + 512, offset + 512 + size) }); offset += 512 + Math.ceil(size / 512) * 512; }
    return result;
  }

  function writeTar(entries) {
    const encoder = new TextEncoder(), blocks = [], put = (header, offset, length, value) => header.set(encoder.encode(String(value)).subarray(0, length), offset);
    entries.forEach((entry) => { const data = entry.data instanceof Uint8Array ? entry.data : new Uint8Array(entry.data), header = new Uint8Array(512); put(header, 0, 100, safePath(entry.name)); put(header, 100, 8, "0000644\0"); put(header, 108, 8, "0000000\0"); put(header, 116, 8, "0000000\0"); put(header, 124, 12, `${data.length.toString(8).padStart(11, "0")}\0`); put(header, 136, 12, `${Math.floor(Date.now() / 1000).toString(8).padStart(11, "0")}\0`); header.fill(32, 148, 156); header[156] = 48; put(header, 257, 6, "ustar\0"); put(header, 263, 2, "00"); put(header, 148, 8, `${header.reduce((sum, byte) => sum + byte, 0).toString(8).padStart(6, "0")}\0 `); blocks.push(header, data, new Uint8Array((512 - data.length % 512) % 512)); });
    blocks.push(new Uint8Array(1024)); return new Blob(blocks, { type: "application/x-tar" });
  }

  async function gzip(blob, mode) {
    const Stream = mode === "compress" ? window.CompressionStream : window.DecompressionStream;
    if (!Stream) throw new Error("GZIP streams are unavailable in this browser.");
    return new Blob([await new Response(blob.stream().pipeThrough(new Stream("gzip"))).arrayBuffer()], { type: mode === "compress" ? "application/gzip" : "application/x-tar" });
  }

  async function archiveEntries(file, ext) {
    if (ext === "zip") { const JSZip = await jsZip(), zip = await JSZip.loadAsync(await file.arrayBuffer()), entries = []; for (const item of Object.values(zip.files)) if (!item.dir) entries.push({ name: safePath(item.name), data: await item.async("uint8array") }); return entries; }
    const blob = ["tgz", "tar.gz", "gz"].includes(ext) ? await gzip(file, "decompress") : file;
    return readTar(new Uint8Array(await blob.arrayBuffer()));
  }

  async function convertArchive(file, ext, target) {
    const entries = await archiveEntries(file, ext); if (!entries.length) throw new Error("This archive contains no files.");
    if (target === "manifest") return new Blob([JSON.stringify(entries.map((entry) => ({ name: entry.name, bytes: entry.data.length })), null, 2)], { type: "application/json" });
    if (target === "tar") return writeTar(entries);
    if (target === "tgz") return gzip(writeTar(entries), "compress");
    if (target === "zip") { const JSZip = await jsZip(), zip = new JSZip(); entries.forEach((entry) => zip.file(entry.name, entry.data)); return zip.generateAsync({ type: "blob", mimeType: "application/zip", compression: "DEFLATE" }); }
    throw new Error(`No archive → ${target.toUpperCase()} recipe is available.`);
  }

  function wavFromAudio(audio) {
    const channels = audio.numberOfChannels, frames = audio.length, buffer = new ArrayBuffer(44 + frames * channels * 2), view = new DataView(buffer);
    const write = (offset, text) => [...text].forEach((character, index) => view.setUint8(offset + index, character.charCodeAt(0)));
    write(0, "RIFF"); view.setUint32(4, buffer.byteLength - 8, true); write(8, "WAVE"); write(12, "fmt "); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, channels, true); view.setUint32(24, audio.sampleRate, true); view.setUint32(28, audio.sampleRate * channels * 2, true); view.setUint16(32, channels * 2, true); view.setUint16(34, 16, true); write(36, "data"); view.setUint32(40, frames * channels * 2, true);
    const data = Array.from({ length: channels }, (_, index) => audio.getChannelData(index)); let offset = 44;
    for (let frame = 0; frame < frames; frame += 1) for (let channel = 0; channel < channels; channel += 1) { const sample = Math.max(-1, Math.min(1, data[channel][frame])); view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true); offset += 2; }
    return new Blob([buffer], { type: "audio/wav" });
  }

  async function convertAudio(file) {
    const AudioContext = window.AudioContext || window.webkitAudioContext; if (!AudioContext) throw new Error("Web Audio is unavailable.");
    const context = new AudioContext(); try { return wavFromAudio(await context.decodeAudioData((await file.arrayBuffer()).slice(0))); } finally { await context.close(); }
  }

  async function universalConvert(file, target) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (target === "base64" || target === "dataurl") { const encoded = bytesToBase64(bytes); return new Blob([target === "dataurl" ? `data:${file.type || "application/octet-stream"};base64,${encoded}` : encoded], { type: "text/plain" }); }
    if (target === "hex") { if (bytes.length > 64 * 1024 * 1024) throw new Error("Hex output is limited to 64 MB inputs."); const chunks = []; for (let offset = 0; offset < bytes.length; offset += 4096) chunks.push([...bytes.subarray(offset, offset + 4096)].map((byte) => byte.toString(16).padStart(2, "0")).join("")); return new Blob([chunks.join("")], { type: "text/plain" }); }
    throw new Error("That universal conversion is unavailable.");
  }

  function renderFileConverter() {
    return `
      <div class="file-converter-layout">
        <section class="game-panel panel-teal converter-upload-panel">
          <div class="dev-tool-heading"><div><h3>Drop in almost anything</h3><p class="panel-note">Every conversion runs locally in this browser. Your file is never uploaded.</p></div><span class="dev-local-badge">LOCAL</span></div>
          <input class="visually-hidden" id="converterFileInput" type="file" multiple />
          <button class="converter-drop-zone" id="converterDropZone" type="button"><span class="converter-drop-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V5M7 9l5-5 5 5M5 19h14"/></svg></span><strong>DROP FILES HERE</strong><span>one, or a whole batch</span></button>
          <div class="converter-file-card" id="converterFileCard" hidden><span class="converter-file-icon" id="converterFileIcon">FILE</span><div><strong id="converterFileName"></strong><span id="converterFileMeta"></span></div><button class="round-mini-button" id="converterChangeFile" aria-label="Choose a different file"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11a8 8 0 1 0-2.3 6.3M20 5v6h-6"/></svg></button></div>
          <div class="converter-support-board"><strong>REAL CONVERSION FAMILIES</strong><div class="converter-family-chips"><span>PNG · JPG · WebP · GIF · BMP · SVG · AVIF</span><span>PDF · DOCX · ODT · PPTX · EPUB</span><span>XLSX · XLS · XLSB · ODS</span><span>JSON · CSV · XML · YAML · RTF</span><span>ZIP · TAR · TAR.GZ</span><span>MP3 · WAV · OGG · M4A · AAC · FLAC → WAV</span></div><small>Animated images use their first frame. Audio decoding follows the formats supported by your browser.</small></div>
        </section>
        <section class="game-panel converter-action-panel">
          <div class="converter-arrow-badge" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h14M13 6l6 6-6 6"/></svg></div>
          <div class="field-stack"><label for="converterFormat">Convert to</label><select class="chunky-input chunky-select" id="converterFormat" disabled><option>Choose a file first</option></select></div>
          <div class="converter-quality" id="converterQuality" hidden><label for="converterQualityRange">Image quality <strong id="converterQualityValue">92%</strong></label><input id="converterQualityRange" type="range" min="20" max="100" value="92" /></div>
          <div class="converter-quality" id="converterScale" hidden><label for="converterScaleRange">Output size <strong id="converterScaleValue">100%</strong></label><input id="converterScaleRange" type="range" min="10" max="100" step="5" value="100" /></div>
          <div class="converter-quality" id="converterSheet" hidden><label for="converterSheetSelect">Workbook sheet</label><select class="chunky-input chunky-select" id="converterSheetSelect"></select></div>
          <button class="game-button converter-run-button" id="runFileConversion" disabled>CONVERT FILE</button>
          <div class="converter-progress" id="converterProgress" hidden><span id="converterProgressBar"></span></div><p class="graph-error" id="converterError" role="status"></p>
          <div class="converter-result-card" aria-live="polite"><span class="result-kicker">Conversion kitchen</span><strong id="converterResultTitle">Waiting for a file</strong><span id="converterResultDetail">Choose a file and its real output formats will appear here.</span><pre id="converterPreview" hidden></pre><div class="button-row dev-action-row"><button class="game-button game-button-sage" id="downloadConvertedFile" disabled>DOWNLOAD RESULT</button><button class="game-button game-button-small" id="copyConvertedText" hidden>COPY TEXT</button></div></div>
        </section>
      </div>`;
  }

  async function spreadsheetSheetNames(file) {
    await loadScript("xlsx.full.min.js", () => Boolean(window.XLSX?.read));
    const workbook = window.XLSX.read(await file.arrayBuffer(), { type: "array" });
    return workbook.SheetNames;
  }

  function initFileConverter(root, api) {
    const input = root.querySelector("#converterFileInput"), drop = root.querySelector("#converterDropZone"), card = root.querySelector("#converterFileCard"), format = root.querySelector("#converterFormat"), qualityWrap = root.querySelector("#converterQuality"), quality = root.querySelector("#converterQualityRange"), scaleWrap = root.querySelector("#converterScale"), scaleRange = root.querySelector("#converterScaleRange"), scaleValue = root.querySelector("#converterScaleValue"), sheetWrap = root.querySelector("#converterSheet"), sheetSelect = root.querySelector("#converterSheetSelect"), run = root.querySelector("#runFileConversion"), error = root.querySelector("#converterError"), progress = root.querySelector("#converterProgress"), bar = root.querySelector("#converterProgressBar"), resultTitle = root.querySelector("#converterResultTitle"), resultDetail = root.querySelector("#converterResultDetail"), preview = root.querySelector("#converterPreview"), download = root.querySelector("#downloadConvertedFile"), copyText = root.querySelector("#copyConvertedText");
    let files = [];
    let outputBlob = null, outputName = "", outputUrl = null;
    const choices = (kind) => { const base = formats[kind] || []; const values = new Set(base.map(([value]) => value)); return [...base, ...universal.filter(([value]) => !values.has(value))]; };
    const families = () => files.map(familyOf);
    const commonChoices = () => {
      if (!files.length) return [];
      const list = choices(familyOf(files[0]));
      const otherSets = files.slice(1).map((file) => new Set(choices(familyOf(file)).map(([value]) => value)));
      return list.filter(([value]) => otherSets.every((set) => set.has(value)));
    };
    const clearResult = () => { outputBlob = null; outputName = ""; download.disabled = true; copyText.hidden = true; preview.hidden = true; preview.textContent = ""; if (outputUrl) URL.revokeObjectURL(outputUrl); outputUrl = null; };
    const updateQuality = () => {
      root.querySelector("#converterQualityValue").textContent = `${quality.value}%`;
      scaleValue.textContent = `${scaleRange.value}%`;
      const kinds = families();
      qualityWrap.hidden = !(kinds.length === 1 && kinds[0] === "image" && ["jpg", "webp", "pdf"].includes(format.value));
      scaleWrap.hidden = !(kinds.length >= 1 && kinds.every((kind) => kind === "image") && !["svg", "pdf", "ico"].includes(format.value));
    };
    async function updateSheetPicker() {
      const kinds = families();
      const singleSpreadsheet = files.length === 1 && kinds[0] === "spreadsheet";
      if (!singleSpreadsheet) { sheetWrap.hidden = true; return; }
      try {
        const names = await spreadsheetSheetNames(files[0]);
        sheetSelect.innerHTML = names.map((name) => `<option value="${escapeMarkup(name)}">${escapeMarkup(name)}</option>`).join("");
        sheetWrap.hidden = names.length < 2;
      } catch { sheetWrap.hidden = true; }
    }
    const selectFiles = (list) => {
      const next = [...(list || [])].filter(Boolean).slice(0, 50);
      if (!next.length) return;
      files = next;
      clearResult();
      drop.hidden = true; card.hidden = false;
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);
      const single = files.length === 1;
      root.querySelector("#converterFileName").textContent = single ? files[0].name : `${files.length} files (batch)`;
      root.querySelector("#converterFileMeta").textContent = single ? `${fileSize(files[0].size)} · ${files[0].type || "unknown MIME"} · ${familyOf(files[0])}` : `${fileSize(totalSize)} total · ${[...new Set(families())].join(" + ")}`;
      root.querySelector("#converterFileIcon").textContent = single ? (extension(files[0].name) || "FILE").slice(0, 5).toUpperCase() : `×${files.length}`;
      const options = commonChoices();
      format.innerHTML = options.map(([value, label]) => `<option value="${value}">${escapeMarkup(label)}</option>`).join("");
      format.disabled = false; run.disabled = false; error.textContent = "";
      resultTitle.textContent = "Ready to convert";
      resultDetail.textContent = single ? `${options.length} output choices available for this ${familyOf(files[0])} file.` : `${options.length} shared output choices for this batch — results will be zipped.`;
      updateQuality();
      updateSheetPicker();
    };
    const outNameFor = (file, target) => {
      const outExt = ["base64", "dataurl", "hex"].includes(target) ? "txt" : target === "manifest" ? "json" : target;
      return `${baseName(file.name)}-converted.${outExt === "tgz" ? "tar.gz" : outExt}`;
    };
    async function convertOne(file, target) {
      const kind = familyOf(file);
      if (["base64", "dataurl", "hex"].includes(target)) return universalConvert(file, target);
      if (kind === "image") return convertImage(file, target, Number(quality.value) / 100, Number(scaleRange.value) / 100);
      if (kind === "spreadsheet") return convertSpreadsheet(file, target, sheetSelect.value || null);
      if (kind === "text" || kind === "document") return convertText(file, extension(file.name), target);
      if (kind === "archive") return convertArchive(file, extension(file.name), target);
      if (kind === "audio" && target === "wav") return convertAudio(file);
      throw new Error(`No ${kind} → ${target.toUpperCase()} recipe is available.`);
    }
    async function convert() {
      if (!files.length) return;
      clearResult(); error.textContent = ""; run.disabled = true; run.textContent = files.length > 1 ? `CONVERTING ${files.length}…` : "CONVERTING…"; progress.hidden = false; bar.style.width = "8%";
      const target = format.value;
      try {
        await new Promise(requestAnimationFrame);
        const results = [];
        const failures = [];
        for (let index = 0; index < files.length; index += 1) {
          bar.style.width = `${8 + ((index + 0.5) / files.length) * 84}%`;
          try { results.push({ name: outNameFor(files[index], target), blob: await convertOne(files[index], target) }); }
          catch (caught) { failures.push(`${files[index].name}: ${caught.message}`); }
        }
        if (!results.length) throw new Error(failures[0] || "No files could be converted.");
        if (results.length === 1) { outputBlob = results[0].blob; outputName = results[0].name; }
        else {
          const JSZip = await jsZip();
          const zip = new JSZip();
          const used = new Set();
          results.forEach((entry) => {
            let name = entry.name; let bump = 1;
            while (used.has(name)) { name = entry.name.replace(/(\.[^.]+)$/, `-${bump}$1`); bump += 1; }
            used.add(name);
            zip.file(name, entry.blob);
          });
          outputName = "converted-batch.zip";
          outputBlob = await zip.generateAsync({ type: "blob", mimeType: "application/zip", compression: "DEFLATE" });
        }
        bar.style.width = "100%";
        outputUrl = URL.createObjectURL(outputBlob);
        resultTitle.textContent = "Conversion complete!";
        const summary = files.length === 1 ? `${outputName} · ${fileSize(outputBlob.size)}` : `${results.length}/${files.length} files converted → ${outputName} · ${fileSize(outputBlob.size)}`;
        resultDetail.textContent = failures.length ? `${summary} · skipped ${failures.length}` : summary;
        download.disabled = false;
        if (outputBlob.type.startsWith("text/") || ["application/json", "application/xml", "application/yaml"].includes(outputBlob.type)) { preview.textContent = (await outputBlob.text()).slice(0, 1800); preview.hidden = false; copyText.hidden = false; }
        api.showToast(files.length === 1 ? "File converted locally!" : "Batch converted locally!");
      } catch (caught) { error.textContent = caught.message || "These files could not be converted."; resultTitle.textContent = "Conversion stopped"; resultDetail.textContent = "Try another output format or verify the source files."; }
      finally { run.disabled = false; run.textContent = "CONVERT FILE"; window.setTimeout(() => { if (root.isConnected) progress.hidden = true; }, 650); }
    }
    drop.onclick = () => input.click(); root.querySelector("#converterChangeFile").onclick = () => input.click(); input.onchange = () => selectFiles(input.files);
    ["dragenter", "dragover"].forEach((type) => drop.addEventListener(type, (event) => { event.preventDefault(); drop.classList.add("dragging"); })); ["dragleave", "drop"].forEach((type) => drop.addEventListener(type, (event) => { event.preventDefault(); drop.classList.remove("dragging"); })); drop.addEventListener("drop", (event) => selectFiles(event.dataTransfer.files));
    format.onchange = updateQuality; quality.oninput = updateQuality; scaleRange.oninput = updateQuality; run.onclick = convert;
    download.onclick = () => { if (!outputUrl) return; const anchor = document.createElement("a"); anchor.href = outputUrl; anchor.download = outputName; document.body.append(anchor); anchor.click(); anchor.remove(); };
    copyText.onclick = () => api.copyGameText ? api.copyGameText(preview.textContent, "Converted text copied!") : undefined;
    api.addCleanup(() => { if (outputUrl) URL.revokeObjectURL(outputUrl); });
  }

  window.TextFilesTools = { ...toolset, renderFileConverter, initFileConverter };
})();
