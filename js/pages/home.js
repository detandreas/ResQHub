/* index.html: hero numbers and every need, filtered live by search, category and disaster. */
(function () {
  'use strict';
  if (!UI.initPage()) return;

  const form = UI.$('filters');
  const search = UI.$('search');
  const category = UI.$('category');
  const disaster = UI.$('disaster');
  const status = UI.$('status');
  const results = UI.$('results');
  const count = UI.$('result-count');

  const open = Store.openNeeds();

  UI.$('stat-needs').textContent = open.length;
  UI.$('stat-events').textContent = Store.events().length;
  UI.$('stat-hubs').textContent = Store.hubs().length;
  UI.$('open-count').textContent = open.length;

  disaster.insertAdjacentHTML('beforeend', Store.events()
    .map((e) => `<option value="${e.id}">${UI.esc(e.title)}</option>`)
    .join(''));

  // Open needs first (largest open quantity first), then the fully pledged ones.
  const all = [...open, ...Store.needs().filter((n) => Store.remaining(n) === 0)];

  function matches(n, query, cat, eventId, state) {
    const e = Store.event(n.eventId);
    const h = Store.hub(n.hubId);
    const haystack = [n.title, e?.title, e?.location, h?.name].join(' ').toLowerCase();
    return (cat === 'All' || n.category === cat) &&
      (eventId === 'All' || n.eventId === Number(eventId)) &&
      (state === 'All' || Store.needStatus(n) === state) &&
      haystack.includes(query);
  }

  function render() {
    const query = search.value.trim().toLowerCase();
    const list = all.filter((n) => matches(n, query, category.value, disaster.value, status.value));

    count.textContent = `Showing ${list.length} of ${UI.plural(all.length, 'need', 'needs')}`;
    results.innerHTML = list.map((n) => UI.needCard(n)).join('') ||
      UI.empty('No matching needs.', 'Try another word, category or disaster.');
  }

  form.addEventListener('submit', (event) => event.preventDefault());
  search.addEventListener('input', render);
  category.addEventListener('change', render);
  disaster.addEventListener('change', render);
  status.addEventListener('change', render);
  form.addEventListener('reset', () => {
    // Native reset restores all controls after the current event has finished.
    requestAnimationFrame(render);
  });
  render();
})();
