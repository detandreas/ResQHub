/* offers.html (Organization Representative): confirm or decline pledges for the hub's needs,
 * filtered live by search text, status and need. */
(function () {
  'use strict';
  if (!UI.initPage({ only: 'hub' })) return;

  const hub = Store.hub(Store.currentHubId());
  const list = UI.$('offers');
  const form = UI.$('filters');
  const search = UI.$('search');
  const status = UI.$('status');
  const needFilter = UI.$('need');
  const count = UI.$('result-count');

  const STATUS_LABELS = { pending: 'Pending', received: 'Received', declined: 'Declined' };

  needFilter.insertAdjacentHTML('beforeend', Store.needsOfHub(hub.id)
    .sort((a, b) => a.title.localeCompare(b.title))
    .map((n) => `<option value="${n.id}">${UI.esc(n.title)}</option>`)
    .join(''));

  function matches(o, query, wantedStatus, needId) {
    const n = Store.need(o.needId);
    const haystack = [o.name, o.email, n?.title].join(' ').toLowerCase();
    return (wantedStatus === 'All' || o.status === wantedStatus) &&
      (needId === 'All' || o.needId === Number(needId)) &&
      haystack.includes(query);
  }

  function offerLine(o) {
    const n = Store.need(o.needId);
    const actions = o.status === 'pending'
      ? `<button class="btn btn--loud btn--sm" type="button" data-action="received" data-id="${o.id}">Confirm receipt</button>
         <button class="btn btn--ghost btn--sm" type="button" data-action="declined" data-id="${o.id}">Decline</button>`
      : '';
    return `
      <div class="offer">
        <div class="offer__info">
          <div class="tags">
            ${n.category ? `<span class="tag">${UI.esc(n.category)}</span>` : ''}
            <span class="status status--${UI.esc(o.status)}">${UI.esc(STATUS_LABELS[o.status] || o.status)}</span>
          </div>
          <p class="offer__title">${UI.esc(n.title)} · ${o.quantity} ${UI.esc(n.unit)}</p>
          <p class="offer__meta">${UI.esc(o.name)} · ${UI.esc(o.email)}${o.phone?' · '+UI.esc(o.phone):''} · ${UI.esc(UI.formatDate(o.date))}</p>
          ${o.slot?`<p class="offer__meta"><strong>Scheduled:</strong> ${UI.esc(new Intl.DateTimeFormat('en-GB',{dateStyle:'medium',timeStyle:'short',hour12:false}).format(new Date(o.slot)))} · ${UI.esc(n.deliveryAddress||'')}</p>`:''}
        </div>
        ${actions && `<div class="offer__actions">${actions}</div>`}
      </div>`;
  }

  function render() {
    const offers = Store.offersOfHub(hub.id);
    const pending = offers.filter((o) => o.status === 'pending').length;
    const label = UI.$('pending-label');
    label.textContent = `${pending} pending`;
    label.hidden = pending === 0;

    // Status options show how many offers each status has, e.g. "Pending (2)".
    [...status.options].forEach((option) => {
      if (STATUS_LABELS[option.value]) {
        option.textContent = `${STATUS_LABELS[option.value]} (${offers.filter((o) => o.status === option.value).length})`;
      }
    });

    const query = search.value.trim().toLowerCase();
    const shown = offers.filter((o) => matches(o, query, status.value, needFilter.value));
    count.textContent = `Showing ${shown.length} of ${UI.plural(offers.length, 'offer', 'offers')}`;

    list.innerHTML = offers.length === 0
      ? UI.empty('No offers yet.', 'Pledges for your needs will appear here.')
      : shown.map(offerLine).join('') || UI.empty('No matching offers.', 'Try another name, status or need.');
    UI.refreshPendingBadge();
  }

  form.addEventListener('submit', (event) => event.preventDefault());
  search.addEventListener('input', render);
  status.addEventListener('change', render);
  needFilter.addEventListener('change', render);

  UI.$('offers-title').textContent = `Offers for ${hub.name}`;

  // ---------- Confirm or decline, after asking in a dialog ----------
  const dialog = UI.$('confirm-dialog');
  const QUESTIONS = {
    received: {
      title: 'Confirm receipt?',
      text: 'Confirm only if the aid has actually arrived. It will count as received, and this can\u2019t be undone.',
      ok: 'Yes, confirm receipt'
    },
    declined: {
      title: 'Decline this offer?',
      text: 'The quantity becomes available to other contributors again. This can\u2019t be undone.',
      ok: 'Yes, decline'
    }
  };
  let asked = null; // { id, status } the dialog is asking about

  function applyStatus(id, newStatus) {
    const result = Store.setOfferStatus(id, newStatus);
    if (!result.ok) {
      UI.notice(result.error, 'error');
    } else if (newStatus === 'received') {
      UI.notice('Receipt confirmed. The fulfilled quantity has been updated.');
    } else {
      UI.notice('Offer declined. The quantity is available again.');
    }
    render();
    UI.$('offers-title').focus(); // the clicked button is gone after the list re-renders
  }

  function ask(id, newStatus) {
    const o = Store.offersOfHub(hub.id).find((offer) => offer.id === id);
    const n = o && Store.need(o.needId);
    if (!o || !n) return applyStatus(id, newStatus); // the store explains what went wrong
    const q = QUESTIONS[newStatus];

    if (typeof dialog.showModal !== 'function') { // browsers without <dialog>
      if (window.confirm(`${q.title}\n\n${n.title} \u00b7 ${o.quantity} ${n.unit} from ${o.name}\n\n${q.text}`)) applyStatus(id, newStatus);
      return;
    }
    UI.$('dialog-title').textContent = q.title;
    UI.$('dialog-offer-title').textContent = `${n.title} \u00b7 ${o.quantity} ${n.unit}`;
    UI.$('dialog-offer-meta').textContent = `${o.name} \u00b7 ${o.email}`;
    UI.$('dialog-text').textContent = q.text;
    UI.$('dialog-ok').textContent = q.ok;
    asked = { id, status: newStatus };
    dialog.showModal(); // focus starts on Cancel (autofocus)
  }

  // "Yes" applies the change right away. Cancel, Esc and the backdrop only close the dialog.
  // (Not done in the dialog's "close" event: browsers deliver it later, on the next frame.)
  UI.$('dialog-ok').addEventListener('click', () => {
    const answer = asked;
    asked = null;
    dialog.close('ok');
    if (answer) applyStatus(answer.id, answer.status);
  });

  // A click on the dimmed backdrop (outside the box) cancels.
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close('cancel');
  });

  list.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (button) ask(Number(button.dataset.id), button.dataset.action);
  });

  render();
})();
