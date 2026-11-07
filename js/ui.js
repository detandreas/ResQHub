/* ResQHub shared page helpers: header and session, messages, HTML renderers.
 *
 * Every page loads js/store.js, js/auth.js, then this file, then its own
 * js/pages/<page>.js, which starts with `if (!UI.initPage()) return;`.
 */
'use strict';

const UI = (function () {
  const FLASH_KEY = 'resqhub_flash';
  const ICONS = {
    flood: 'icons/flood.svg',
    fire: 'icons/fire.svg',
    quake: 'icons/earthquake.svg',
    landslide: 'icons/landslide.svg',
    industrial: 'icons/industrial.svg'
  };

  const $ = (id) => document.getElementById(id);

  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));

  /** Read a query-string parameter, e.g. param('id') on disaster.html?id=2. */
  const param = (name) => new URLSearchParams(window.location.search).get(name);

  /**
   * The page to return to after signing in or registering (?next=offer.html?need=3).
   * Only one of this site's own pages is accepted; anything else gives null.
   */
  function nextPage() {
    const next = param('next') || '';
    return /^[a-z-]+\.html(\?[\w=&.-]*)?$/.test(next) ? next : null;
  }

  // ---------- Session ----------
  /** 'citizen' (Contributor) | 'hub' (Organization Representative) for the signed-in user. */
  const role = () => Auth.current()?.role;

  /**
   * Set up the shared header on every page except login.html.
   * Signed-out visitors go to login.html.
   * Pass { only: 'hub' } or { only: 'citizen' } on pages for one role; the other role goes home.
   * Returns false when the page is redirecting away.
   */
  function initPage({ only } = {}) {
    const user = Auth.current();
    if (!user) {
      window.location.replace('login.html');
      return false;
    }
    if (only && user.role !== only) {
      window.location.replace('index.html');
      return false;
    }

    document.body.dataset.role = user.role;

    const hub = user.role === 'hub' ? Store.hub(Store.currentHubId()) : null;
    document.querySelectorAll('[data-account-name]').forEach((el) => {
      el.textContent = hub ? hub.name : user.name || user.username;
    });
    document.querySelectorAll('[data-account-role]').forEach((el) => {
      el.textContent = user.guest ? 'Browsing only' : Auth.roleLabel(user.role);
    });
    document.querySelectorAll('[data-logout]').forEach((button) => {
      if (user.guest) {
        // A guest has nothing to log out of: the button becomes "Sign in", next to "Create account".
        button.textContent = 'Sign in';
        button.insertAdjacentHTML('afterend', '<a class="btn btn--loud btn--sm" href="register.html">Create account</a>');
        button.addEventListener('click', () => {
          Auth.logout();
          window.location.href = 'login.html';
        });
        return;
      }
      button.addEventListener('click', () => {
        Auth.logout();
        flash('You have been logged out.');
        window.location.href = 'login.html';
      });
    });

    if (hub) refreshPendingBadge();
    showStoredFlash();
    return true;
  }

  /** Update every [data-pending-count] badge with the hub's pending offers. */
  function refreshPendingBadge() {
    const count = Store.pendingOffersOfHub(Store.currentHubId()).length;
    document.querySelectorAll('[data-pending-count]').forEach((badge) => {
      badge.textContent = count;
      badge.hidden = count === 0;
    });
  }

  // ---------- Messages ----------
  /** Show a message now. kind: 'ok' | 'error' | 'info'. target: id of the container. */
  function notice(message, kind = 'ok', target = 'flash') {
    const box = $(target);
    if (!box) return;
    const style = kind === 'error' || kind === 'info' ? kind : 'ok';
    box.innerHTML = `<p class="notice notice--${style}">${esc(message)}</p>`;
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
  /** 'flood' | 'fire' | 'quake' | 'landslide' | 'industrial': picks the photo and icon for an event. */
  function eventKind(e) {
    const type = String(e?.type || '').toLowerCase();
    if (type === 'wildfire') return 'fire';
    if (type === 'earthquake') return 'quake';
    if (type === 'landslide') return 'landslide';
    if (type.startsWith('industrial')) return 'industrial';
    return 'flood';
  }

  /** '2026-11-09T14:00' -> 'Mon 9 Nov, 14:00' (or just 'Mon 9 Nov' with withTime = false) */
  function formatSlot(slot, withTime = true) {
    const d = new Date(slot);
    if (Number.isNaN(d.getTime())) return String(slot ?? '');
    const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
    const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()];
    return `${weekday} ${d.getDate()} ${month}${withTime ? `, ${slot.slice(11, 16)}` : ''}`; // the same text in every browser
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

  /**
   * The action for one need, by role.
   * Contributor: "Offer help" while something is still available (the status badge already says
   * "Fully pledged" or "Completed"). Organization Representative: "Edit need" on their own
   * organization's needs, nothing on other organizations' needs.
   * editClass: button style for "Edit need" ('btn--light' on photo cards).
   */
  function needAction(n, editClass = '') {
    if (role() === 'hub') {
      return n.hubId === Store.currentHubId()
        ? `<a class="${['btn', 'btn--sm', editClass].filter(Boolean).join(' ')}" href="need-form.html?id=${n.id}">Edit need</a>`
        : '';
    }
    return Store.remaining(n) > 0
      ? `<a class="btn btn--loud btn--sm" href="offer.html?need=${n.id}">Offer help <span class="arrow" aria-hidden="true">→</span></a>`
      : '';
  }

  const NEED_STATUS_LABELS = { available: 'Available', pledged: 'Fully pledged', completed: 'Completed' };
  const needStatusBadge = (n) => {
    const s = Store.needStatus(n);
    return `<span class="status status--${s}">${NEED_STATUS_LABELS[s]}</span>`;
  };

  /** "30 received · 12 pending · 100 kits requested": the same line on cards and rows. */
  const needMeta = (n) =>
    `${Store.received(n)} received · ${Store.pending(n)} pending · ${n.quantity} ${esc(n.unit)} requested`;

  // ---------- Cards and rows ----------
  /** Photo card for one need (home). */
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
          <div class="tags"><span class="tag">${esc(n.category)}</span>${needStatusBadge(n)}</div>
          <h3 class="card__title">${esc(n.title)}</h3>
          <p class="card__sub">${esc(h.name)}<br>${esc(e.title)}</p>
          <div class="qty"><strong>${Store.remaining(n)}<small>${esc(n.unit)}</small></strong></div>
          ${bar(pct)}
          <p class="card__meta">${needMeta(n)}</p>
          <div class="card__foot">${needAction(n, 'btn--light')}</div>
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
   * List row for one need, with its status badge next to the category.
   * context: what the subtitle names, 'hub' | 'event' | 'none'.
   */
  function needRow(n, { context = 'hub' } = {}) {
    const where = context === 'event' ? Store.event(n.eventId)?.title
      : context === 'hub' ? Store.hub(n.hubId)?.name : '';
    const sub = [where, n.notes].filter(Boolean).map(esc).join(' · ');
    const action = needAction(n);
    return `
      <article class="row">
        <div class="row__main">
          <div class="tags"><span class="tag">${esc(n.category)}</span>${needStatusBadge(n)}</div>
          <h3 class="row__title">${esc(n.title)}</h3>
          ${sub ? `<p class="row__sub">${sub}</p>` : ''}
          ${bar(Store.percent(n))}
          <p class="row__meta">${needMeta(n)}</p>
        </div>
        <div class="row__side">
          <strong class="row__qty">${Store.remaining(n)}<small>${esc(n.unit)}</small></strong>
          ${action}
        </div>
      </article>`;
  }

  return {
    $,
    esc,
    param,
    nextPage,
    initPage,
    refreshPendingBadge,
    notice,
    clearNotice,
    flash,
    showStoredFlash,
    eventKind,
    chip,
    formatDate,
    formatSlot,
    plural,
    empty,
    needCard,
    eventCard,
    needRow
  };
})();
