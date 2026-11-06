/* register.html: create a Contributor or Organization Representative account,
 * sign in, and go to that role's first page. */
(function () {
  'use strict';

  const user = Auth.current();
  if (user) {
    window.location.replace(Auth.landing(user.role));
    return;
  }

  const form = UI.$('register-form');
  const role = UI.$('role');
  const organization = UI.$('organization-fields');
  const value = (id) => UI.$(id).value;

  /** Organization Representatives also give their organization's name and address. */
  function syncRole() {
    const isHub = role.value === 'hub';
    organization.hidden = !isHub;
    UI.$('organizationName').required = isHub;
    UI.$('organizationAddress').required = isHub;
  }

  role.addEventListener('change', syncRole);
  form.addEventListener('input', () => UI.clearNotice('form-message'));
  syncRole();

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const result = Auth.register({
      role: role.value,
      firstName: value('firstName'),
      lastName: value('lastName'),
      email: value('email'),
      phone: value('phone'),
      password: value('password'),
      organizationName: value('organizationName'),
      organizationAddress: value('organizationAddress')
    });

    if (!result.ok) {
      UI.notice(result.error, 'error', 'form-message');
      return;
    }

    UI.flash(`Welcome to ResQHub, ${value('firstName').trim()}.`);
    window.location.href = Auth.landing(result.user.role);
  });
})();
