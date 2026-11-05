/* dashboard.html (Organization Representative): the organization's numbers and needs. */
(function () {
  'use strict';
  if (!UI.initPage({ only: 'hub' })) return;

  const hub = Store.hub(Store.CURRENT_HUB_ID);
  const needs = Store.needsOfHub(hub.id).sort((a, b) => b.id - a.id); // newest first
  const offers = Store.offersOfHub(hub.id);
  const pending = offers.filter((o) => o.status === 'pending').length;

  UI.$('hub-name').textContent = hub.name;
  UI.$('stat-needs').textContent = needs.length;
  UI.$('stat-pending').textContent = pending;
  UI.$('stat-received').textContent = offers.filter((o) => o.status === 'received').length;
  UI.$('stat-pending-tile').classList.toggle('stat--alert', pending > 0);

  UI.$('hub-needs').innerHTML = needs.map((n) => UI.needRow(n, { context: 'event', status: true })).join('') ||
    UI.empty('No requests yet.', 'Publish your first need so contributors can pledge.',
      '<a class="btn btn--loud" href="need-form.html">Publish a need</a>');
})();
