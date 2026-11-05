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

  if (existing) {
    const committed = Store.received(existing) + Store.pending(existing);
    document.title = `Edit ${existing.title} | ResQHub`;
    field('form-title').textContent = 'Edit relief need';
    field('submit-need').textContent = 'Save changes';
    field('eventId').value = existing.eventId;
    field('category').value = existing.category;
    field('title').value = existing.title;
    field('quantity').value = existing.quantity;
    field('quantity').min = Math.max(1, committed);
    field('unit').value = existing.unit;
    field('notes').value = existing.notes || '';
    field('quantity-hint').textContent =
      `${committed} ${existing.unit} are already received or pledged, so the quantity cannot go below ${Math.max(1, committed)}.`;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
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

    UI.flash(result.created ? 'New need published successfully.' : 'Need updated successfully.');
    window.location.href = 'dashboard.html';
  });
})();
