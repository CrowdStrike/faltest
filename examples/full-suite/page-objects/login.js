'use strict';

const { BasePageObject } = require('@faltest/page-objects');

class Page extends BasePageObject {
  async open(env, target) {
    let envs = {
      dev: 'YzKwVQq',
      prod: 'wvwMbee',
    };

    await this._browser.url(`https://codepen.io/crowdstrike/full/${envs[env]}?target=${target}`);

    // only needed for codepen, selects the first iframe
    await this._browser._browser.switchToFrame(0);
  }

  get email() {
    return this._create('#email');
  }

  get logInButton() {
    return this._create('#log-in');
  }

  async logIn(email) {
    await this.email.setValue(email);

    await this.logInButton.click();
  }
}

module.exports = Page;
