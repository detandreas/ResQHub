/* ResQHub data layer.
 *
 * Demo data is kept in localStorage so it survives page changes and reloads.
 * Pages read and change data only through the Store object. Every change
 * (addHub, addOffer, saveNeed, setOfferStatus) validates its input and returns
 * { ok: true, ... } or { ok: false, error: "message for the user" }.
 */
'use strict';

const Store = (function () {
  const KEY = 'resqhub_aid_needs_v4'; // bump when SEED changes so browsers load the new demo data
  const DEMO_HUB_ID = 1; // the demo Organization Representative works for "Community Relief Network"
  const CATEGORIES = ['Goods', 'Volunteers'];
  const MAX_QUANTITY = 100000;
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const SLOT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/; // a delivery time: 2026-11-09T14:00 (local time)

  const SEED = {
    events: [ // oldest first
      { id: 6, title: 'Crete Flash Floods', type: 'Flood', location: 'Chania, Crete', date: '2026-09-28', description: 'Flash floods damaged homes, shops and roads across western Crete.' },
      { id: 7, title: 'Dodecanese Earthquake', type: 'Earthquake', location: 'Kos, Greece', date: '2026-10-08', description: 'Aftershocks keep families out of their homes while buildings are inspected.' },
      { id: 5, title: 'Attica Warehouse Fire', type: 'Industrial accident', location: 'Aspropyrgos, Greece', date: '2026-10-15', description: 'Smoke from a chemical warehouse fire forced nearby residents to evacuate.' },
      { id: 1, title: 'Thessaly Flood Response', type: 'Flood', location: 'Larissa, Greece', date: '2026-10-20', description: 'Local relief organizations are supporting families affected by flooding.' },
      { id: 2, title: 'Evia Wildfire Relief', type: 'Wildfire', location: 'Evia, Greece', date: '2026-10-29', description: 'Essential supplies are needed for displaced residents.' },
      { id: 3, title: 'Western Greece Earthquake', type: 'Earthquake', location: 'Patras, Greece', date: '2026-11-01', description: 'Community organizations are collecting essentials for affected households.' },
      { id: 4, title: 'Pelion Landslides', type: 'Landslide', location: 'Volos, Greece', date: '2026-11-03', description: 'Heavy rain set off landslides that cut road access to mountain villages.' }
    ],
    hubs: [
      { id: 1, name: 'Community Relief Network', email: 'help@community.example', address: 'Panepistimiou 10, Athens' },
      { id: 2, name: 'Solidarity Support Hub', email: 'contact@solidarity.example', address: 'Egnatia 42, Thessaloniki' }
    ],
    needs: [
      { id: 1, eventId: 1, hubId: 1, title: 'Bottled water', unit: 'cases', quantity: 120, notes: 'Sealed cases of drinking water', category: 'Goods' },
      { id: 2, eventId: 1, hubId: 1, title: 'Blankets', unit: 'items', quantity: 80, notes: 'Clean blankets in good condition', category: 'Goods' },
      { id: 3, eventId: 1, hubId: 2, title: 'Sorting volunteers', unit: 'people', quantity: 15, notes: 'Help sort supplies at the collection point', category: 'Volunteers' },
      { id: 4, eventId: 2, hubId: 1, title: 'Hygiene kits', unit: 'kits', quantity: 50, notes: 'Soap, toothbrushes and personal care items', category: 'Goods' },
      { id: 5, eventId: 2, hubId: 2, title: 'Food packages', unit: 'packages', quantity: 75, notes: 'Non-perishable food packages', category: 'Goods' },
      { id: 6, eventId: 3, hubId: 2, title: 'Sleeping bags', unit: 'items', quantity: 40, notes: 'Clean, usable sleeping bags', category: 'Goods' },
      // Community Relief Network (the demo organization): one of each status on "My organization".
      { id: 7, eventId: 4, hubId: 1, title: 'Shovels and work gloves', unit: 'sets', quantity: 30, notes: 'For clearing mud and debris from village roads', category: 'Goods' }, // completed
      { id: 8, eventId: 4, hubId: 1, title: 'Road-clearing volunteers', unit: 'people', quantity: 12, notes: 'Weekend shifts with the municipal crews', category: 'Volunteers' }, // fully pledged, partly received
      { id: 9, eventId: 5, hubId: 1, title: 'FFP2 face masks', unit: 'boxes', quantity: 60, notes: 'Boxes of 20, for residents returning home', category: 'Goods' }, // fully pledged, nothing received yet
      { id: 10, eventId: 6, hubId: 1, title: 'Dehumidifiers', unit: 'units', quantity: 10, notes: 'To dry out flooded ground-floor homes', category: 'Goods' }, // completed
      { id: 11, eventId: 7, hubId: 1, title: 'First aid kits', unit: 'kits', quantity: 40, notes: 'Sealed, in-date kits for temporary shelters', category: 'Goods' }, // available
      // Solidarity Support Hub
      { id: 12, eventId: 5, hubId: 2, title: 'Shelter volunteers', unit: 'people', quantity: 20, notes: 'Evening shifts at the evacuation centre', category: 'Volunteers' },
      { id: 13, eventId: 6, hubId: 2, title: 'Cleaning kits', unit: 'kits', quantity: 100, notes: 'Bleach, mops, buckets and gloves', category: 'Goods' },
      { id: 14, eventId: 7, hubId: 2, title: 'Family tents', unit: 'items', quantity: 25, notes: 'Waterproof tents for four or more people', category: 'Goods' }
    ],
    // Same shape as offers made through addOffer: contact details plus the chosen delivery time (slot).
    // Delivered offers have a slot in the past; pending ones are still due (except #13, delivered but not yet confirmed).
    offers: [
      { id: 1, needId: 1, name: 'Alex Morgan', email: 'alex@example.com', phone: '6912345678', quantity: 20, status: 'received', date: '2026-11-02', slot: '2026-11-03T10:00' },
      { id: 2, needId: 2, name: 'Sam Taylor', email: 'sam@example.com', phone: '6944123456', quantity: 10, status: 'pending', date: '2026-11-03', slot: '2026-11-08T10:00' },
      { id: 3, needId: 7, name: 'Maria Papadopoulou', email: 'maria@example.com', phone: '6977234567', quantity: 18, status: 'received', date: '2026-11-03', slot: '2026-11-04T10:00' },
      { id: 4, needId: 7, name: 'Nikos Georgiou', email: 'nikos@example.com', phone: '6988345678', quantity: 12, status: 'received', date: '2026-11-04', slot: '2026-11-05T16:00' },
      { id: 5, needId: 8, name: 'Eleni Dimitriou', email: 'eleni@example.com', phone: '6955456789', quantity: 8, status: 'received', date: '2026-11-04', slot: '2026-11-05T10:00' },
      { id: 6, needId: 8, name: 'Jordan Lee', email: 'jordan@example.com', phone: '6933567890', quantity: 4, status: 'pending', date: '2026-11-05', slot: '2026-11-09T10:00' },
      { id: 7, needId: 9, name: 'Kostas Ioannou', email: 'kostas@example.com', phone: '6970678901', quantity: 40, status: 'pending', date: '2026-11-01', slot: '2026-11-08T16:00' },
      { id: 8, needId: 9, name: 'Sofia Nikolaou', email: 'sofia@example.com', phone: '6946789012', quantity: 20, status: 'pending', date: '2026-11-02', slot: '2026-11-09T16:00' },
      { id: 9, needId: 10, name: 'Alex Morgan', email: 'alex@example.com', phone: '6912345678', quantity: 10, status: 'received', date: '2026-10-02', slot: '2026-10-03T16:00' },
      { id: 10, needId: 4, name: 'Dimitra Karra', email: 'dimitra@example.com', phone: '6981890123', quantity: 15, status: 'declined', date: '2026-10-31', slot: '2026-11-02T10:00' },
      { id: 11, needId: 4, name: 'Sam Taylor', email: 'sam@example.com', phone: '6944123456', quantity: 20, status: 'pending', date: '2026-11-01', slot: '2026-11-10T10:00' },
      { id: 12, needId: 11, name: 'Jordan Lee', email: 'jordan@example.com', phone: '6933567890', quantity: 15, status: 'pending', date: '2026-11-05', slot: '2026-11-10T16:00' },
      { id: 13, needId: 12, name: 'Giorgos Vlachos', email: 'giorgos@example.com', phone: '6974901234', quantity: 6, status: 'pending', date: '2026-10-17', slot: '2026-10-19T16:00' },
      { id: 14, needId: 13, name: 'Anna Petrou', email: 'anna@example.com', phone: '6932012345', quantity: 35, status: 'received', date: '2026-10-05', slot: '2026-10-06T10:00' }
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

  /** The Organization Representative who is signed in works for this hub (the demo hub if unknown). */
  const currentHubId = () => Auth.current()?.hubId ?? DEMO_HUB_ID;

  /** Where contributors bring what they pledged: the need's own point, else its organization's address. */
  const deliveryAddress = (n) => n.deliveryAddress || hub(n.hubId)?.address || '';
  const pad = (number) => String(number).padStart(2, '0');
  const inFuture = (slot) => new Date(slot) > new Date();

  /** Times a need without its own list accepts deliveries (the demo needs): 10:00 and 16:00 on each of the next 3 days. */
  function defaultSlots() {
    const times = [];
    for (let ahead = 1; ahead <= 3; ahead++) {
      const day = new Date();
      day.setDate(day.getDate() + ahead);
      const date = `${day.getFullYear()}-${pad(day.getMonth() + 1)}-${pad(day.getDate())}`;
      times.push(`${date}T10:00`, `${date}T16:00`);
    }
    return times;
  }

  /** Delivery times a contributor can still choose from, earliest first. */
  const upcomingSlots = (n) => (n.slots || defaultSlots()).filter(inFuture).sort();

  const offersFor = (n) => db.offers.filter((o) => o.needId === n.id);
  const sumOf = (n, status) => offersFor(n)
    .filter((o) => o.status === status)
    .reduce((total, o) => total + o.quantity, 0);

  /** Quantity the organization has confirmed as delivered. */
  const received = (n) => sumOf(n, 'received');
  /** Quantity pledged by contributors but not yet confirmed. */
  const pending = (n) => sumOf(n, 'pending');
  /** Quantity still open for new pledges. */
  const remaining = (n) => Math.max(0, n.quantity - received(n) - pending(n));
  /** Share of the requested quantity already delivered (0-100). */
  const percent = (n) => Math.min(100, Math.round((100 * received(n)) / n.quantity));
  /** 'completed' once everything is received, 'pledged' when nothing is left to pledge, else 'available'. */
  const needStatus = (n) => received(n) >= n.quantity ? 'completed'
    : remaining(n) === 0 ? 'pledged' : 'available';

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

  /** A registered organization gets its own hub, so it starts with an empty list of needs. */
  function addHub(input) {
    const name = text(input.name, 100);
    const email = text(input.email, 120);
    const address = text(input.address, 200);

    if (!name) return fail('Please enter the organization name.');
    if (!address) return fail('Please enter the organization address.');
    if (db.hubs.some((h) => h.name.toLowerCase() === name.toLowerCase())) {
      return fail('An organization with this name is already registered.');
    }

    const created = { id: db.nextId++, name, email, address };
    db.hubs.push(created);
    save();
    return { ok: true, hub: created };
  }

  /** A contributor pledges a quantity for a need. The offer starts as "pending". */
  function addOffer(needId, input) {
    const n = need(needId);
    if (!n) return fail('This need no longer exists.');

    const name = text(input.name, 80);
    const email = text(input.email, 120);
    const phone = text(input.phone, 25);
    const slot = text(input.slot, 16);
    const quantity = Number(input.quantity);
    const left = remaining(n);
    const slots = upcomingSlots(n);

    if (!name) return fail('Please enter your full name.');
    if (!EMAIL.test(email)) return fail('Please enter a valid email address.');
    if (phone.replace(/\D/g, '').length < 7) return fail('Please enter a valid phone number.');
    if (left === 0) return fail('This need is already fully pledged.');
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > left) {
      return fail(`Please enter a whole number between 1 and ${left}.`);
    }
    if (slots.length === 0) return fail('This need has no delivery times available right now.');
    if (!slots.includes(slot)) return fail('Please choose one of the available delivery times.');

    const offer = { id: db.nextId++, needId: n.id, name, email, phone, quantity, status: 'pending', date: today(), slot };
    db.offers.push(offer);
    save();
    return { ok: true, offer };
  }

  /** The hub publishes a new need (needId = null) or edits one of its own. */
  function saveNeed(needId, input) {
    const existing = needId == null ? null : need(needId);
    if (needId != null && !existing) return fail('This need no longer exists.');
    if (existing && existing.hubId !== currentHubId()) return fail("You can only edit your own organization's needs.");

    const data = {
      eventId: Number(input.eventId),
      hubId: currentHubId(),
      category: String(input.category),
      title: text(input.title, 80),
      quantity: Number(input.quantity),
      unit: text(input.unit, 30),
      deliveryAddress: text(input.deliveryAddress, 250),
      slots: [...new Set(input.slots || [])].filter((s) => SLOT.test(s) && inFuture(s)).sort(),
      notes: text(input.notes, 300)
    };

    if (!event(data.eventId)) return fail('Choose a disaster event.');
    if (!CATEGORIES.includes(data.category)) return fail('Choose a category.');
    if (!data.title || !data.unit || !data.deliveryAddress) return fail('Complete all required fields.');
    if (data.slots.length === 0) return fail('Add at least one delivery time.');
    if (!Number.isInteger(data.quantity) || data.quantity < 1 || data.quantity > MAX_QUANTITY) {
      return fail(`Required quantity must be a whole number between 1 and ${MAX_QUANTITY}.`);
    }

    const committed = existing ? received(existing) + pending(existing) : 0;
    if (data.quantity < committed) {
      return fail(`Quantity cannot be lower than existing received and pending offers (${committed}).`);
    }

    let saved = existing;
    if (saved) Object.assign(saved, data);
    else db.needs.push(saved = { id: db.nextId++, ...data });
    save();
    return { ok: true, created: !existing, need: saved };
  }

  /** The hub confirms ("received") or declines a pending offer for one of its needs. */
  function setOfferStatus(offerId, status) {
    const offer = byId(db.offers, offerId);
    if (!offer || offer.status !== 'pending') return fail('This offer has already been handled.');
    if (need(offer.needId)?.hubId !== currentHubId()) return fail('This offer belongs to another organization.');
    if (status !== 'received' && status !== 'declined') return fail('Unknown offer status.');

    offer.status = status;
    save();
    return { ok: true, offer };
  }

  return {
    currentHubId,
    CATEGORIES,
    MAX_QUANTITY,
    events: () => db.events,
    hubs: () => db.hubs,
    needs: () => db.needs,
    event,
    hub,
    need,
    deliveryAddress,
    upcomingSlots,
    received,
    pending,
    remaining,
    percent,
    needStatus,
    needsOfEvent,
    needsOfHub,
    hubsOfEvent,
    openNeeds,
    offersOfHub,
    pendingOffersOfHub,
    addHub,
    addOffer,
    saveNeed,
    setOfferStatus
  };
})();
