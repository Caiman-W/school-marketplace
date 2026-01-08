const els = {
  title: document.getElementById("title"),
  id: document.getElementById("id"),
  category: document.getElementById("category"),
  qty: document.getElementById("qty"),
  condition: document.getElementById("condition"),
  status: document.getElementById("status"),
  price: document.getElementById("price"),
  priceNote: document.getElementById("priceNote"),
  location: document.getElementById("location"),
  datePosted: document.getElementById("datePosted"),
  description: document.getElementById("description"),

  maxWidth: document.getElementById("maxWidth"),
  quality: document.getElementById("quality"),
  format: document.getElementById("format"),

  dropzone: document.getElementById("dropzone"),
  pickFiles: document.getElementById("pickFiles"),
  fileInput: document.getElementById("fileInput"),
  thumbs: document.getElementById("thumbs"),
  imgStatus: document.getElementById("imgStatus"),

  generate: document.getElementById("generate"),
  copy: document.getElementById("copy"),
  downloadZip: document.getElementById("downloadZip"),
  output: document.getElementById("output")
};

let converted = []; // [{ path, blob, previewUrl, name, bytes }]

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function slugify(s) {
  return String(s ?? "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function refreshId() {
  const base = slugify(els.title.value) || "new-listing";
  const date = (els.datePosted.value || todayISO()).replaceAll("-", "");
  els.id.value = `${base}-${date}`;
}

function extForMime(mime) {
  if (mime === "image/webp") return "webp";
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  return "bin";
}

function bytesLabel(n) {
  if (!Number.isFinite(n)) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

function setStatus(msg) {
  els.imgStatus.textContent = msg || "";
}

function clearConverted() {
  converted.forEach(c => c.previewUrl && URL.revokeObjectURL(c.previewUrl));
  converted = [];
  els.thumbs.innerHTML = "";
  setStatus("");
  generateJSON();
}

async function loadBitmap(file) {
  try {
    return await createImageBitmap(file);
  } catch {
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = reject;
        el.src = url;
      });
      return img;
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}

function drawToCanvas(img, maxW) {
  const w = img.width || img.naturalWidth;
  const h = img.height || img.naturalHeight;

  const scale = Math.min(1, maxW / w);
  const nw = Math.max(1, Math.round(w * scale));
  const nh = Math.max(1, Math.round(h * scale));

  const canvas = document.createElement("canvas");
  canvas.width = nw;
  canvas.height = nh;

  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, nw, nh);
  return canvas;
}

async function canvasToBlob(canvas, mime, quality) {
  return await new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mime, quality);
  });
}

function renderThumbs() {
  els.thumbs.innerHTML = "";

  if (converted.length === 0) {
    els.thumbs.innerHTML = `<div class="muted small">No images added.</div>`;
    return;
  }

  els.thumbs.innerHTML = converted.map(c => `
    <div class="thumbCard">
      <img src="${c.previewUrl}" alt="">
      <div class="thumbMeta">
        <div><b>${c.name}</b></div>
        <div class="muted small">${bytesLabel(c.bytes)} • ${c.path}</div>
      </div>
    </div>
  `).join("");
}

async function convertFiles(files) {
  refreshId();

  const maxW = Number(els.maxWidth.value || 1400);
  const quality = Number(els.quality.value || 0.82);
  const mime = els.format.value;
  const ext = extForMime(mime);
  const id = els.id.value;

  clearConverted();

  const picked = Array.from(files || [])
    .filter(f => f.type && f.type.startsWith("image/"))
    .slice(0, 6);

  if (picked.length === 0) {
    setStatus("No image files selected.");
    return;
  }

  setStatus(`Converting ${picked.length} image(s)…`);

  for (let i = 0; i < picked.length; i++) {
    const f = picked[i];
    const bmp = await loadBitmap(f);
    const canvas = drawToCanvas(bmp, maxW);
    const blob = await canvasToBlob(canvas, mime, quality);

    const name = `photo${i + 1}.${ext}`;
    const path = `images/${id}/${name}`;
    const previewUrl = URL.createObjectURL(blob);

    converted.push({ path, blob, previewUrl, name, bytes: blob.size });
  }

  setStatus(`Converted ${converted.length} image(s).`);
  renderThumbs();
  generateJSON();
}

function clean(obj) {
  const out = { ...obj };
  for (const k of Object.keys(out)) {
    if (typeof out[k] === "string" && out[k].trim() === "") delete out[k];
  }
  if (Array.isArray(out.photos) && out.photos.length === 0) delete out.photos;
  return out;
}

function buildListingObject() {
  refreshId();

  return clean({
    id: els.id.value,
    title: els.title.value.trim(),
    category: els.category.value.trim(),
    qty: Number(els.qty.value || 0),
    condition: els.condition.value,
    price: Number(els.price.value || 0),
    priceNote: els.priceNote.value.trim(),
    location: els.location.value.trim(),
    description: els.description.value.trim(),
    photos: converted.map(c => c.path),
    datePosted: els.datePosted.value || todayISO(),
    status: els.status.value
  });
}

function generateJSON() {
  const obj = buildListingObject();
  els.output.textContent = JSON.stringify(obj, null, 2);
}

async function copyJSON() {
  const txt = els.output.textContent.trim();
  if (!txt) return;
  try {
    await navigator.clipboard.writeText(txt);
    els.copy.textContent = "Copied!";
    setTimeout(() => (els.copy.textContent = "Copy JSON"), 1200);
  } catch {
    alert("Copy failed. You can still select and copy from the output box.");
  }
}

function downloadBlob(blob, filename) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1500);
}

async function downloadZip() {
  if (!window.JSZip) {
    alert("JSZip failed to load. Refresh and try again.");
    return;
  }

  const id = els.id.value || "listing";
  const zip = new JSZip();

  // JSON file (single object)
  const json = els.output.textContent.trim() || JSON.stringify(buildListingObject(), null, 2);
  zip.file(`${id}.json`, json);

  // images/<id>/photoX.ext
  if (converted.length > 0) {
    const folder = zip.folder(`images/${id}`);
    converted.forEach(c => folder.file(c.name, c.blob));
  }

  const blob = await zip.generateAsync({ type: "blob" });
  downloadBlob(blob, `${id}-package.zip`);
}

function wire() {
  // Defaults
  els.datePosted.value = todayISO();
  refreshId();
  generateJSON();

  // Update ID + JSON on edits
  els.title.addEventListener("input", () => { refreshId(); generateJSON(); });
  els.datePosted.addEventListener("change", () => { refreshId(); generateJSON(); });

  ["input","change"].forEach(evt => {
    els.category.addEventListener(evt, generateJSON);
    els.qty.addEventListener(evt, generateJSON);
    els.condition.addEventListener(evt, generateJSON);
    els.status.addEventListener(evt, generateJSON);
    els.price.addEventListener(evt, generateJSON);
    els.priceNote.addEventListener(evt, generateJSON);
    els.location.addEventListener(evt, generateJSON);
    els.description.addEventListener(evt, generateJSON);
    els.maxWidth.addEventListener(evt, () => { /* only affects next conversion */ });
    els.quality.addEventListener(evt, () => { /* only affects next conversion */ });
    els.format.addEventListener(evt, () => { /* only affects next conversion */ });
  });

  els.generate.addEventListener("click", generateJSON);
  els.copy.addEventListener("click", copyJSON);
  els.downloadZip.addEventListener("click", downloadZip);

  // File picker
  els.pickFiles.addEventListener("click", () => els.fileInput.click());
  els.fileInput.addEventListener("change", (e) => convertFiles(e.target.files));

  // Drag/drop
  ["dragenter","dragover"].forEach(evt => {
    els.dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
      els.dropzone.classList.add("dragover");
    });
  });
  ["dragleave","drop"].forEach(evt => {
    els.dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
      els.dropzone.classList.remove("dragover");
    });
  });
  els.dropzone.addEventListener("drop", (e) => {
    const dt = e.dataTransfer;
    if (dt && dt.files) convertFiles(dt.files);
  });
}

wire();
