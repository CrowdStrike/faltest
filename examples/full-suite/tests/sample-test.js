'use strict';

const { setUpWebDriver, roles, featureFlags, it } = require('../helpers/mocha');
const chai = require('chai');
const Login = require('../page-objects/login');
const MemberSection = require('../page-objects/member-section');

chai.use(require('@faltest/chai'));
chai.use(require('chai-as-promised'));

const { expect } = chai;

describe('sample', function() {
  roles('#user #admin', function() {
    setUpWebDriver.call(this, {
      async logIn({
        target,
        env,
      }) {
        this.login = new Login(this.browser);

        await this.login.open(env, target);

        await this.login.logIn(this.role.get('email'));

        this.memberSection = new MemberSection(this.browser);

        let _featureFlags = await this.browser._browser.execute(() => {
          // eslint-disable-next-line no-undef
          return window.featureFlags;
        });

        featureFlags.splice(0, featureFlags.length, ..._featureFlags);
      },
    });

    it('works #smoke', async function() {
      let memberSection = await this.memberSection.getElement();

      expect(await memberSection.isDisplayed()).to.be.ok;
    });

    it({
      name: 'shows existing feature',
      flags: ['finished-feature'],
    }, async function() {
      await expect(this.memberSection.finishedFeature).exist.to.eventually.be.ok;
    });

    it({
      name: 'shows new feature',
      flags: ['in-progress-feature'],
    }, async function() {
      await expect(this.memberSection.inProgressFeature).exist.to.eventually.be.ok;
    });

    it({
      name: 'hides unfinished feature',
      flags: ['!in-progress-feature'],
    }, async function() {
      await expect(this.memberSection.inProgressFeature).exist.to.eventually.not.be.ok;
    });
  });
});
