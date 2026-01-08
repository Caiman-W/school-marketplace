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
  photos: document.getElementById("photos"),
  generate: document.getElementById("generate"),
  copy: document.getElementById("copy"),
  download: document.getElementById("download"),
  output: document.getElementById("output")
};

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

function parsePhotoLines() {
  return String(els.photos.value || "")
    .split("\n")
    .map(s => s.trim())
    .filter(Boolean)
    .slice(0, 6);
}

function buildObj() {
  refreshId();
  return {
    id: els.id.value,
    title: els.title.value.trim(),
    category: els.category.value.trim(),
    qty: Number(els.qty.value || 0),
    condition: els.condition.value,
    price: Number(els.price.value || 0),
    priceNote: els.priceNote.value.trim(),
    location: els.location.value.trim(),
    description: els.description.value.trim(),
    photos: parsePhotoLines(),
    datePosted: els.datePosted.value || todayISO(),
    status: els.status.value
  };
}

function clean(obj) {
  const out = { ...obj };
  for (const k of Object.keys(out)) {
    if (typeof out[k] === "string" && out[k].trim() === "") delete out[k];
  }
  if (Array.isArray(out.photos) && out.photos.length === 0) delete out.photos;
  return out;
}

function generate() {
  const obj = clean(buildObj());
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

function downloadJSON() {
  const txt = els.output.textContent.trim();
  if (!txt) return;
  const blob = new Blob([txt], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${els.id.value || "listing"}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1500);
}

function init() {
  els.datePosted.value = todayISO();
  refreshId();
  generate();

  els.title.addEventListener("input", () => { refreshId(); generate(); });
  els.datePosted.addEventListener("change", () => { refreshId(); generate(); });

  ["input","change"].forEach(evt => {
    els.category.addEventListener(evt, generate);
    els.qty.addEventListener(evt, generate);
    els.condition.addEventListener(evt, generate);
    els.status.addEventListener(evt, generate);
    els.price.addEventListener(evt, generate);
    els.priceNote.addEventListener(evt, generate);
    els.location.addEventListener(evt, generate);
    els.description.addEventListener(evt, generate);
    els.photos.addEventListener(evt, generate);
  });

  els.generate.addEventListener("click", generate);
  els.copy.addEventListener("click", copyJSON);
  els.download.addEventListener("click", downloadJSON);
}

init();
