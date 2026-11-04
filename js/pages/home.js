/* index.html: hero numbers and the six largest open needs. */
(function () {
  'use strict';
  if (!UI.initPage()) return;

  const open = Store.openNeeds();

  UI.$('stat-needs').textContent = open.length;
  UI.$('stat-events').textContent = Store.events().length;
  UI.$('stat-hubs').textContent = Store.hubs().length;
  UI.$('open-count').textContent = open.length;

  UI.$('open-needs').innerHTML = open.slice(0, 6).map((n) => UI.needCard(n)).join('') ||
    UI.empty('No open needs right now.', 'Every published need is fully pledged. Check back soon.');
})();
