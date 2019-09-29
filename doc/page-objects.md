# Page Objects

We've included a page object system that is completely optional.

## Pages

It all starts with extending the `BasePageObject` class.

```js
// src/page-objects/pages/my-page.js
const { BasePageObject } = require('@faltest/page-objects');

class MyPage extends BasePageObject {
}

module.exports = MyPage;
```

## Properties

Page object properties are added using [getters](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Functions/get). The easiest and most common way to create a page object property is to use the inherited `_create`. The ongoing convention is that anything leading with `_` is private and so is available to the class and its [prototype chain](https://developer.mozilla.org/docs/Web/JavaScript/Inheritance_and_the_prototype_chain), but not to the public.

```js
class MyPage extends BasePageObject {
  get buttons() {
    return this._create('.buttons');
  }
}
```

All functions in [packages/page-objects/src/element.js](../packages/page-objects/src/element.js) are now at your disposable.

```js
await myPage.buttons.click();
let text = await myPage.buttons.getText();
```

## Chaining

Chaining properties is where the magic comes in. The second argument to `_create` is a callback that adds extension properties.

```js
class MyPage extends BasePageObject {
  get buttons() {
    return this._create('.buttons', ({ create }) => ({
      apply: create('.apply'),
    }));
  }
}
```

The `create` that comes with the callback is scoped to the parent selector. It is equivalent to

```js
class MyPage extends BasePageObject {
  get buttons() {
    return this._create('.buttons', () => ({
      apply: this._create('.buttons .apply'),
    }));
  }
}
```

Extending properties like this allows you to chain properties in your tests without `await`ing.

```js
await myPage.buttons.apply.click();
let text = await myPage.buttons.apply.getText();
```

## Enumerating

If you want to create an iterable page object (think table rows)

```js
class MyPage extends BasePageObject {
  get rows() {
    return this._createMany('.row');
  }
}
```

which allows you to

```js
let rows = await myPage.rows.getPageObjects();
```

The reason for the `await` is there is no way to know how many items are in the array without WebDriver querying the browser.

You might now want to continue chaining page objects

```js
let rows = await myPage.rows.getPageObjects();
let cells = await rows[0].cells.getPageObjects();
```

which you can accomplish via `each`.

```js
class MyPage extends BasePageObject {
  get rows() {
    return this._createMany('.row', ({ each }) => {
      each(({ createMany }) => ({
        cells: createMany('.cell'),
      }));
    });
  }
}
```

`each` accepts the same callback signature that allows you to continue extending properties on array items. In this case, `createMany` is scoped to the _individual row_, not `.row` that matches all rows.

`_createMany` also allows you to extend properties on page object without iterating.

```js
class MyPage extends BasePageObject {
  get rows() {
    return this._createMany('.row', ({ each, create }) => {
      each(({ createMany }) => ({
        cells: createMany('.cell'),
      }));

      return {
        empty: create('.empty'),
      };
    });
  }
}
```

This allows you to build a versatile page object.

```js
let rows = await myPage.rows.getPageObjects();
let cells = await rows[0].cells.getPageObjects();
let isEmpty = await myPage.rows.empty.isExisting();
```

## Reuse

Eventually you will want to share page objects across pages (tables, modals, etc.).

```js
// src/page-objects/shared/modal.js
const Element = require('../element');

class Modal extends Element {
  get apply() {
    return this._create('.apply');
  }
}

Modal.selector = '.modal';

module.exports = Modal;
```

Then you can attach it to another page object using `_extend`.

```js
const Modal = require('../shared/modal');

class MyPage extends BasePageObject {
  get modal() {
    return this._extend(Modal);
  }
}
```

`_extend` is just what `_create` calls behind the scenes. The following

```js
class MyPage extends BasePageObject {
  get buttons() {
    return this._create('.buttons');
  }
}
```

is equivalent to

```js
const Element = require('../element');

class MyPage extends BasePageObject {
  get buttons() {
    return this._extend(Element, '.buttons');
  }
}
```

which also means `_extend` can do chaining like normal.

```js
const Modal = require('../shared/modal');

class MyPage extends BasePageObject {
  get modal() {
    return this._extend(Modal, null, ({ create }) => ({
      custom: create('.custom'),
    }));
  }
}
```

The second argument being `null` means it uses the default selector from the page object. You can of course supply your own unique selector to the modal.

## Functions

You can add functions that do more than the default set (`click`, `getText`, etc.)

```js
class MyPage extends BasePageObject {
  get table() {
    return this._create('.table', () => ({
      deleteFirstRow: async () => {
        // ?
      },
    }));
  }
}
```

and invoke them via

```js
await myPage.table.deleteFirstRow();
```

But what goes in the implementation? You can use the `pageObject` argument from the callback and use it just like in a test file.

```js
class MyPage extends BasePageObject {
  get rows() {
    return this._createMany('.row', ({ each, pageObject }) => {
      each(({ create }) => ({
        delete: create('.delete'),
      }));

      return {
        deleteFirstRow: async () => {
          let rows = await pageObject.getPageObjects();
          await rows[0].delete.click();
        },
      };
    });
  }
}
```

This is equivalent to

```js
class MyPage extends BasePageObject {
  get rows() {
    let pageObject;

    pageObject = this._createMany('.row', ({ each }) => {
      each(({ create }) => ({
        delete: create('.delete'),
      }));

      return {
        deleteFirstRow: async () => {
          let rows = await pageObject.getPageObjects();
          await rows[0].delete.click();
        },
      };
    });

    return pageObject;
  }
}
```

You may want to override one of the default page object functions, like `click`. There is a special argument for this purpose.

```js
class MyPage extends BasePageObject {
  get rows() {
    return this._createMany('.row', ({ _super, pageObject }) => ({
      click: async () => {
        await _super.click();

        await pageObject.doSomething();
      },
      doSomething: async () => {
        // ...
      },
    }));
  }
}
```

`_super` is necessary to avoid causing an infinite loop. It differs from `pageObject` in that the latter has all extended properties installed on it, whereas the former has none. `pageObject.click` would loop and crash, and `_super.doSomething` would throw. (`_super` is a borrowed convention from the JavaScript ecosystem before proper class inheritance existed.)

## Selectors

Sometimes, a CSS selector is not enough, and querying the DOM is necessary.

```js
class MyPage extends BasePageObject {
  get myTab() {
    return this._create(async () => {
      let element;

      await this._browser.waitUntil(async () => {
        try {
          return element = await this._browser.findByText('.tab', 'My Tab');
        } catch (err) {}
      });

      return element;
    });
  }
}
```

When supplying a function instead of a string, the return value is expected to be a WebDriver element.

## Scoping

Scoping is a convenient way to create scoped child page objects.

```js
class MyPage extends BasePageObject {
  get table() {
    return this._create('.table', ({ pageObject }) => ({
      hasACertainRow: async () => {
        let cell = pageObject._scopeChild('.row:nth-child(6) .cell:nth-child(3)');
        return await cell.getText() === 'foo';
      },
    }));
  }
}
```

is equivalent to

```js
class MyPage extends BasePageObject {
  get table() {
    return this._create('.table', ({ createMany, pageObject }) => ({
      rows: createMany('.row', ({ each }) => {
        each(({ createMany }) => ({
          cells: createMany('.cell'),
        }));
      }),
      hasACertainRow: async () => {
        let rows = await pageObject.rows.getPageObjects();
        let cells = await rows[6].cells.getPageObjects();
        let cell = cells[3];
        return await cell.getText() === 'foo';
      },
    }));
  }
}
```

## Chaining

You can use a chaining style instead of a callback style to build page objects if you prefer.

```js
class MyPage extends BasePageObject {
  get rows() {
    return this._createMany('.row')._chain(({ create }) => ({
      empty: create('.empty'),
    }));
  }
}
```

is equivalent to

```js
class MyPage extends BasePageObject {
  get rows() {
    return this._createMany('.row', ({ create }) => ({
      empty: create('.empty'),
    }));
  }
}
```
