/* login.html: sign in with one of the demo accounts, then go to that role's first page. */
(function () {
  'use strict';

  // Keep the sign-in page accessible even when a demo account is already signed in.
  // Otherwise the visitor cannot choose the explicit "Continue as Guest" option.
  const guestEntry = UI.$('guest-entry');
  guestEntry.addEventListener('click', () => {
    // Guest mode is read-only. Clear a previous session before navigating.
    Auth.logout();
  });

  // Demo buttons are deliberately separate from email-based registered accounts.
  document.querySelectorAll('[data-demo-login]').forEach((button) => {
    button.addEventListener('click', () => {
      const account = button.dataset.demoLogin;
      const result = Auth.login(account, '123');
      if (!result.ok) {
        UI.notice(result.error, 'error', 'form-message');
        return;
      }
      window.location.href = Auth.landing(result.user.role);
    });
  });

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

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!username.value.trim() || !password.value) {
      markInvalid(true);
      UI.notice('Enter your email address and password.', 'error', 'form-message');
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

    window.location.href = Auth.landing(result.user.role);
  });

  [username, password].forEach((input) => input.addEventListener('input', () => {
    markInvalid(false);
    UI.clearNotice('form-message');
  }));
})();
