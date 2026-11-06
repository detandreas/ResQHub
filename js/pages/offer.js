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
  const account=Auth.current();
  if(account?.firstName)UI.$('name').value=[account.firstName,account.lastName].filter(Boolean).join(' ');
  if(account?.email)UI.$('email').value=account.email;
  if(account?.phone)UI.$('phone').value=account.phone;
  const slots=Store.slotsFor(n).filter(s=>new Date(s).getTime()>Date.now());
  UI.$('delivery-address').textContent=n.deliveryAddress||e.location;
  UI.$('delivery-slot').innerHTML='<option value="">Select a delivery time</option>'+slots.map(s=>`<option value="${UI.esc(s)}">${UI.esc(new Intl.DateTimeFormat('en-GB',{dateStyle:'medium',timeStyle:'short',hour12:false}).format(new Date(s)))}</option>`).join('');

  function renderSummary() {
    const left = Store.remaining(n);
    UI.$('need-requested').textContent = `${n.quantity} ${n.unit}`;
    UI.$('need-received').textContent = Store.received(n);
    UI.$('need-available').textContent = `${left} ${n.unit}`;
    qty.max = left;
    UI.$('qty-hint').textContent = left > 0
      ? `You can pledge up to ${left} ${n.unit}.`
      : 'This need is fully pledged. Thank you!';

    const closed = left === 0 || slots.length===0;
    form.querySelectorAll('input').forEach((input) => { input.disabled = closed; });
    submit.disabled = closed;
    if(!slots.length)UI.$('qty-hint').textContent='No upcoming delivery times are available. Please contact the organization.';
  }

  document.title = `Offer help: ${n.title} | ResQHub`;
  UI.$('need-photo').classList.add(`photo--${UI.eventKind(e)}`);
  UI.$('need-chip').innerHTML = UI.chip(e);
  UI.$('need-category').textContent = n.category;
  UI.$('need-title').textContent = n.title;
  UI.$('need-context').textContent = `${e.title} · ${h.name}`;
  UI.$('need-notes').textContent = n.notes;
  UI.$('qty-unit').textContent = n.unit;
  renderSummary();

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const result = Store.addOffer(n.id, {
      name: UI.$('name').value,
      email: UI.$('email').value,
      phone:UI.$('phone').value,
      slot:UI.$('delivery-slot').value,
      quantity: qty.value
    });

    if (!result.ok) {
      UI.notice(result.error, 'error', 'form-message');
      renderSummary();
      return;
    }

    UI.$('offer-view').hidden = true;
    UI.$('offer-intro').hidden = true;
    UI.$('offer-success-message').textContent = `Your offer of ${result.offer.quantity} ${n.unit} has been successfully submitted to ${h.name}.`;
    const date = new Intl.DateTimeFormat('en-GB', { dateStyle: 'long', timeStyle: 'short', hour12: false }).format(new Date(result.offer.slot));
    UI.$('offer-success-delivery').textContent = `Scheduled delivery: ${date}. Delivery point: ${n.deliveryAddress || e.location}.`;
    UI.$('offer-success').hidden = false;
    UI.$('offer-success-box').focus();
  });
})();
