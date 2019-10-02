# Chai

## WebDriver Helpers

We added a few helpers to add additional context and reduce boilerplate. They turn failure messages like `expected 'bar' to equal 'foo'` into `element with selector ".foo-bar": getText: expected 'bar' to equal 'foo'`.

*   [`.url`](#url)
*   [`.title`](#title)
*   [`.text`](#text)
*   [`.value`](#value)
*   [`.enabled`](#enabled)
*   [`.displayed`](#displayed)
*   [`.exist`](#exist)
*   [`.elements`](#elements)

### `.url`

```js
// before
expect(await browser.getUrl()).to.endWith('foo');
```

```js
// after
await expect(browser).url.to.eventually.endWith('foo');
```

### `.title`

```js
// before
expect(await browser.getTitle()).to.contain('foo');
```

```js
// after
await expect(browser).title.to.eventually.contain('foo');
```

### `.text`

```js
// before
expect(await pageObject.getText()).to.equal('foo');
```

```js
// after
await expect(pageObject).text.to.eventually.equal('foo');
```

### `.value`

```js
// before
expect(await pageObject.getValue()).to.equal('foo');
```

```js
// after
await expect(pageObject).value.to.eventually.equal('foo');
```

### `.enabled`

```js
// before
expect(await pageObject.isEnabled()).to.be.ok;
```

```js
// after
await expect(pageObject).enabled.to.eventually.be.ok;
```

### `.displayed`

```js
// before
expect(await pageObject.isDisplayed()).to.be.ok;
```

```js
// after
await expect(pageObject).displayed.to.eventually.be.ok;
```

### `.exist`

```js
// before
expect(await pageObject.isExisting()).to.be.ok;
```

```js
// after
await expect(pageObject).exist.to.eventually.be.ok;
```

### `.elements`

```js
// before
expect(await pageObject.getElements()).to.have.a.lengthOf(2);
expect(await pageObject.getElements()).to.have.a.lengthOf.above(1);
expect(await pageObject.getElements()).to.have.a.lengthOf.below(2);
expect(await pageObject.getElements()).to.have.a.lengthOf.at.least(2);
expect(await pageObject.getElements()).to.have.a.lengthOf.at.most(1);
expect(await pageObject.getElements()).to.have.a.lengthOf.within(0, 1);
```

```js
// after
await expect(pageObject).elements.to.eventually.have.a.lengthOf(2);
await expect(pageObject).elements.to.eventually.have.a.lengthOf.above(1);
await expect(pageObject).elements.to.eventually.have.a.lengthOf.below(2);
await expect(pageObject).elements.to.eventually.have.a.lengthOf.at.least(2);
await expect(pageObject).elements.to.eventually.have.a.lengthOf.at.most(1);
await expect(pageObject).elements.to.eventually.have.a.lengthOf.within(0, 1);
```
