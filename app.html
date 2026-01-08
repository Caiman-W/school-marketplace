const LISTINGS_URL = "listings.json";
const CONTACT_EMAIL = "cwelch@erskinecharters.org";

const els = {
  grid: document.getElementById("grid"),
  q: document.getElementById("q"),
  category: document.getElementById("category"),
  location: document.getElementById("location"),
  condition: document.getElementById("condition"),
  status: document.getElementById("status"),
  minPrice: document.getElementById("minPrice"),
  maxPrice: document.getElementById("maxPrice"),
  sort: document.getElementById("sort"),
  reset: document.getElementById("reset"),
  count: document.getElementById("count"),
  modal: document.getElementById("modal"),
  modalTitle: document.getElementById("modalTitle"),
  modalBody: document.getElementById("modalBody"),
  closeModal: document.getElementById("closeModal")
};

let listings = [];

function money(n) {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return "";
  if (Number(n) === 0) return "$0";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function safeText(s) {
  return String(s ?? "").replace(/[<>&]/g, c => ({ "<":"&lt;", ">":"&gt;", "&":"&amp;" }[c]));
}

function buildOptions(selectEl, values) {
  const current = selectEl.value;
  selectEl.innerHTML = `<option value="">All</option>` + values
    .map(v => `<option value="${safeText(v)}">${safeText(v)}</option>`)
    .join("");
  // Keep selection if still exists
  if ([...selectEl.options].some(o => o.value === current)) selectEl.value = current;
}

function populateFilters(data) {
  const categories = [...new Set(data.map(d => d.category).filter(Boolean))].sort();
  const locations = [...new Set(data.map(d => d.location).filter(Boolean))].sort();
  buildOptions(els.category, categories);
  buildOptions(els.location, locations);
}

function getFiltered() {
  const q = els.q.value.trim().toLowerCase();
  const category = els.category.value;
  const location = els.location.value;
  const condition = els.condition.value;
  const status = els.status.value;

  const minP = els.minPrice.value === "" ? null : Number(els.minPrice.value);
  const maxP = els.maxPrice.value === "" ? null : Number(els.maxPrice.value);

  let out = listings.slice();

  if (q) {
    out = out.filter(l => {
      const hay = [
        l.title, l.category, l.location, l.condition, l.status, l.description
      ].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }
  if (category) out = out.filter(l => l.category === category);
  if (location) out = out.filter(l => l.location === location);
  if (condition) out = out.filter(l => l.condition === condition);
  if (status) out = out.filter(l => l.status === status);

  if (minP !== null) out = out.filter(l => Number(l.price ?? 0) >= minP);
  if (maxP !== null) out = out.filter(l => Number(l.price ?? 0) <= maxP);

  // Sorting
  const sort = els.sort.value;
  out.sort((a, b) => {
    if (sort === "newest") return String(b.datePosted).localeCompare(String(a.datePosted));
    if (sort === "price_asc") return Number(a.price ?? 0) - Number(b.price ?? 0);
    if (sort === "price_desc") return Number(b.price ?? 0) - Number(a.price ?? 0);
    if (sort === "qty_desc") return Number(b.qty ?? 0) - Number(a.qty ?? 0);
    return 0;
  });

  return out;
}

function statusClass(s) {
  const x = String(s || "").toLowerCase();
  if (x === "available") return "available";
  if (x === "pending") return "pending";
  if (x === "sold") return "sold";
  return "";
}

function render() {
  const data = getFiltered();
  els.count.textContent = `${data.length} listing${data.length === 1 ? "" : "s"} shown`;

  if (data.length === 0) {
    els.grid.innerHTML = `<div class="card">No listings match your filters.</div>`;
    return;
  }

  els.grid.innerHTML = data.map(l => {
    const thumb = (l.photos && l.photos[0]) ? l.photos[0] : "";
    const priceLine = l.price === 0 ? "Free" : money(l.price);
    const priceNote = l.priceNote ? ` <span class="muted" style="font-size:12px;font-weight:600;">${safeText(l.priceNote)}</span>` : "";
    return `
      <article class="card item">
        <div class="thumb">
          ${thumb ? `<img src="${safeText(thumb)}" alt="${safeText(l.title)}" loading="lazy">` : `<div class="muted">No image</div>`}
          <div class="badges">
            <span class="badge ${statusClass(l.status)}">${safeText(l.status || "Available")}</span>
            ${l.category ? `<span class="badge">${safeText(l.category)}</span>` : ""}
          </div>
        </div>
        <div class="body">
          <h3 class="title">${safeText(l.title)}</h3>
          <div class="meta">
            <span><b>Qty:</b> ${safeText(l.qty ?? "")}</span>
            <span><b>Condition:</b> ${safeText(l.condition ?? "")}</span>
            <span><b>Location:</b> ${safeText(l.location ?? "")}</span>
          </div>
          <div class="price">${priceLine}${priceNote}</div>
          <div class="actions">
            <button class="btn btn-secondary" type="button" data-action="details" data-id="${safeText(l.id)}">View details</button>
            <a class="btn" href="${buildMailto(l)}">Contact</a>
          </div>
        </div>
      </article>
    `;
  }).join("");

  // Wire up details buttons
  els.grid.querySelectorAll('[data-action="details"]').forEach(btn => {
    btn.addEventListener("click", () => openModal(btn.getAttribute("data-id")));
  });
}

function buildMailto(listing) {
  const subject = `Listing inquiry: ${listing.title}`;
  const lines = [
    `I’m interested in this listing:`,
    `- Title: ${listing.title}`,
    `- ID: ${listing.id}`,
    `- Category: ${listing.category}`,
    `- Qty: ${listing.qty}`,
    `- Condition: ${listing.condition}`,
    `- Price: ${listing.price === 0 ? "Free" : money(listing.price)} ${listing.priceNote || ""}`.trim(),
    `- Location: ${listing.location}`,
    ``,
    `Message:`
  ];
  const body = lines.join("\n");
  const url = `mailto:${encodeURIComponent(CONTACT_EMAIL)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return url;
}

function openModal(id) {
  const l = listings.find(x => x.id === id);
  if (!l) return;

  els.modalTitle.textContent = l.title;

  const photos = (l.photos || []).slice(0, 6);
  const gallery = photos.length
    ? `<div class="gallery">${photos.map(p => `<img src="${safeText(p)}" alt="${safeText(l.title)}">`).join("")}</div>`
    : `<div class="card muted">No photos provided.</div>`;

  const priceLine = l.price === 0 ? "Free" : money(l.price);

  els.modalBody.innerHTML = `
    <div class="modal-content">
      <div>
        ${gallery}
      </div>
      <div class="detail">
        <p><b>Status:</b> ${safeText(l.status || "Available")}</p>
        <p><b>Category:</b> ${safeText(l.category || "")}</p>
        <p><b>Quantity:</b> ${safeText(l.qty ?? "")}</p>
        <p><b>Condition:</b> ${safeText(l.condition || "")}</p>
        <p><b>Location:</b> ${safeText(l.location || "")}</p>
        <p><b>Date posted:</b> ${safeText(l.datePosted || "")}</p>
        <p><b>Price:</b> ${safeText(priceLine)} ${l.priceNote ? `<span class="muted">(${safeText(l.priceNote)})</span>` : ""}</p>
        <hr style="border:0;border-top:1px solid var(--border);margin:12px 0;">
        <p><b>Description</b><br>${safeText(l.description || "").replace(/\n/g, "<br>")}</p>
        <div class="actions" style="margin-top:12px;">
          <a class="btn" href="${buildMailto(l)}">Contact</a>
          <button class="btn btn-secondary" type="button" id="copyLink">Copy listing link</button>
        </div>
      </div>
    </div>
  `;

  els.modal.showModal();

  const copyBtn = document.getElementById("copyLink");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const url = new URL(window.location.href);
      url.hash = `listing=${encodeURIComponent(l.id)}`;
      try {
        await navigator.clipboard.writeText(url.toString());
        copyBtn.textContent = "Copied!";
        setTimeout(() => (copyBtn.textContent = "Copy listing link"), 1200);
      } catch {
        // ignore
      }
    });
  }
}

function closeModal() {
  if (els.modal.open) els.modal.close();
}

async function load() {
  const res = await fetch(LISTINGS_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load ${LISTINGS_URL}`);
  listings = await res.json();

  populateFilters(listings);
  render();

  // support deep-link by hash
  const hash = window.location.hash || "";
  const m = hash.match(/listing=([^&]+)/);
  if (m) {
    const id = decodeURIComponent(m[1]);
    const found = listings.find(x => x.id === id);
    if (found) openModal(id);
  }
}

function wireEvents() {
  const rerender = () => render();
  ["input", "change"].forEach(evt => {
    els.q.addEventListener(evt, rerender);
    els.category.addEventListener(evt, rerender);
    els.location.addEventListener(evt, rerender);
    els.condition.addEventListener(evt, rerender);
    els.status.addEventListener(evt, rerender);
    els.minPrice.addEventListener(evt, rerender);
    els.maxPrice.addEventListener(evt, rerender);
    els.sort.addEventListener(evt, rerender);
  });

  els.reset.addEventListener("click", () => {
    els.q.value = "";
    els.category.value = "";
    els.location.value = "";
    els.condition.value = "";
    els.status.value = "";
    els.minPrice.value = "";
    els.maxPrice.value = "";
    els.sort.value = "newest";
    render();
  });

  els.closeModal.addEventListener("click", closeModal);
  els.modal.addEventListener("click", (e) => {
    if (e.target === els.modal) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}

wireEvents();
load().catch(err => {
  els.grid.innerHTML = `<div class="card">Error loading listings. Check that <code>listings.json</code> exists and is valid JSON.</div>`;
  console.error(err);
});

