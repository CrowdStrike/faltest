# Enforce using `eventually` when querying page objects or the browser (chai-webdriver-eventually)

## Rule Details

Examples of **incorrect** code for this rule:

```js
expect(pageObject).text.to.equal('foo');
```

Examples of **correct** code for this rule:

```js
await expect(pageObject).text.to.eventually.equal('foo');
```
