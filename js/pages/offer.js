/* offer.html?need=N: need summary and the pledge form. */
(function () {
  'use strict';
  if (!UI.initPage({ only: 'citizen' })) return;

  const n = Store.need(UI.param('need'));
  const e = n && Store.event(n.eventId);
  const h = n && Store.hub(n.hubId);
  if (!n || !e || !h) {
    UI.$('offer-view').hidden = true;
    UI.$('not-found').hidden = false;
    return;
  }

  const form = UI.$('offer-form');
  const qty = UI.$('qty');
  const submit = UI.$('submit-offer');
  const slots = Store.upcomingSlots(n);

  function renderSummary() {
    const left = Store.remaining(n);
    UI.$('need-requested').textContent = `${n.quantity} ${n.unit}`;
    UI.$('need-received').textContent = Store.received(n);
    UI.$('need-available').textContent = `${left} ${n.unit}`;
    qty.max = left;
    UI.$('qty-hint').textContent = left > 0
      ? `You can pledge up to ${left} ${n.unit}.`
      : 'This need is fully pledged. Thank you!';

    // Without a delivery time to choose, nothing can be pledged.
    const closed = left === 0 || slots.length === 0;
    form.querySelectorAll('input').forEach((input) => { input.disabled = closed; });
    submit.disabled = closed;
  }

  document.title = `Offer help: ${n.title} | ResQHub`;
  UI.$('need-photo').classList.add(`photo--${UI.eventKind(e)}`);
  UI.$('need-chip').innerHTML = UI.chip(e);
  UI.$('need-category').textContent = n.category;
  UI.$('need-title').textContent = n.title;
  UI.$('need-context').textContent = `${e.title} · ${h.name}`;
  UI.$('need-notes').textContent = n.notes;
  UI.$('qty-unit').textContent = n.unit;
  UI.$('delivery-address').textContent = Store.deliveryAddress(n);

  // Nothing is preselected: the contributor has to pick one of the times the organization offers.
  UI.$('delivery-slots').innerHTML = slots.map((s) => `
    <label class="choice"><input type="radio" name="slot" value="${UI.esc(s)}" required><span>${UI.esc(UI.formatSlot(s))}</span></label>`).join('') ||
    '<p class="field__hint">No delivery times are available right now. The organization needs to add new ones.</p>';
  renderSummary();

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const result = Store.addOffer(n.id, {
      name: UI.$('name').value,
      email: UI.$('email').value,
      phone: UI.$('phone').value,
      slot: form.querySelector('input[name="slot"]:checked')?.value ?? '',
      quantity: qty.value
    });

    if (!result.ok) {
      UI.notice(result.error, 'error', 'form-message');
      renderSummary();
      return;
    }

    UI.flash(`Thank you! Your offer of ${result.offer.quantity} ${n.unit} is pending confirmation by ${h.name}. ` +
      `Delivery: ${UI.formatSlot(result.offer.slot)}, ${Store.deliveryAddress(n)}.`);
    window.location.href = 'index.html';
  });
})();
