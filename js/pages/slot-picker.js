/* Delivery-time picker for need-form.html: choose a day on the calendar, then tap the times
 * you can receive deliveries. Tapping a time adds it; tapping it again removes it.
 *
 * Each chosen time is one string such as '2026-11-09T14:00' (local time, 24-hour clock).
 * Loaded after js/ui.js, before js/pages/need-form.js.
 */
'use strict';

const SlotPicker = (function () {
  const TIMES = Array.from({ length: 15 }, (_, i) => `${String(i + 7).padStart(2, '0')}:00`); // 07:00 to 21:00
  const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  const pad = (n) => String(n).padStart(2, '0');
  const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const monthStart = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
  const fromYmd = (key) => new Date(Number(key.slice(0, 4)), Number(key.slice(5, 7)) - 1, Number(key.slice(8, 10)));
  const addDays = (key, days) => {
    const d = fromYmd(key);
    d.setDate(d.getDate() + days);
    return ymd(d);
  };

  /**
   * Fill the element `root` with the picker. `initial` is the list of times already chosen.
   * Returns { get() } with the chosen times, earliest first.
   */
  function mount(root, initial = []) {
    const todayKey = ymd(new Date());
    let slots = [...initial].sort();
    let selected = slots.length ? slots[0].slice(0, 10) : addDays(todayKey, 1); // the day whose times are shown
    let view = monthStart(fromYmd(selected)); // the month the calendar shows
    let cursor = selected; // the day that gets the keyboard focus

    const has = (slot) => slots.includes(slot);
    const label = (text) => UI.esc(text);

    function calendar() {
      const y = view.getFullYear();
      const m = view.getMonth();
      const lead = (new Date(y, m, 1).getDay() + 6) % 7; // the week starts on Monday
      const days = new Date(y, m + 1, 0).getDate();
      const keyOf = (d) => `${y}-${pad(m + 1)}-${pad(d)}`;
      const count = (key) => slots.filter((s) => s.startsWith(key)).length;
      const firstOpen = Array.from({ length: days }, (_, i) => keyOf(i + 1)).find((k) => k >= todayKey);
      const anchor = cursor.startsWith(`${y}-${pad(m + 1)}`) && cursor >= todayKey ? cursor : firstOpen; // the one tab stop

      let cells = WEEKDAYS.map((d) => `<span class="cal__dow" aria-hidden="true">${d}</span>`).join('');
      cells += '<span></span>'.repeat(lead);
      for (let d = 1; d <= days; d++) {
        const key = keyOf(d);
        const n = count(key);
        const name = new Date(y, m, d).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        cells += `<button type="button" class="cal__day${key === todayKey ? ' is-today' : ''}${n ? ' has-times' : ''}"` +
          ` data-key="day:${key}" data-date="${key}" aria-pressed="${key === selected}"` +
          ` aria-label="${label(name + (n ? `, ${n} ${n === 1 ? 'time' : 'times'} chosen` : ''))}"` +
          ` tabindex="${key === anchor ? 0 : -1}"${key < todayKey ? ' disabled' : ''}>${d}</button>`;
      }

      const monthName = view.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
      const canGoBack = view > monthStart(new Date());
      return `
        <div class="cal">
          <div class="cal__head">
            <button type="button" class="cal__nav" data-key="prev" aria-label="Previous month"${canGoBack ? '' : ' disabled'}>‹</button>
            <strong aria-live="polite">${label(monthName)}</strong>
            <button type="button" class="cal__nav" data-key="next" aria-label="Next month">›</button>
          </div>
          <div class="cal__grid" role="group" aria-label="Choose a day">${cells}</div>
        </div>`;
    }

    function times() {
      const buttons = TIMES.map((time) => {
        const slot = `${selected}T${time}`;
        const past = new Date(slot) <= new Date();
        return `<button type="button" class="time" data-key="time:${time}" data-slot="${slot}" aria-pressed="${has(slot)}"${past ? ' disabled' : ''}>${time}</button>`;
      }).join('');
      return `
        <div class="times">
          <p class="times__title"><strong>${label(UI.formatSlot(`${selected}T00:00`, false))}</strong><span>Tap a time to add or remove it</span></p>
          <div class="times__grid" role="group" aria-label="Times on the chosen day, 24-hour clock">${buttons}</div>
        </div>`;
    }

    function chips() {
      return slots.map((slot) => `
        <li class="slot-chip">
          <span>${label(UI.formatSlot(slot))}</span>
          <button type="button" data-key="remove:${label(slot)}" aria-label="Remove ${label(UI.formatSlot(slot))}">×</button>
        </li>`).join('');
    }

    /** Draw everything again; the control that had the focus keeps it (or `focusKey`, if given). */
    function render(focusKey) {
      const active = document.activeElement;
      const key = focusKey || (root.contains(active) ? active.dataset.key : null);
      root.innerHTML = `<div class="slot-picker">${calendar()}${times()}</div><ul class="slot-list" aria-live="polite">${chips()}</ul>`;
      if (key) root.querySelector(`[data-key="${CSS.escape(key)}"]`)?.focus();
    }

    /** Move to another day with the arrow keys, showing its month when needed. */
    function moveTo(key) {
      if (key < todayKey) return;
      cursor = key;
      view = monthStart(fromYmd(key));
      render(`day:${key}`);
    }

    root.addEventListener('click', (event) => {
      const control = event.target.closest('button[data-key]');
      if (!control) return;
      const [kind, value] = [control.dataset.key.split(':')[0], control.dataset.key.slice(control.dataset.key.indexOf(':') + 1)];

      if (kind === 'day') {
        selected = cursor = value;
      } else if (kind === 'time') {
        const slot = control.dataset.slot;
        slots = has(slot) ? slots.filter((s) => s !== slot) : [...slots, slot].sort();
      } else if (kind === 'remove') {
        slots = slots.filter((s) => s !== value);
      } else if (kind === 'prev' || kind === 'next') {
        view = new Date(view.getFullYear(), view.getMonth() + (kind === 'next' ? 1 : -1), 1);
      }
      render();
    });

    root.addEventListener('keydown', (event) => {
      const day = event.target.closest?.('.cal__day');
      const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[event.key];
      if (!day || !step) return;
      event.preventDefault();
      moveTo(addDays(day.dataset.date, step));
    });

    render();
    return { get: () => [...slots] };
  }

  return { mount };
})();
