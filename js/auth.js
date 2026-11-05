/* ResQHub demo sign-in: two hard-coded accounts, no real authentication.
 *
 * The signed-in user is kept in localStorage until "Log out".
 * Loaded before js/ui.js on every page.
 */
'use strict';

const Auth = (function () {
  const KEY = 'resqhub_session';

  const ACCOUNTS = [
    { username: 'contributor', password: '123', role: 'citizen' },
    { username: 'organization', password: '123', role: 'hub' }
  ];

  // Internal role keys stay 'citizen' / 'hub'; these are the names people see.
  const ROLE_LABELS = { citizen: 'Contributor', hub: 'Organization Representative' };

  const account = (username) => ACCOUNTS.find((a) => a.username === username);

  /** Check the credentials and remember the user. Returns { ok, user } or { ok: false, error }. */
  function login(username, password) {
    const found = account(String(username ?? '').trim().toLowerCase());
    if (!found || found.password !== String(password ?? '')) {
      return { ok: false, error: 'Wrong username or password.' };
    }

    const user = { username: found.username, role: found.role };
    try {
      localStorage.setItem(KEY, JSON.stringify(user));
    } catch (e) {
      return { ok: false, error: 'Your browser blocks storage, so you cannot stay signed in.' };
    }
    return { ok: true, user };
  }

  /** The signed-in user ({ username, role }) or null. */
  function current() {
    try {
      const stored = JSON.parse(localStorage.getItem(KEY));
      const found = stored && account(stored.username);
      return found && found.role === stored.role ? { username: found.username, role: found.role } : null;
    } catch (e) {
      return null;
    }
  }

  function logout() {
    try {
      localStorage.removeItem(KEY);
    } catch (e) {
      /* storage blocked: nothing was stored */
    }
  }

  /** The first page each role sees after signing in. */
  const landing = (role) => (role === 'hub' ? 'dashboard.html' : 'index.html');

  const roleLabel = (role) => ROLE_LABELS[role] || '';

  return { login, current, logout, landing, roleLabel };
})();
