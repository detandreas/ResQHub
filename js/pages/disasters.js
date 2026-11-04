/* disasters.html: one photo card per disaster event. */
(function () {
  'use strict';
  if (!UI.initPage()) return;

  UI.$('events').innerHTML = Store.events().map((e) => UI.eventCard(e)).join('') ||
    UI.empty('No disaster events yet.');
})();
