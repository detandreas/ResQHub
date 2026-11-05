/* need-form.html (Organization Representative): publish a new need, or edit one with ?id=N. */
(function () {
  'use strict';
  if (!UI.initPage({ only: 'hub' })) return;

  const idParam = UI.param('id');
  const existing = idParam === null ? null : Store.need(idParam);

  // Editing someone else's need (or a missing one) is not allowed.
  if (idParam !== null && (!existing || existing.hubId !== Store.CURRENT_HUB_ID)) {
    UI.$('need-panel').hidden = true;
    UI.$('not-found').hidden = false;
    return;
  }

  const form = UI.$('need-form');
  const field = (id) => UI.$(id);

  field('eventId').innerHTML = Store.events()
    .map((e) => `<option value="${e.id}">${UI.esc(e.title)}</option>`)
    .join('');

  /** Editing only: say how low the quantity can go when aid is already received or pledged. */
  function showQuantityHint(n) {
    const committed = Store.received(n) + Store.pending(n);
    const hint = field('quantity-hint');
    field('quantity').min = Math.max(1, committed);
    hint.textContent = committed > 0
      ? `${committed} ${n.unit} are already received or pledged, so the quantity cannot go below ${committed}.`
      : '';
    hint.hidden = committed === 0;
  }

  if (existing) {
    document.title = `Edit ${existing.title} | ResQHub`;
    field('form-title').textContent = 'Edit relief need';
    field('submit-need').textContent = 'Save changes';
    field('eventId').value = existing.eventId;
    field('category').value = existing.category;
    field('title').value = existing.title;
    field('quantity').value = existing.quantity;
    field('unit').value = existing.unit;
    field('notes').value = existing.notes || '';
    showQuantityHint(existing);
  }

  // ---------- Success box on top of the form ----------
  const savedBox = field('need-saved');
  const formActions = form.querySelector('.actions');

  /** Links and buttons for the box. Labels and pages are fixed strings from this file. */
  const link = (label, href, loud = false) =>
    `<a class="btn ${loud ? 'btn--loud' : 'btn--ghost'}" href="${href}">${label}</a>`;

  /** Show the box over the form; the form behind it can't be clicked or tabbed into. */
  function showSaved(title, message, actionsHtml) {
    UI.clearNotice('form-message');
    field('need-saved-title').textContent = title;
    field('need-saved-text').textContent = message;
    field('need-saved-actions').innerHTML = actionsHtml;
    form.setAttribute('inert', '');
    form.setAttribute('aria-hidden', 'true');
    formActions.hidden = true; // keeps the box's button the only loud one on screen
    savedBox.hidden = false;
    field('need-saved-box').focus();
  }

  /** "Keep editing" (edit only): close the box and go back to the form. */
  function hideSaved() {
    savedBox.hidden = true;
    form.removeAttribute('inert');
    form.removeAttribute('aria-hidden');
    formActions.hidden = false;
    field('title').focus();
  }

  savedBox.addEventListener('click', (event) => {
    if (event.target.closest('[data-action="keep-editing"]')) hideSaved();
  });

  let published = false;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (published) return; // the form is locked after publishing; never publish twice
    const result = Store.saveNeed(existing ? existing.id : null, {
      eventId: field('eventId').value,
      category: field('category').value,
      title: field('title').value,
      quantity: field('quantity').value,
      unit: field('unit').value,
      notes: field('notes').value
    });

    if (!result.ok) {
      UI.notice(result.error, 'error', 'form-message');
      return;
    }

    const n = result.need;
    const amount = `${n.quantity} ${n.unit}`;
    const eventTitle = Store.event(n.eventId)?.title || 'the event';

    if (result.created) {
      // The need is live: lock the form so it cannot be published twice.
      published = true;
      [...form.elements].forEach((el) => { el.disabled = true; });
      showSaved('Need published',
        `“${n.title}” (${amount}) is now live for ${eventTitle}. Contributors can find it on Home and pledge.`,
        link('Publish another', 'need-form.html', true) + link('View on Home', 'index.html#needs'));
    } else {
      showQuantityHint(n);
      showSaved('Changes saved',
        `“${n.title}” now asks for ${amount} for ${eventTitle}.`,
        link('Back to my organization', 'dashboard.html', true) +
        link('View on Home', 'index.html#needs') +
        '<button class="btn btn--ghost" type="button" data-action="keep-editing">Keep editing</button>');
    }
  });
})();
