/* ResQHub shared page helpers: header and role, messages, HTML renderers.
 *
 * Every page loads js/store.js, then this file, then its own js/pages/<page>.js,
 * which starts with `if (!UI.initPage()) return;`.
 */
'use strict';

const UI = (function () {
  const ROLE_KEY = 'resqhub_role';
  const FLASH_KEY = 'resqhub_flash';
  const ICONS = { flood: 'icons/flood.svg', fire: 'icons/fire.svg', quake: 'icons/earthquake.svg' };

  const $ = (id) => document.getElementById(id);

  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));

  /** Read a query-string parameter, e.g. param('id') on disaster.html?id=2. */
  const param = (name) => new URLSearchParams(window.location.search).get(name);

  // ---------- Role ----------
  function getRole() {
    try {
      return localStorage.getItem(ROLE_KEY) === 'hub' ? 'hub' : 'citizen';
    } catch (e) {
      return 'citizen';
    }
  }

  function setRole(role) {
    try {
      localStorage.setItem(ROLE_KEY, role === 'hub' ? 'hub' : 'citizen');
    } catch (e) {
      /* storage blocked: the role resets on the next page */
    }
  }

  /**
   * Set up the shared header on every page.
   * Pass { hubOnly: true } on HubManager pages: citizens are sent home.
   * Returns false when the page is redirecting away.
   */
  function initPage({ hubOnly = false } = {}) {
    const role = getRole();
    if (hubOnly && role !== 'hub') {
      window.location.replace('index.html');
      return false;
    }

    document.body.dataset.role = role;

    const select = $('role');
    if (select) {
      select.value = role;
      select.addEventListener('change', () => {
        setRole(select.value);
        window.location.href = select.value === 'hub' ? 'dashboard.html' : 'index.html';
      });
    }

    refreshPendingBadge();
    showStoredFlash();
    return true;
  }

  /** Update every [data-pending-count] badge with the hub's pending offers. */
  function refreshPendingBadge() {
    const count = Store.pendingOffersOfHub(Store.CURRENT_HUB_ID).length;
    document.querySelectorAll('[data-pending-count]').forEach((badge) => {
      badge.textContent = count;
      badge.hidden = count === 0;
    });
  }

  // ---------- Messages ----------
  /** Show a message now. kind: 'ok' | 'error'. target: id of the container. */
  function notice(message, kind = 'ok', target = 'flash') {
    const box = $(target);
    if (!box) return;
    box.innerHTML = `<p class="notice notice--${kind === 'error' ? 'error' : 'ok'}">${esc(message)}</p>`;
    box.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  function clearNotice(target = 'flash') {
    const box = $(target);
    if (box) box.innerHTML = '';
  }

  /** Keep a message for the next page (shown after a redirect). */
  function flash(message, kind = 'ok') {
    try {
      sessionStorage.setItem(FLASH_KEY, JSON.stringify({ message, kind }));
    } catch (e) {
      /* storage blocked: the message is skipped */
    }
  }

  function showStoredFlash() {
    let stored = null;
    try {
      stored = JSON.parse(sessionStorage.getItem(FLASH_KEY));
      sessionStorage.removeItem(FLASH_KEY);
    } catch (e) {
      /* nothing stored */
    }
    if (stored && stored.message) notice(stored.message, stored.kind);
  }

  // ---------- Small renderers ----------
  /** 'flood' | 'fire' | 'quake': picks the photo and icon for an event. */
  function eventKind(e) {
    const type = String(e?.type || '').toLowerCase();
    if (type === 'wildfire') return 'fire';
    if (type === 'earthquake') return 'quake';
    return 'flood';
  }

  const chip = (e) => `<span class="chip"><img src="${ICONS[eventKind(e)]}" alt="">${esc(e.type)}</span>`;
  const photo = (e) => `<span class="photo photo--${eventKind(e)}" aria-hidden="true"></span>`;
  const bar = (pct) => `<progress class="bar" value="${pct}" max="100" aria-label="${pct}% received">${pct}%</progress>`;
  const plural = (count, one, many) => `${count} ${count === 1 ? one : many}`;

  /** '2026-10-20' -> '20 Oct 2026' */
  function formatDate(iso) {
    const [y, m, d] = String(iso).split('-').map(Number);
    if (!y || !m || !d) return String(iso ?? '');
    return new Date(y, m - 1, d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  /** Empty state. actionHtml must be trusted markup (a link built in code). */
  function empty(title, text = '', actionHtml = '') {
    return `<div class="empty"><p class="empty__title">${esc(title)}</p>${text ? `<p>${esc(text)}</p>` : ''}${actionHtml}</div>`;
  }

  function offerButton(n) {
    return Store.remaining(n) > 0
      ? `<a class="btn btn--loud btn--sm" href="offer.html?need=${n.id}">Offer help <span class="arrow" aria-hidden="true">→</span></a>`
      : '<span class="btn btn--sm is-disabled" aria-disabled="true">Fully pledged</span>';
  }

  // ---------- Cards and rows ----------
  /** Photo card for one need (home, explore needs). */
  function needCard(n) {
    const e = Store.event(n.eventId);
    const h = Store.hub(n.hubId);
    if (!e || !h) return '';
    const pct = Store.percent(n);
    return `
      <article class="card on-photo">
        ${photo(e)}
        <div class="card__top">${chip(e)}</div>
        <div class="card__body">
          <span class="tag">${esc(n.category)}</span>
          <h3 class="card__title">${esc(n.title)}</h3>
          <p class="card__sub">${esc(h.name)}<br>${esc(e.title)}</p>
          <div class="qty"><strong>${Store.remaining(n)}<small>${esc(n.unit)} available</small></strong><span>${pct}% received</span></div>
          ${bar(pct)}
          <p class="card__meta">${Store.received(n)} delivered · ${Store.pending(n)} pledged</p>
          <div class="card__foot"><span class="card__place">${esc(e.location)}</span>${offerButton(n)}</div>
        </div>
      </article>`;
  }

  /** Photo card for one disaster event (disasters page). */
  function eventCard(e) {
    const needs = Store.needsOfEvent(e.id);
    const open = needs.filter((n) => Store.remaining(n) > 0).length;
    return `
      <article class="card card--event on-photo">
        ${photo(e)}
        <div class="card__top">${chip(e)}<span class="chip chip--glass">${esc(formatDate(e.date))}</span></div>
        <div class="card__body">
          <h3 class="card__title">${esc(e.title)}</h3>
          <p class="card__sub">${esc(e.location)}</p>
          <p class="card__desc">${esc(e.description)}</p>
          <dl class="mini-stats">
            <div><dt>Open needs</dt><dd>${open}</dd></div>
            <div><dt>Organizations</dt><dd>${Store.hubsOfEvent(e.id).length}</dd></div>
          </dl>
          <div class="card__foot">
            <span class="card__place">${plural(needs.length, 'published request', 'published requests')}</span>
            <a class="btn btn--light btn--sm" href="disaster.html?id=${e.id}">View details <span class="arrow" aria-hidden="true">→</span></a>
          </div>
        </div>
      </article>`;
  }

  /**
   * List row for one need.
   * manager: show "Edit need" instead of "Offer help".
   * context: what the subtitle names, 'hub' | 'event' | 'none'.
   */
  function needRow(n, { manager = false, context = 'hub' } = {}) {
    const where = context === 'event' ? Store.event(n.eventId)?.title
      : context === 'hub' ? Store.hub(n.hubId)?.name : '';
    const sub = [where, n.notes].filter(Boolean).map(esc).join(' · ');
    const action = manager
      ? `<a class="btn btn--sm" href="need-form.html?id=${n.id}">Edit need</a>`
      : offerButton(n);
    return `
      <article class="row">
        <div class="row__main">
          <span class="tag">${esc(n.category)}</span>
          <h3 class="row__title">${esc(n.title)}</h3>
          ${sub ? `<p class="row__sub">${sub}</p>` : ''}
          ${bar(Store.percent(n))}
          <p class="row__meta">${Store.received(n)} received · ${Store.pending(n)} pending · ${n.quantity} ${esc(n.unit)} requested</p>
        </div>
        <div class="row__side">
          <strong class="row__qty">${Store.remaining(n)}<small>${esc(n.unit)}</small></strong>
          <span class="row__hint">still available to pledge</span>
          ${action}
        </div>
      </article>`;
  }

  return {
    $,
    esc,
    param,
    initPage,
    refreshPendingBadge,
    notice,
    clearNotice,
    flash,
    eventKind,
    chip,
    formatDate,
    plural,
    empty,
    needCard,
    eventCard,
    needRow
  };
})();
