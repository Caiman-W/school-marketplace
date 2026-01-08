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
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  }[m]));
}

function money(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return "";
  return "$" + num.toLocaleString("en-US");
}

function showError(message) {
  els.count.textContent = "";
  els.grid.innerHTML = `
    <div class="card">
      <b>Listings failed to load.</b><br><br>
      <div class="muted">${escapeHtml(message)}</div><br>
      <div class="muted">
        Check that <code>listings.json</code> is valid JSON and available at:<br>
        <code>${escapeHtml(new URL("listings.json", window.location.href).toString())}</code>
      </div>
    </div>
  `;
}

fetch("listings.json", { cache: "no-store" })
  .then((r) => {
    if (!r.ok) throw new Error(`Could not load listings.json (HTTP ${r.status})`);
    return r.json();
  })
  .then((data) => {
    if (!Array.isArray(data)) {
      throw new Error("listings.json must be a JSON array: [ { ... }, { ... } ]");
    }
    listings = data;
    populateFilters();
    render();
  })
  .catch((err) => {
    console.error(err);
    showError(err.message || "Unknown error");
  });

function populateFilters() {
  const cats = [...new Set(listings.map(l => l.category).filter(Boolean))].sort();
  const locs = [...new Set(listings.map(l => l.location).filter(Boolean))].sort();

  els.category.innerHTML =
    `<option value="">All</option>` +
    cats.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");

  els.location.innerHTML =
    `<option value="">All</option>` +
    locs.map(l => `<option value="${escapeHtml(l)}">${escapeHtml(l)}</option>`).join("");
}

function buildMailto(listing) {
  const subject = `Listing inquiry: ${listing.title || listing.id || "Equipment"}`;
  const lines = [
    `I’m interested in this listing:`,
    `Title: ${listing.title || ""}`,
    `ID: ${listing.id || ""}`,
    `Category: ${listing.category || ""}`,
    `Qty: ${listing.qty ?? ""}`,
    `Condition: ${listing.condition || ""}`,
    `Price: ${listing.price === 0 ? "Free" : money(listing.price)} ${listing.priceNote || ""}`.trim(),
    `Location: ${listing.location || ""}`,
    ``,
    `My message:`
  ];
  return `mailto:${encodeURIComponent(CONTACT_EMAIL)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
}

function render() {
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

  data.sort((a, b) => {
    if (els.sort.value === "newest") return String(b.datePosted || "").localeCompare(String(a.datePosted || ""));
    if (els.sort.value === "price_asc") return Number(a.price ?? 0) - Number(b.price ?? 0);
    if (els.sort.value === "price_desc") return Number(b.price ?? 0) - Number(a.price ?? 0);
    if (els.sort.value === "qty_desc") return Number(b.qty ?? 0) - Number(a.qty ?? 0);
    return 0;
  });

  els.count.textContent = `${data.length} listing${data.length === 1 ? "" : "s"}`;

  if (data.length === 0) {
    els.grid.innerHTML = `<div class="card">No listings match your filters.</div>`;
    return;
  }

  els.grid.innerHTML = data.map(l => {
    const img = l.photos && l.photos[0] ? `<img src="${escapeHtml(l.photos[0])}" alt="${escapeHtml(l.title || "")}">` : "";
    const price = (l.price === 0) ? "Free" : money(l.price);
    const note = l.priceNote ? ` <span class="muted" style="font-size:12px;">${escapeHtml(l.priceNote)}</span>` : "";

    return `
      <div class="card item">
        <div class="thumb">${img}</div>
        <div class="body">
          <strong>${escapeHtml(l.title || "")}</strong>
          <div class="muted">${escapeHtml(l.location || "")} • ${escapeHtml(l.condition || "")}</div>
          <div class="price">${escapeHtml(price)}${note}</div>
          <div class="actions">
            <button class="btn-secondary btn" data-id="${escapeHtml(l.id)}">View</button>
            <a class="btn" href="${buildMailto(l)}">Contact</a>
          </div>
        </div>
      </div>
    `;
  }).join("");

  // safer than inline onclick
  els.grid.querySelectorAll("button[data-id]").forEach(btn => {
    btn.addEventListener("click", () => openModal(btn.getAttribute("data-id")));
  });
}

function openModal(id) {
  const l = listings.find(x => x.id === id);
  if (!l) return;

  els.modalTitle.textContent = l.title || "";

  els.modalBody.innerHTML = `
    <p><b>Category:</b> ${escapeHtml(l.category || "")}</p>
    <p><b>Quantity:</b> ${escapeHtml(l.qty ?? "")}</p>
    <p><b>Condition:</b> ${escapeHtml(l.condition || "")}</p>
    <p><b>Location:</b> ${escapeHtml(l.location || "")}</p>
    <p><b>Description:</b><br>${escapeHtml(l.description || "").replace(/\n/g, "<br>")}</p>
  `;

  els.modal.showModal();
}

els.closeModal.onclick = () => els.modal.close();
els.q.oninput = els.category.onchange = els.location.onchange = els.sort.onchange = render;
els.reset.onclick = () => {
  els.q.value = "";
  els.category.value = "";
  els.location.value = "";
  els.sort.value = "newest";
  render();
};
