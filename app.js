const CONTACT_EMAIL = "cwelch@erskinecharters.org";

const els = {
  grid: document.getElementById("grid"),
  q: document.getElementById("q"),
  category: document.getElementById("category"),
  location: document.getElementById("location"),
  sort: document.getElementById("sort"),
  reset: document.getElementById("reset"),
  count: document.getElementById("count"),
  modal: document.getElementById("modal"),
  modalTitle: document.getElementById("modalTitle"),
  modalBody: document.getElementById("modalBody"),
  closeModal: document.getElementById("closeModal")
};

let listings = [];

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (m) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
  }[m]));
}

function money(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return "";
  return "$" + num.toLocaleString("en-US");
}

function showCard(title, message) {
  els.grid.innerHTML = `
    <div class="card">
      <b>${escapeHtml(title)}</b><br><br>
      <div class="muted">${escapeHtml(message)}</div>
    </div>
  `;
}

function buildMailto(listing) {
  const subject = `Listing inquiry: ${listing.title || listing.id || "Equipment"}`;
  const lines = [
    "I’m interested in this listing:",
    `Title: ${listing.title || ""}`,
    `ID: ${listing.id || ""}`,
    `Category: ${listing.category || ""}`,
    `Qty: ${listing.qty ?? ""}`,
    `Condition: ${listing.condition || ""}`,
    `Price: ${listing.price === 0 ? "Free" : money(listing.price)} ${listing.priceNote || ""}`.trim(),
    `Location: ${listing.location || ""}`,
    "",
    "My message:"
  ];
  return `mailto:${encodeURIComponent(CONTACT_EMAIL)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
}

function populateFilters() {
  const cats = [...new Set(listings.map(l => l.category).filter(Boolean))].sort();
  const locs = [...new Set(listings.map(l => l.location).filter(Boolean))].sort();

  els.category.innerHTML = `<option value="">All</option>` + cats.map(c =>
    `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`
  ).join("");

  els.location.innerHTML = `<option value="">All</option>` + locs.map(l =>
    `<option value="${escapeHtml(l)}">${escapeHtml(l)}</option>`
  ).join("");
}

function getFiltered() {
  let data = [...listings];

  const q = (els.q.value || "").toLowerCase().trim();
  if (q) {
    data = data.filter(l => {
      const hay = `${l.title ?? ""} ${l.description ?? ""} ${l.category ?? ""} ${l.location ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }

  if (els.category.value) data = data.filter(l => (l.category || "") === els.category.value);
  if (els.location.value) data = data.filter(l => (l.location || "") === els.location.value);

  const sort = els.sort.value;
  data.sort((a, b) => {
    if (sort === "newest") return String(b.datePosted || "").localeCompare(String(a.datePosted || ""));
    if (sort === "price_asc") return Number(a.price ?? 0) - Number(b.price ?? 0);
    if (sort === "price_desc") return Number(b.price ?? 0) - Number(a.price ?? 0);
    if (sort === "qty_desc") return Number(b.qty ?? 0) - Number(a.qty ?? 0);
    return 0;
  });

  return data;
}

function render() {
  const data = getFiltered();
  els.count.textContent = `${data.length} listing${data.length === 1 ? "" : "s"}`;

  if (data.length === 0) {
    showCard("No listings found", "Try clearing search or changing filters.");
    return;
  }

  els.grid.innerHTML = data.map(l => {
    const img = (l.photos && l.photos[0])
      ? `<img src="${escapeHtml(l.photos[0])}" alt="${escapeHtml(l.title || "")}">`
      : "";

    const price = (l.price === 0) ? "Free" : money(l.price);
    const note = l.priceNote ? ` <span class="muted small">(${escapeHtml(l.priceNote)})</span>` : "";
    const desc = (l.description || "").trim();
    const snippet = desc.length > 140 ? desc.slice(0, 140) + "…" : desc;

    return `
      <div class="card item">
        <div class="thumb">${img}</div>
        <div class="body">
          <strong>${escapeHtml(l.title || "")}</strong>
          <div class="meta">${escapeHtml(l.location || "")} • ${escapeHtml(l.condition || "")} • Qty ${escapeHtml(l.qty ?? "")}</div>
          <div class="price">${escapeHtml(price)}${note}</div>
          <div class="desc-box">${escapeHtml(snippet || "No description provided.")}</div>
          <div class="actions">
            <button class="btn btn-secondary" data-id="${escapeHtml(l.id)}" type="button">View</button>
            <a class="btn" href="${buildMailto(l)}">Contact</a>
          </div>
        </div>
      </div>
    `;
  }).join("");

  els.grid.querySelectorAll("button[data-id]").forEach(btn => {
    btn.addEventListener("click", () => openModal(btn.getAttribute("data-id")));
  });
}

function openModal(id) {
  const l = listings.find(x => x.id === id);
  if (!l) return;

  els.modalTitle.textContent = l.title || "";

  const photos = (l.photos || []).slice(0, 6);
  const gallery = photos.length
    ? `<div class="gallery">${photos.map(p => `<img src="${escapeHtml(p)}" alt="${escapeHtml(l.title || "")}">`).join("")}</div>`
    : `<div class="desc-box">No photos provided.</div>`;

  const price = (l.price === 0) ? "Free" : money(l.price);

  els.modalBody.innerHTML = `
    <div class="modal-body-wrap">
      <div>${gallery}</div>
      <div>
        <div class="desc-box" style="margin-bottom:12px;">
          <b>Details</b><br>
          <div style="margin-top:8px; line-height:1.5;">
            <b>Category:</b> ${escapeHtml(l.category || "")}<br>
            <b>Quantity:</b> ${escapeHtml(l.qty ?? "")}<br>
            <b>Condition:</b> ${escapeHtml(l.condition || "")}<br>
            <b>Location:</b> ${escapeHtml(l.location || "")}<br>
            <b>Date posted:</b> ${escapeHtml(l.datePosted || "")}<br>
            <b>Price:</b> ${escapeHtml(price)} ${l.priceNote ? `<span class="muted">(${escapeHtml(l.priceNote)})</span>` : ""}<br>
            <b>Status:</b> ${escapeHtml(l.status || "")}
          </div>
        </div>

        <div class="desc-box">
          <b>Description</b><br>
          <div style="margin-top:8px; line-height:1.5;">${escapeHtml(l.description || "").replace(/\n/g, "<br>")}</div>
        </div>

        <div class="actions" style="margin-top:12px;">
          <a class="btn" href="${buildMailto(l)}">Contact</a>
        </div>
      </div>
    </div>
  `;

  els.modal.showModal();
}

function wireEvents() {
  els.closeModal.addEventListener("click", () => els.modal.close());
  els.modal.addEventListener("click", (e) => { if (e.target === els.modal) els.modal.close(); });

  els.q.addEventListener("input", render);
  els.category.addEventListener("change", render);
  els.location.addEventListener("change", render);
  els.sort.addEventListener("change", render);

  els.reset.addEventListener("click", () => {
    els.q.value = "";
    els.category.value = "";
    els.location.value = "";
    els.sort.value = "newest";
    render();
  });
}

async function loadListings() {
  els.count.textContent = "Loading…";
  showCard("Loading listings…", "One moment.");

  try {
    const res = await fetch("listings.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`Could not load listings.json (HTTP ${res.status})`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error("listings.json must be an array: [ { ... }, { ... } ]");

    listings = data;
    populateFilters();
    render();
  } catch (err) {
    console.error(err);
    els.count.textContent = "";
    showCard("Listings failed to load", err.message);
  }
}

wireEvents();
loadListings();
