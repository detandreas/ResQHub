// Use case: Search Disaster — λογική χάρτη (Β1), λίστας (Β2) και εναλλακτικών ροών (Ε1, Ε2).

(function () {
  const params = new URLSearchParams(location.search);
  // Ε1: ?empty=1 προσομοιώνει την περίπτωση χωρίς ενεργά συμβάντα
  const isEmptyDemo = params.get("empty") === "1";
  const events = isEmptyDemo ? [] : DISASTERS;

  const $ = (id) => document.getElementById(id);
  const els = {
    query: $("f-query"), type: $("f-type"), sort: $("f-sort"), order: $("f-order"),
    list: $("list"), empty: $("empty"), emptyMsg: $("empty-msg"),
    clear: $("btn-clear"), clearEmpty: $("btn-clear-empty"), count: $("result-count"),
    demoToggle: $("demo-toggle"), filters: $("filters")
  };

  // Επιλογές τύπου καταστροφής (Δ3)
  for (const [key, t] of Object.entries(DISASTER_TYPES)) {
    els.type.add(new Option(t.label, key));
  }

  // Κανονικοποίηση για αναζήτηση χωρίς τόνους / πεζά-κεφαλαία
  const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

  const disasterUrl = (ev) => `disaster.html?id=${ev.id}`;

  // ---------- Χάρτης (OpenStreetMap μέσω Leaflet) ----------
  const map = L.map("map", { worldCopyJump: true, minZoom: 2 }).setView([25, 15], 2);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  const markerLayer = L.layerGroup().addTo(map);

  function markerIcon(type) {
    const t = DISASTER_TYPES[type];
    return L.divIcon({
      className: "",
      html: `<div class="marker" style="--c:${t.color}"><img src="${t.icon}" alt=""></div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
      popupAnchor: [0, -18]
    });
  }

  function popupHtml(ev) {
    const t = DISASTER_TYPES[ev.type];
    const lvl = coverageLevel(ev.coverage);
    return `
      <div class="popup">
        <div class="popup__type">
          <span class="type-dot" style="--c:${t.color}"><img src="${t.icon}" alt=""></span>
          <strong>${t.label}</strong>
        </div>
        <div class="popup__place">${ev.city}, ${ev.country}</div>
        <dl class="popup__meta">
          <dt>Μέγεθος</dt><dd>${ev.magnitude} / 5</dd>
          <dt>Ημερομηνία</dt><dd>${formatDate(ev.date)}</dd>
          <dt>Hubs</dt><dd>${ev.hubs.length}</dd>
        </dl>
        <div class="coverage coverage--${lvl.key}">
          <div class="coverage__bar"><span style="width:${coverageWidth(ev.coverage)}%"></span></div>
          <span class="coverage__pct">${coverageText(ev.coverage)}</span>
          <span class="badge badge--${lvl.key}">${lvl.label}</span>
        </div>
        <a class="btn btn--primary btn--block" href="${disasterUrl(ev)}">Δες τις ανάγκες →</a>
      </div>`;
  }

  // Υπόμνημα (κάτω από τον χάρτη, ώστε να μην κρύβει σύμβολα)
  $("legend-types").innerHTML = Object.values(DISASTER_TYPES).map((t) => `
    <li><span class="type-dot" style="--c:${t.color}"><img src="${t.icon}" alt=""></span>${t.label}</li>`).join("");

  function renderMap(items, fit) {
    markerLayer.clearLayers();
    for (const ev of items) {
      L.marker([ev.lat, ev.lng], { icon: markerIcon(ev.type), title: `${DISASTER_TYPES[ev.type].label} – ${ev.city}` })
        .bindPopup(popupHtml(ev), { minWidth: 220 })
        .addTo(markerLayer);
    }
    if (!fit) return;
    if (items.length) {
      map.fitBounds(L.latLngBounds(items.map((e) => [e.lat, e.lng])), { padding: [40, 40], maxZoom: 6 });
    } else {
      map.setView([25, 15], 2);
    }
  }

  // ---------- Λίστα ----------
  function magnitudeDots(n) {
    let html = "";
    for (let i = 1; i <= 5; i++) html += `<i class="${i <= n ? "on" : ""}"></i>`;
    return `<span class="dots" title="Μέγεθος ${n}/5">${html}</span><span class="dots__num">${n}/5</span>`;
  }

  function renderList(items) {
    els.list.innerHTML = items.map((ev) => {
      const t = DISASTER_TYPES[ev.type];
      const lvl = coverageLevel(ev.coverage);
      return `
        <li>
          <a class="row" href="${disasterUrl(ev)}">
            <span class="row__type" data-label="Τύπος">
              <span class="type-dot" style="--c:${t.color}"><img src="${t.icon}" alt=""></span>${t.label}
            </span>
            <span class="row__place" data-label="Τοποθεσία"><strong>${ev.city}</strong><span class="muted">${ev.country}</span></span>
            <span data-label="Μέγεθος">${magnitudeDots(ev.magnitude)}</span>
            <span class="row__hubs" data-label="Hubs" title="${ev.hubs.join(", ")}">
              <span class="hub-count">${ev.hubs.length}</span><span class="muted ellipsis">${ev.hubs.length ? ev.hubs.join(", ") : "Κανένα συμβεβλημένο hub"}</span>
            </span>
            <span data-label="Ημερομηνία">${formatDate(ev.date)}</span>
            <span class="coverage coverage--${lvl.key}" data-label="Κάλυψη">
              <span class="coverage__bar"><span style="width:${coverageWidth(ev.coverage)}%"></span></span>
              <span class="coverage__pct">${coverageText(ev.coverage)}</span>
              <span class="badge badge--${lvl.key}">${lvl.label}</span>
            </span>
          </a>
        </li>`;
    }).join("");
  }

  // ---------- Φιλτράρισμα & ταξινόμηση (βήματα 5–6) ----------
  function currentResults() {
    const q = norm(els.query.value);
    const type = els.type.value;
    let items = events.filter((e) =>
      (!type || e.type === type) &&
      (!q || norm(e.country).includes(q) || norm(e.city).includes(q))
    );
    const key = els.sort.value;
    if (key) {
      const dir = els.order.value === "asc" ? 1 : -1;
      items = [...items].sort((a, b) => {
        const va = key === "date" ? Date.parse(a.date) : (a[key] ?? -1);
        const vb = key === "date" ? Date.parse(b.date) : (b[key] ?? -1);
        return (va - vb) * dir;
      });
    }
    return items;
  }

  function update({ fit = false } = {}) {
    // Ε1: Δεν υπάρχουν ενεργά συμβάντα
    if (!events.length) {
      renderMap([], false);
      renderList([]);
      els.count.textContent = "";
      els.emptyMsg.textContent = "Δεν υπάρχουν ενεργά συμβάντα";
      els.clearEmpty.hidden = true;
      els.empty.hidden = false;
      els.filters.querySelectorAll("input, select, button").forEach((c) => (c.disabled = true));
      return;
    }

    const items = currentResults();
    renderMap(items, fit);
    renderList(items);
    els.count.textContent = `Εμφανίζονται ${items.length} από ${events.length} συμβάντα`;

    // Ε2: Κανένα αποτέλεσμα αναζήτησης
    if (!items.length) {
      els.emptyMsg.textContent = "Δεν βρέθηκαν καταστροφές με αυτά τα κριτήρια";
      els.clearEmpty.hidden = false;
      els.empty.hidden = false;
    } else {
      els.empty.hidden = true;
    }
  }

  function clearFilters() {
    els.query.value = "";
    els.type.value = "";
    els.sort.value = "";
    els.order.value = "desc";
    update({ fit: true });
    els.query.focus();
  }

  els.query.addEventListener("input", () => update({ fit: true }));
  els.type.addEventListener("change", () => update({ fit: true }));
  els.sort.addEventListener("change", () => update());
  els.order.addEventListener("change", () => update());
  els.filters.addEventListener("submit", (e) => e.preventDefault());
  els.clear.addEventListener("click", clearFilters);
  els.clearEmpty.addEventListener("click", clearFilters);

  if (isEmptyDemo) {
    els.demoToggle.textContent = "Επιστροφή στα mock συμβάντα";
    els.demoToggle.href = "index.html";
  }

  update();
})();
