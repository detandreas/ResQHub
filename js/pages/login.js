/* login.html: sign in with an email and password (demo accounts: contributor@demo.gr and
 * organization@demo.gr, password 123), then go to that role's first page,
 * or continue as a guest (browse only). A guest who opened this page can still sign in. */
(function () {
  'use strict';

  const user = Auth.current();
  if (user && !user.guest) {
    window.location.replace(Auth.landing(user.role));
    return;
  }

  const form = UI.$('login-form');
  const email = UI.$('email');
  const password = UI.$('password');

  const markInvalid = (invalid) => {
    [email, password].forEach((input) => {
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

    if (!email.value.trim() || !password.value) {
      markInvalid(true);
      UI.notice('Enter your email and password.', 'error', 'form-message');
      (email.value.trim() ? password : email).focus();
      return;
    }

    const result = Auth.login(email.value, password.value);
    if (!result.ok) {
      markInvalid(true);
      UI.notice(result.error, 'error', 'form-message');
      password.select();
      return;
    }

    // Someone sent here from "Offer help" goes back to that need, unless the account is an organization's.
    window.location.href = (result.user.role === 'citizen' && UI.nextPage()) || Auth.landing(result.user.role);
  });

  [email, password].forEach((input) => input.addEventListener('input', () => {
    markInvalid(false);
    UI.clearNotice('form-message');
  }));
})();
