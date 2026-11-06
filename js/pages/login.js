/* login.html: sign in with one of the demo accounts, then go to that role's first page. */
(function () {
  'use strict';

  const user = Auth.current();
  if (user) {
    window.location.replace(Auth.landing(user.role));
    return;
  }

  UI.$('guest-entry').addEventListener('click', (event) => {
    event.preventDefault();
    if (Auth.enterGuest()) window.location.href = 'disasters.html';
    else UI.notice('Guest access is unavailable in this browser.', 'error', 'form-message');
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

    window.location.href = Auth.landing(result.user.role);
  });

  [username, password].forEach((input) => input.addEventListener('input', () => {
    markInvalid(false);
    UI.clearNotice('form-message');
  }));
})();
