/* login.html: sign in with one of the demo accounts, then go to that role's first page,
 * or continue as a guest (browse only). A guest who opened this page can still sign in. */
(function () {
  'use strict';

  const user = Auth.current();
  if (user && !user.guest) {
    window.location.replace(Auth.landing(user.role));
    return;
  }

  const form = UI.$('login-form');
  const username = UI.$('username');
  const password = UI.$('password');

  const markInvalid = (invalid) => {
    [username, password].forEach((input) => {
      if (invalid) input.setAttribute('aria-invalid', 'true');
      else input.removeAttribute('aria-invalid');
    });
  };

  UI.showStoredFlash();

  UI.$('guest-entry').addEventListener('click', (event) => {
    event.preventDefault();
    const result = Auth.continueAsGuest();
    if (!result.ok) {
      UI.notice(result.error, 'error', 'form-message');
      return;
    }
    window.location.href = Auth.landing(result.user.role);
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!username.value.trim() || !password.value) {
      markInvalid(true);
      UI.notice('Enter your username and password.', 'error', 'form-message');
      (username.value.trim() ? password : username).focus();
      return;
    }

    const result = Auth.login(username.value, password.value);
    if (!result.ok) {
      markInvalid(true);
      UI.notice(result.error, 'error', 'form-message');
      password.select();
      return;
    }

    // Someone sent here from "Offer help" goes back to that need, unless the account is an organization's.
    window.location.href = (result.user.role === 'citizen' && UI.nextPage()) || Auth.landing(result.user.role);
  });

  [username, password].forEach((input) => input.addEventListener('input', () => {
    markInvalid(false);
    UI.clearNotice('form-message');
  }));
})();
