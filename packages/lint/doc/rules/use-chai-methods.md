# Enforce using the Chai methods provided by [@faltest/chai](../../../chai) (use-chai-methods)

You can get additional context by using these methods, like the CSS selector chain, on failures.

## Rule Details

Examples of **incorrect** code for this rule:

```js
expect(await pageObject.getText()).to.equal('foo');
```

Examples of **correct** code for this rule:

```js
await expect(pageObject).text.to.eventually.equal('foo');
```
