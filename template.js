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

  dropzone: document.getElementById("dropzone"),
  pickFiles: document.getElementById("pickFiles"),
  fileInput: document.getElementById("fileInput"),
  thumbs: document.getElementById("thumbs"),
  imgStatus: document.getElementById("imgStatus"),

  maxWidth: document.getElementById("maxWidth"),
  quality: document.getElementById("quality"),
  format: document.getElementById("format"),

  generate: document.getElementById("generate"),
  copy: document.getElementById("copy"),
  downloadZip: document.getElementById("downloadZip"),
  output: document.getElementById("output")
};

// Holds converted image blobs and their intended repo paths
let converted = []; // [{ path, blob, previewUrl, originalName, bytes }]

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
  const id = els.id.value;

  const photos = converted.map(x => x.path);

  return clean({
    id,
    title: els.title.value.trim(),
    category: els.category.value.trim(),
    qty: Number(els.qty.value || 0),
    condition: els.condition.value,
    price: Number(els.price.value || 0),
    priceNote: els.priceNote.value.trim(),
    location: els.location.value.trim(),
    description: els.description.value.trim(),
    photos,
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
  } catch {}
}

function setImgStatus(msg) {
  els.imgStatus.textContent = msg;
}

function clearThumbs() {
  els.thumbs.innerHTML = "";
  converted.forEach(c => {
    if (c.previewUrl) URL.revokeObjectURL(c.previewUrl);
  });
  converted = [];
  setImgStatus("");
}

function addThumb(previewUrl, label) {
  const div = document.createElement("div");
  div.className = "thumbCard";
  div.innerHTML = `
    <img src="${previewUrl}" alt="">
    <div
