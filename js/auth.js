/* ResQHub demo sign-in: two built-in accounts plus the accounts people register, no real authentication.
 *
 * Registered accounts and the signed-in user are kept in localStorage until "Log out".
 * Passwords are stored as plain text because this is a demo; never reuse a real one.
 * Loaded before js/ui.js on every page. register() also needs js/store.js (register.html loads it).
 */
'use strict';

const Auth = (function () {
  const KEY = 'resqhub_session';
  const ACCOUNTS_KEY = 'resqhub_accounts';
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const MIN_PASSWORD = 6;

  const BUILT_IN = [
    { username: 'contributor', password: '123', role: 'citizen' },
    { username: 'organization', password: '123', role: 'hub', hubId: 1 }
  ];

  // Internal role keys stay 'citizen' / 'hub'; these are the names people see.
  const ROLE_LABELS = { citizen: 'Contributor', hub: 'Organization Representative' };

  const readRegistered = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(ACCOUNTS_KEY));
      return Array.isArray(saved) ? saved : [];
    } catch (e) {
      return [];
    }
  };

  const accounts = () => [...BUILT_IN, ...readRegistered()];

  /** An account by username or email, ignoring case. */
  const account = (who) => {
    const key = String(who ?? '').trim().toLowerCase();
    return accounts().find((a) => a.username === key);
  };

  const sessionOf = (a) => ({ username: a.username, role: a.role, hubId: a.hubId, name: a.name });

  /** Remember who is signed in. Returns false when the browser blocks storage. */
  function remember(user) {
    try {
      localStorage.setItem(KEY, JSON.stringify(user));
      return true;
    } catch (e) {
      return false;
    }
  }

  const BLOCKED = 'Your browser blocks storage, so you cannot stay signed in.';

  /** Check the credentials and remember the user. Returns { ok, user } or { ok: false, error }. */
  function login(username, password) {
    const found = account(username);
    if (!found || found.password !== String(password ?? '')) {
      return { ok: false, error: 'Wrong username or password.' };
    }

    const user = sessionOf(found);
    return remember(user) ? { ok: true, user } : { ok: false, error: BLOCKED };
  }

  /**
   * Create an account and sign in. The email is the username.
   * An Organization Representative also needs organizationName and organizationAddress;
   * the organization gets its own hub in the Store, so it starts with no needs.
   * Returns { ok, user } or { ok: false, error }.
   */
  function register(input) {
    const fail = (error) => ({ ok: false, error });
    const clean = (value, max) => String(value ?? '').trim().slice(0, max);

    const role = input.role === 'hub' ? 'hub' : 'citizen';
    const firstName = clean(input.firstName, 60);
    const lastName = clean(input.lastName, 60);
    const email = clean(input.email, 120).toLowerCase();
    const phone = clean(input.phone, 25);
    const password = String(input.password ?? '');

    if (!firstName || !lastName) return fail('Please enter your first and last name.');
    if (!EMAIL.test(email)) return fail('Please enter a valid email address.');
    if (phone.replace(/\D/g, '').length < 7) return fail('Please enter a valid phone number.');
    if (password.length < MIN_PASSWORD) return fail(`The password needs at least ${MIN_PASSWORD} characters.`);
    if (account(email)) return fail('An account with this email already exists. Sign in instead.');

    const created = { username: email, password, role, name: `${firstName} ${lastName}`, email, phone };

    if (role === 'hub') {
      const hub = Store.addHub({ name: input.organizationName, email, address: input.organizationAddress });
      if (!hub.ok) return hub;
      created.hubId = hub.hub.id;
    }

    try {
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...readRegistered(), created]));
    } catch (e) {
      return fail(BLOCKED);
    }

    const user = sessionOf(created);
    return remember(user) ? { ok: true, user } : fail(BLOCKED);
  }

  /** The signed-in user ({ username, role, hubId, name }) or null. */
  function current() {
    try {
      const stored = JSON.parse(localStorage.getItem(KEY));
      const found = stored && account(stored.username);
      return found && found.role === stored.role ? sessionOf(found) : null;
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

  return { login, register, current, logout, landing, roleLabel };
})();
