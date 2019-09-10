'use strict';

const { setUpWebDriver, roles } = require('../helpers/mocha');
const chai = require('chai');

chai.use(require('@faltest/chai'));

const { expect } = chai;

describe('sample', function() {
  roles('#user #admin', function() {
    setUpWebDriver.call(this, {
      async logIn({
        target,
        env,
      }) {
        let envs = {
          dev: 'YzKwVQq',
          prod: 'wvwMbee',
        };

        await this.browser.url(`https://codepen.io/crowdstrike/full/${envs[env]}?target=${target}`);

        // only needed for codepen, selects the first iframe
        await this.browser._browser.switchToFrame(0);

        await this.browser.setValue('#email', this.role.get('email'));

        await this.browser.click('#log-in');
      },
    });

    it('works', async function() {
      let memberSection = await this.browser.$('#member-section');

      expect(await memberSection.isDisplayed()).to.be.ok;
    });
  });
});
