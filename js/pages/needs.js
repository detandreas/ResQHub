/* needs.html: every need, filtered live by search text and category. */
(function () {
  'use strict';
  if (!UI.initPage()) return;

  const form = UI.$('filters');
  const search = UI.$('search');
  const category = UI.$('category');
  const results = UI.$('results');
  const count = UI.$('result-count');

  function matches(n, query, cat) {
    const e = Store.event(n.eventId);
    const h = Store.hub(n.hubId);
    const haystack = [n.title, e?.title, e?.location, h?.name].join(' ').toLowerCase();
    return (cat === 'All' || n.category === cat) && haystack.includes(query);
  }

  function render() {
    const query = search.value.trim().toLowerCase();
    const all = Store.needs();
    const list = all.filter((n) => matches(n, query, category.value));

    count.textContent = `Showing ${list.length} of ${UI.plural(all.length, 'need', 'needs')}`;
    results.innerHTML = list.map((n) => UI.needCard(n)).join('') ||
      UI.empty('No matching needs.', 'Try another word or category.');
  }

  form.addEventListener('submit', (event) => event.preventDefault());
  search.addEventListener('input', render);
  category.addEventListener('change', render);
  render();
})();
