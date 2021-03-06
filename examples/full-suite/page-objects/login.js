'use strict';

const { BasePageObject } = require('@faltest/page-objects');

class Page extends BasePageObject {
  async open(env, target) {
    await this._browser.url(`https://crowdstrike.github.io/faltest/${env}?target=${target}`);
  }

  get email() {
    return this._create('#email');
  }

  get password() {
    return this._create('#password');
  }

  get logInButton() {
    return this._create('#log-in');
  }

  async logIn(email, encryptedPassword) {
    await this.email.setValue(email);

    // Your encryption will obviously be more elaborate.
    let decryptedPassword = Buffer.from(encryptedPassword, 'base64').toString();

    // prevent accidental debug logging
    await this.password.setPassword(decryptedPassword);

    await this.logInButton.click();
  }
}

module.exports = Page;
