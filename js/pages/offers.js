/* offers.html (Organization Representative): confirm or decline pledges for the hub's needs. */
(function () {
  'use strict';
  if (!UI.initPage({ only: 'hub' })) return;

  const hub = Store.hub(Store.CURRENT_HUB_ID);
  const list = UI.$('offers');

  function offerLine(o) {
    const n = Store.need(o.needId);
    const actions = o.status === 'pending'
      ? `<button class="btn btn--loud btn--sm" type="button" data-action="received" data-id="${o.id}">Confirm receipt</button>
         <button class="btn btn--ghost btn--sm" type="button" data-action="declined" data-id="${o.id}">Decline</button>`
      : '';
    return `
      <div class="offer">
        <div class="offer__info">
          <p class="offer__title">${UI.esc(n.title)} · ${o.quantity} ${UI.esc(n.unit)}</p>
          <p class="offer__meta">${UI.esc(o.name)} · ${UI.esc(o.email)} · ${UI.esc(UI.formatDate(o.date))}</p>
        </div>
        <div class="offer__actions">
          <span class="status status--${UI.esc(o.status)}">${UI.esc(o.status)}</span>
          ${actions}
        </div>
      </div>`;
  }

  function render() {
    const offers = Store.offersOfHub(hub.id);
    const pending = offers.filter((o) => o.status === 'pending').length;
    const label = UI.$('pending-label');
    label.textContent = `${pending} pending`;
    label.hidden = pending === 0;
    list.innerHTML = offers.map(offerLine).join('') ||
      UI.empty('No offers yet.', 'Pledges for your needs will appear here.');
    UI.refreshPendingBadge();
  }

  UI.$('offers-title').textContent = `Offers for ${hub.name}`;

  list.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const status = button.dataset.action;
    const result = Store.setOfferStatus(Number(button.dataset.id), status);
    if (!result.ok) {
      UI.notice(result.error, 'error');
    } else if (status === 'received') {
      UI.notice('Receipt confirmed. The fulfilled quantity has been updated.');
    } else {
      UI.notice('Offer declined. The quantity is available again.');
    }
    render();
  });

  render();
})();
