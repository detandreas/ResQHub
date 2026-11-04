/* ResQHub data layer.
 *
 * Demo data is kept in localStorage so it survives page changes and reloads.
 * Pages read and change data only through the Store object. Every change
 * (addOffer, saveNeed, setOfferStatus) validates its input and returns
 * { ok: true, ... } or { ok: false, error: "message for the user" }.
 */
'use strict';

const Store = (function () {
  const KEY = 'resqhub_aid_needs_v1';
  const CURRENT_HUB_ID = 1; // the demo HubManager works for "Community Relief Network"
  const CATEGORIES = ['Goods', 'Volunteers'];
  const MAX_QUANTITY = 100000;
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const SEED = {
    events: [
      { id: 1, title: 'Thessaly Flood Response', type: 'Flood', location: 'Larissa, Greece', date: '2026-10-20', description: 'Local relief organizations are supporting families affected by flooding.' },
      { id: 2, title: 'Evia Wildfire Relief', type: 'Wildfire', location: 'Evia, Greece', date: '2026-10-29', description: 'Essential supplies are needed for displaced residents.' },
      { id: 3, title: 'Western Greece Earthquake', type: 'Earthquake', location: 'Patras, Greece', date: '2026-11-01', description: 'Community organizations are collecting essentials for affected households.' }
    ],
    hubs: [
      { id: 1, name: 'Community Relief Network', email: 'help@community.example' },
      { id: 2, name: 'Solidarity Support Hub', email: 'contact@solidarity.example' }
    ],
    needs: [
      { id: 1, eventId: 1, hubId: 1, title: 'Bottled water', unit: 'cases', quantity: 120, notes: 'Sealed cases of drinking water', category: 'Goods' },
      { id: 2, eventId: 1, hubId: 1, title: 'Blankets', unit: 'items', quantity: 80, notes: 'Clean blankets in good condition', category: 'Goods' },
      { id: 3, eventId: 1, hubId: 2, title: 'Sorting volunteers', unit: 'people', quantity: 15, notes: 'Help sort supplies at the collection point', category: 'Volunteers' },
      { id: 4, eventId: 2, hubId: 1, title: 'Hygiene kits', unit: 'kits', quantity: 50, notes: 'Soap, toothbrushes and personal care items', category: 'Goods' },
      { id: 5, eventId: 2, hubId: 2, title: 'Food packages', unit: 'packages', quantity: 75, notes: 'Non-perishable food packages', category: 'Goods' },
      { id: 6, eventId: 3, hubId: 2, title: 'Sleeping bags', unit: 'items', quantity: 40, notes: 'Clean, usable sleeping bags', category: 'Goods' }
    ],
    offers: [
      { id: 1, needId: 1, name: 'Alex Morgan', email: 'alex@example.com', quantity: 20, status: 'received', date: '2026-11-02' },
      { id: 2, needId: 2, name: 'Sam Taylor', email: 'sam@example.com', quantity: 10, status: 'pending', date: '2026-11-03' }
    ],
    nextId: 100
  };

  const db = load();

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY));
      if (isValid(saved)) return saved;
    } catch (e) {
      /* unreadable or blocked storage: fall back to the seed data */
    }
    return JSON.parse(JSON.stringify(SEED));
  }

  function isValid(data) {
    return Boolean(data) &&
      ['events', 'hubs', 'needs', 'offers'].every((key) => Array.isArray(data[key])) &&
      Number.isInteger(data.nextId);
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(db));
    } catch (e) {
      /* storage blocked: changes last until the page is closed */
    }
  }

  // ---------- Lookups ----------
  const byId = (list, id) => list.find((item) => item.id === Number(id));
  const event = (id) => byId(db.events, id);
  const hub = (id) => byId(db.hubs, id);
  const need = (id) => byId(db.needs, id);

  const offersFor = (n) => db.offers.filter((o) => o.needId === n.id);
  const sumOf = (n, status) => offersFor(n)
    .filter((o) => o.status === status)
    .reduce((total, o) => total + o.quantity, 0);

  /** Quantity the organization has confirmed as delivered. */
  const received = (n) => sumOf(n, 'received');
  /** Quantity pledged by citizens but not yet confirmed. */
  const pending = (n) => sumOf(n, 'pending');
  /** Quantity still open for new pledges. */
  const remaining = (n) => Math.max(0, n.quantity - received(n) - pending(n));
  /** Share of the requested quantity already delivered (0-100). */
  const percent = (n) => Math.min(100, Math.round((100 * received(n)) / n.quantity));

  const needsOfEvent = (eventId) => db.needs.filter((n) => n.eventId === Number(eventId));
  const needsOfHub = (hubId) => db.needs.filter((n) => n.hubId === Number(hubId));

  /** Organizations that published at least one need for an event, in hub order. */
  const hubsOfEvent = (eventId) => {
    const ids = new Set(needsOfEvent(eventId).map((n) => n.hubId));
    return db.hubs.filter((h) => ids.has(h.id));
  };

  /** Needs that can still receive pledges, largest open quantity first. */
  const openNeeds = () => db.needs
    .filter((n) => remaining(n) > 0)
    .sort((a, b) => remaining(b) - remaining(a));

  /** Offers made to one organization's needs, newest first. */
  const offersOfHub = (hubId) => db.offers
    .filter((o) => need(o.needId)?.hubId === Number(hubId))
    .sort((a, b) => b.id - a.id);

  const pendingOffersOfHub = (hubId) => offersOfHub(hubId).filter((o) => o.status === 'pending');

  // ---------- Changes ----------
  const fail = (error) => ({ ok: false, error });
  const text = (value, max) => String(value ?? '').trim().slice(0, max);
  const today = () => new Date().toISOString().slice(0, 10);

  /** A citizen pledges a quantity for a need. The offer starts as "pending". */
  function addOffer(needId, input) {
    const n = need(needId);
    if (!n) return fail('This need no longer exists.');

    const name = text(input.name, 80);
    const email = text(input.email, 120);
    const quantity = Number(input.quantity);
    const left = remaining(n);

    if (!name) return fail('Please enter your full name.');
    if (!EMAIL.test(email)) return fail('Please enter a valid email address.');
    if (left === 0) return fail('This need is already fully pledged.');
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > left) {
      return fail(`Please enter a whole number between 1 and ${left}.`);
    }

    const offer = { id: db.nextId++, needId: n.id, name, email, quantity, status: 'pending', date: today() };
    db.offers.push(offer);
    save();
    return { ok: true, offer };
  }

  /** The hub publishes a new need (needId = null) or edits one of its own. */
  function saveNeed(needId, input) {
    const existing = needId == null ? null : need(needId);
    if (needId != null && !existing) return fail('This need no longer exists.');
    if (existing && existing.hubId !== CURRENT_HUB_ID) return fail("You can only edit your own organization's needs.");

    const data = {
      eventId: Number(input.eventId),
      hubId: CURRENT_HUB_ID,
      category: String(input.category),
      title: text(input.title, 80),
      quantity: Number(input.quantity),
      unit: text(input.unit, 30),
      notes: text(input.notes, 300)
    };

    if (!event(data.eventId)) return fail('Choose a disaster event.');
    if (!CATEGORIES.includes(data.category)) return fail('Choose a category.');
    if (!data.title || !data.unit) return fail('Complete all required fields.');
    if (!Number.isInteger(data.quantity) || data.quantity < 1 || data.quantity > MAX_QUANTITY) {
      return fail(`Required quantity must be a whole number between 1 and ${MAX_QUANTITY}.`);
    }

    const committed = existing ? received(existing) + pending(existing) : 0;
    if (data.quantity < committed) {
      return fail(`Quantity cannot be lower than existing received and pending offers (${committed}).`);
    }

    if (existing) Object.assign(existing, data);
    else db.needs.push({ id: db.nextId++, ...data });
    save();
    return { ok: true, created: !existing };
  }

  /** The hub confirms ("received") or declines a pending offer for one of its needs. */
  function setOfferStatus(offerId, status) {
    const offer = byId(db.offers, offerId);
    if (!offer || offer.status !== 'pending') return fail('This offer has already been handled.');
    if (need(offer.needId)?.hubId !== CURRENT_HUB_ID) return fail('This offer belongs to another organization.');
    if (status !== 'received' && status !== 'declined') return fail('Unknown offer status.');

    offer.status = status;
    save();
    return { ok: true, offer };
  }

  return {
    CURRENT_HUB_ID,
    CATEGORIES,
    MAX_QUANTITY,
    events: () => db.events,
    hubs: () => db.hubs,
    needs: () => db.needs,
    event,
    hub,
    need,
    received,
    pending,
    remaining,
    percent,
    needsOfEvent,
    needsOfHub,
    hubsOfEvent,
    openNeeds,
    offersOfHub,
    pendingOffersOfHub,
    addOffer,
    saveNeed,
    setOfferStatus
  };
})();
