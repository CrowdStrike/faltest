'use strict';

const { setUpWebDriver, roles, featureFlags, it } = require('../helpers/mocha');
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

        let _featureFlags = await this.browser._browser.executeAsync(done => {
          // eslint-disable-next-line no-undef
          done(window.featureFlags);
        });

        featureFlags.splice(0, featureFlags.length, ..._featureFlags);
      },
    });

    it('works #smoke', async function() {
      let memberSection = await this.browser.$('#member-section');

      expect(await memberSection.isDisplayed()).to.be.ok;
    });

    it({
      name: 'shows existing feature',
      flags: ['finished-feature'],
    }, async function() {
      let feature = await this.browser.$('#finished-feature');

      expect(await feature.isExisting()).to.be.ok;
    });

    it({
      name: 'shows new feature',
      flags: ['in-progress-feature'],
    }, async function() {
      let feature = await this.browser.$('#in-progress-feature');

      expect(await feature.isExisting()).to.be.ok;
    });

    it({
      name: 'hides unfinished feature',
      flags: ['!in-progress-feature'],
    }, async function() {
      let feature = await this.browser.$('#in-progress-feature');

      expect(await feature.isExisting()).to.not.be.ok;
    });
  });
});
