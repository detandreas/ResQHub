/* disaster.html?id=N: event banner and its needs, grouped by organization. */
(function () {
  'use strict';
  if (!UI.initPage()) return;

  const e = Store.event(UI.param('id'));
  if (!e) {
    UI.$('event-view').hidden = true;
    UI.$('not-found').hidden = false;
    return;
  }

  const needs = Store.needsOfEvent(e.id);
  const hubs = Store.hubsOfEvent(e.id);

  document.title = `${e.title} | ResQHub`;
  UI.$('event-photo').classList.add(`photo--${UI.eventKind(e)}`);
  UI.$('event-chip').innerHTML = UI.chip(e);
  UI.$('event-title').textContent = e.title;
  UI.$('event-description').textContent = e.description;
  UI.$('event-location').textContent = e.location;
  UI.$('event-date').textContent = UI.formatDate(e.date);
  UI.$('event-needs').textContent = needs.length;
  UI.$('event-hubs').textContent = hubs.length;
  UI.$('needs-summary').textContent =
    `${UI.plural(needs.length, 'published request', 'published requests')} from ${UI.plural(hubs.length, 'organization', 'organizations')}`;

  UI.$('needs-by-hub').innerHTML = hubs.map((h) => {
    const own = needs.filter((n) => n.hubId === h.id);
    return `
      <section class="hub-group" aria-label="${UI.esc(h.name)}">
        <header class="hub-group__head">
          <div>
            <h3 class="hub-group__name">${UI.esc(h.name)}</h3>
            <a class="hub-group__mail" href="mailto:${UI.esc(h.email)}">${UI.esc(h.email)}</a>
          </div>
          <span class="hub-group__count">${UI.plural(own.length, 'need', 'needs')}</span>
        </header>
        <div class="rows">${own.map((n) => UI.needRow(n, { context: 'none' })).join('')}</div>
      </section>`;
  }).join('') || UI.empty('No needs published yet.', 'Organizations have not posted requests for this event.');
})();
