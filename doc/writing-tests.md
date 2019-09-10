# Writing Tests

Let's start with a basic test with the least amount of concepts.

```js
const { setUpWebDriver } = require('@faltest/mocha');
const { expect } = require('chai');

describe('#my-site', function() {
  setUpWebDriver.call(this);

  beforeEach(async function() {
    await this.browser.url(`https://my-site.com`);
  });

  it('works #smoke', async function() {
    await this.browser.click('.foo');

    expect(await this.browser.getText('.bar')).to.equal('bar');
  });
});
```

Let's go through this line by line.

* * *

```js
const { setUpWebDriver } = require('@faltest/mocha');
```

This is needed to get WebDriver up and running and will be explained later.

* * *

```js
const { expect } = require('chai');
```

This is [Chai](https://www.chaijs.com)'s `expect` without any plugins installed on it.

* * *

```js
describe('#my-site', function() {
```

This is [Mocha](https://mochajs.org)'s `describe` helper. Any tags can be filtered using the CLI. See more [here](../CONTRIBUTING.md#tagging).

* * *

```js
setUpWebDriver.call(this);
```

This sets up everything we need for WebDriver to work, including opening a browser window and logging in with the designated role. It takes a configuration object as its second argument.

```js
setUpWebDriver.call(this, {
  // shareWebdriver,
  // keepBrowserOpen,
  // shareSession,
  // shouldLogIn,
});
```

* * *

```js
beforeEach(async function() {
  await this.browser.url(`https://my-site.com`);
});
```

This visits a certain URL before running test code.

* * *

```js
it('works #smoke', async function() {
```

The `it` helper functions similarily to the `describe` helper mentioned above, including the tagging ability.

If you want to take advantage of feature flags for your test, you can do

```js
it({
  name: 'works #smoke',
  flags: ['foo', 'bar'],
}, async function() {
```

This will skip the test if your running context is missing any of these flags. See more [here](../CONTRIBUTING.md#feature-flags).

* * *

```js
await this.browser.click('.foo');

expect(await this.browser.getText('.bar')).to.equal('bar');
```

This last part is where your test code goes. You will call browser methods to interact with the page, and then query and assert the results. Every page interacton is a request through the WebDriver protocol, so they return [promises](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) which you must [`await`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/await).
