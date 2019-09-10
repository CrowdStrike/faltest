# Browser

The `Browser` class at [packages/browser/index.js](../packages/browser/index.js) is a wrapper of the [WebdriverIO browser](https://webdriver.io/docs/api/webdriver.html). It overrides almost every function. Its main purpose is to combine two `await` calls into one. With WebdriverIO, every browser operation requires at least two `await` calls. One to select an element, and another to perform an operation. The `Browser` class in this project abstracts those two calls away from you, only requiring one `await`.

```js
// before
await (await browser.$('.foo')).click();

// after
await browser.click('.foo');
```

## Currying

You can curry any `Browser` function for brevity. The following are equivalent.

```js
let obj = {
  click: async () => {
    await browser.click('.foo');
  },
};
```

```js
let obj = {
  click: browser.curry('click', '.foo'),
};
```

## High Level Helpers

### Tab Handling

Tab and window handling in WebdriverIO are rudimentary. When a link opens in a new active tab, you are expected to manually mark the new tab as active in WebdriverIO. Calling `await browser.syncOpenedTab()` will do this for you. If you want to close the tab and return to the previous tab, call `await browser.closeTab()`.

Now to properly close a browser in WebdriverIO, you have to do it tab by tab. `await browser.close()` is a shortcut for that.

### Throttling

You can throttle the network for a block of code.

```js
await browser.throttleOn();

await browser.click('.foo');

await browser.throttleOff();
```
