const els = {
  title: document.getElementById("title"),
  id: document.getElementById("id"),
  category: document.getElementById("category"),
  qty: document.getElementById("qty"),
  condition: document.getElementById("condition"),
  price: document.getElementById("price"),
  priceNote: document.getElementById("priceNote"),
  location: document.getElementById("location"),
  description: document.getElementById("description"),
  status: document.getElementById("status"),
  datePosted: document.getElementById("datePosted"),
  photos: document.getElementById("photos"),
  drop: document.getElementById("drop"),
  previews: document.getElementById("previews"),
  imgHint: document.getElementById("imgHint"),
  generate: document.getElementById("generate"),
  copy: document.getElementById("copy"),
  output: document.getElementById("output")
};

let selectedFiles = [];

function slugify(s) {
  return String(s ?? "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function setDefaultDate() {
  if (!els.datePosted.value) els.datePosted.value = todayISO();
}

function refreshId() {
  const base = slugify(els.title.value) || "listing";
  const date = (els.datePosted.value || todayISO()).replace(/-/g, "");
  els.id.value = `${base}-${date}`;
  updateImgHint();
}

function updateImgHint() {
  const id = els.id.value || "listing-id";
  els.imgHint.textContent = `Upload images to: /images/${id}/ (recommended 1–6). The listing will reference those paths.`;
}

function renderPreviews(files) {
  els.previews.innerHTML = "";
  const show = files.slice(0, 6);
  show.forEach(f => {
    const url = URL.createObjectURL(f);
    const img = document.createElement("img");
    img.src = url;
    img.alt = f.name;
    img.style.width = "100%";
    img.style.height = "70px";
    img.style.objectFit = "cover";
    img.style.borderRadius = "12px";
    img.style.border = "1px solid var(--border)";
    els.previews.appendChild(img);
  });
}

function setFilesFromInput(fileList) {
  selectedFiles = Array.from(fileList || []).filter(f => f.type.startsWith("image/")).slice(0, 6);
  renderPreviews(selectedFiles);
}

function buildPhotoPaths() {
  const id = els.id.value || "listing-id";
  // Keep original extensions where possible
  return selectedFiles.map((f, i) => {
    const ext = (f.name.split(".").pop() || "jpg").toLowerCase();
    const safeExt = ["jpg","jpeg","png","webp"].includes(ext) ? ext : "jpg";
    return `images/${id}/photo${i + 1}.${safeExt}`;
  });
}

function generateSnippet() {
  setDefaultDate();
  refreshId();

  const id = els.id.value.trim();
  const obj = {
    id,
    title: els.title.value.trim(),
    category: els.category.value.trim(),
    qty: Number(els.qty.value || 0),
    condition: els.condition.value,
    price: Number(els.price.value || 0),
    priceNote: els.priceNote.value.trim(),
    location: els.location.value.trim(),
    description: els.description.value.trim(),
    photos: buildPhotoPaths(),
    datePosted: els.datePosted.value,
    status: els.status.value
  };

  // Clean empty strings so JSON stays tidy
  for (const k of Object.keys(obj)) {
    if (typeof obj[k] === "string" && obj[k].trim() === "") delete obj[k];
  }
  if (!obj.photos.length) delete obj.photos;

  els.output.textContent = JSON.stringify(obj, null, 2);
}

async function copySnippet() {
  const text = els.output.textContent.trim();
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    els.copy.textContent = "Copied!";
    setTimeout(() => (els.copy.textContent = "Copy snippet"), 1200);
  } catch {
    // ignore
  }
}

function wire() {
  setDefaultDate();
  refreshId();

  els.title.addEventListener("input", refreshId);
  els.datePosted.addEventListener("change", refreshId);

  els.generate.addEventListener("click", generateSnippet);
  els.copy.addEventListener("click", copySnippet);

  els.photos.addEventListener("change", (e) => setFilesFromInput(e.target.files));

  // Drag/drop
  ["dragenter","dragover"].forEach(evt => {
    els.drop.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
      els.drop.style.borderColor = "#33414f";
    });
  });
  ["dragleave","drop"].forEach(evt => {
    els.drop.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
      els.drop.style.borderColor = "var(--border)";
    });
  });
  els.drop.addEventListener("drop", (e) => {
    const dt = e.dataTransfer;
    if (dt && dt.files) {
      els.photos.files = dt.files;
      setFilesFromInput(dt.files);
    }
  });
}

wire();
