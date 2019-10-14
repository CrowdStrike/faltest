'use strict';

const { CustomVError } = require('verror-extra');

const browserFunctionsToPassThrough = [
  'reloadSession',
  'status',
  'url',
  'getUrl',
  'getTitle',
  '$',
  '$$',
  'getWindowSize',
  'setWindowSize',
  'waitUntil',
  'execute',
  'executeAsync',
  'keys',
];

const elementFunctionsToPassThrough = [
  'getValue',
  'setValue',
  'click',
  'moveTo',
  'isEnabled',
  'waitForEnabled',
  'scrollIntoView',
  'getAttribute',
  'isDisplayed',
];

/**
 * This is an interface to the WebDriver browser object.
 * The goal is to DRY up the common commands, and provide
 * helpers for gaps in the WebDriver API.
 */
class Browser {
  constructor(browser) {
    this._browser = browser;
  }

  curry(func, ...args) {
    return this[func].bind(this, ...args);
  }

  async throttleOn(nearlyOff) {
    let latency;
    let throughput;
    if (nearlyOff) {
      latency = 1;
      throughput = 1;
    } else {
      latency = 1 * 1000;
      throughput = 25 * 1024;
    }
    await this._browser.setNetworkConditions({ latency, throughput });
  }

  async throttleOff() {
    await this._browser.deleteNetworkConditions();
  }

  /**
   * When you open a new tab in WebDriver, the actual browser
   * switches tabs as expected, but the WebDriver browser object
   * stays the same. You are expected to update the object yourself
   * with the provided API. This sucks, firstly because WebDriver
   * should be able to update their internal representation of the
   * tabs automatically, secondly because there is no way to query
   * the current tab, it's all up to you to guess which tab is the
   * newly opened one and set it accordingly.
   */
  async syncOpenedTab() {
    await switchTabByIndexChanged.call(this, 1);
  }

  /**
   * You again have to guess at which tab is now the current in the
   * real browser.
   */
  async closeTab() {
    await switchTabByIndexChanged.call(this, -1, async () => {
      await this._browser.closeWindow();
    });
  }

  /**
   * The only API available in WebDriver to kill a browser
   * is `closeWindow`. This is insufficient because if there
   * are multiple tabs open, it will only close a single tab.
   * This kills tabs until there are no more, which eventually
   * kills the browser.
   */
  async close() {
    while (true) {
      try {
        await this.closeTab();
      } catch (err) {
        if (err.message === 'There are no more tabs left.') {
          break;
        }
        throw err;
      }
    }
  }
}

async function switchTabByIndexChanged(i, runAfterTabsQueryButBeforeSwitch) {
  let tabs = await this._browser.getWindowHandles();
  let lastTab = await this._browser.getWindowHandle();

  if (runAfterTabsQueryButBeforeSwitch) {
    await runAfterTabsQueryButBeforeSwitch();
  }

  let nextTab = tabs[tabs.indexOf(lastTab) + i];

  if (!nextTab) {
    throw new Error('There are no more tabs left.');
  }

  await this._browser.switchToWindow(nextTab);
}

function find(func) {
  return async function find(selectorOrElementOrElementsOrFunction) {
    let elementOrElements;

    switch (typeof selectorOrElementOrElementsOrFunction) {
      case 'function':
        elementOrElements = await find(selectorOrElementOrElementsOrFunction.call(this));
        break;
      case 'string':
        elementOrElements = await this[func](selectorOrElementOrElementsOrFunction);
        break;
      default:
        elementOrElements = selectorOrElementOrElementsOrFunction;
    }

    return elementOrElements;
  };
}

function findChild(methodNameForErrorMessageOverride, browserMethodName, elementMethodName) {
  return resolveElement(async function findChild(element, selector) {
    let elementOrElements;

    switch (typeof selector) {
      case 'function':
        elementOrElements = await this[browserMethodName](selector.bind(this, element));
        break;
      case 'string':
        elementOrElements = await element[elementMethodName](selector);
        break;
      default:
        elementOrElements = selector;
    }

    return elementOrElements;
  }, methodNameForErrorMessageOverride);
}

class ElementError extends CustomVError {
  static findLastError(err) {
    return CustomVError.findLastErrorByType(err, ElementError);
  }

  constructor({
    methodName,
    element,
    args,
    message,
    err,
  }) {
    if (!methodName) {
      throw new Error('unexpected falsy methodName');
    }

    // convert potential `arguments` array-like to array
    args = [...args];

    if (element) {
      let _element = element;
      if (element.selector) {
        _element = element.selector;
        if (element.index !== undefined) {
          _element += `[${element.index}]`;
        }
      }
      args = [_element, ...args];
    }

    args = args.reduce((args, arg) => {
      let _arg;
      switch (typeof arg) {
        case 'string':
          _arg = arg;
          break;
        case 'function':
          _arg = '<func>';
          break;
        case 'object':
          _arg = '<obj>';
          break;
      }
      if (_arg) {
        args = args.concat(_arg);
      }
      return args;
    }, []);

    let _message = `${methodName}(${args.join()})`;

    if (message) {
      _message += `: ${message}`;
    }

    super({
      name: methodName,
      cause: err,
    }, _message);

    this.element = element;
  }
}

function resolve(func) {
  return function(callback, methodNameForErrorMessageOverride) {
    return async function resolve(selectorOrElementOrElementsOrFunction, ...args) {
      // I don't know if this step is necessary.
      selectorOrElementOrElementsOrFunction = await selectorOrElementOrElementsOrFunction;
      let elementOrElements;
      try {
        elementOrElements = await this[func](selectorOrElementOrElementsOrFunction);
        let result = await callback.call(this, elementOrElements, ...args);
        return result;
      } catch (err) {
        throw new ElementError({
          methodName: methodNameForErrorMessageOverride || callback.name,
          element: elementOrElements || selectorOrElementOrElementsOrFunction,
          args,
          err,
        });
      }
    };
  };
}

const resolveElement = resolve('_findElement');
const resolveElements = resolve('_findElements');

/**
 * class fields are not allowed until node 12
 * https://node.green/#ESNEXT-candidate--stage-3--instance-class-fields-public-instance-class-fields
 */

Browser.prototype._findElement = find('$');
Browser.prototype._findElements = find('$$');

// This handles arrays (`browser.$$`) too.
Browser.prototype.isExisting = resolveElement(async function isExisting(elementOrElements) {
  if (Array.isArray(elementOrElements)) {
    return elementOrElements.length > 0;
  }
  return await elementOrElements.isExisting();
});

// This version handles both `browser.$` and `browser.$$`.
// The WebDriverIO version only handles `browser.$`.
function waitForExist(methodNameForErrorMessageOverride) {
  return function(timeout, reverse = false) {
    let args = arguments;

    function isExisting(elements) {
      return !elements.length === reverse;
    }

    // We are avoiding using `resolveElements` because we want to
    // throw an error with a different signature.
    return async function waitForExist(selectorOrElementOrElementsOrFunction) {
      let elementOrElements;

      try {
        elementOrElements = await this._findElements(selectorOrElementOrElementsOrFunction);

        if (!Array.isArray(elementOrElements)) {
          let element = elementOrElements;
          await element.waitForExist(...args);
          return;
        }

        let elements = elementOrElements;

        // an optimisation since we already have the first query results handy
        if (isExisting(elements)) {
          return;
        }

        let innerError;
        await this._browser.waitUntil(async () => {
          try {
            let elements = await this._findElements(selectorOrElementOrElementsOrFunction);
            return isExisting(elements);
          } catch (err) {
            innerError = err;
            return true;
          }
        }, timeout);
        if (innerError) {
          throw innerError;
        }
      } catch (err) {
        throw new ElementError({
          methodName: methodNameForErrorMessageOverride,
          element: !Array.isArray(elementOrElements) ? elementOrElements : selectorOrElementOrElementsOrFunction,
          args,
          err,
        });
      }
    };
  };
}

Browser.prototype.waitForInsert = waitForExist('waitForInsert')();
Browser.prototype.waitForDestroy = waitForExist('waitForDestroy')(undefined, true);

Browser.prototype.getText = resolveElement(async function getText(element) {
  // `element.getText` won't work because WebDriver calculates CSS,
  // meaning any `text-transform: uppercase` are applied.
  let text = await element.getProperty('textContent');

  return text.trim();
});

for (let name of browserFunctionsToPassThrough) {
  Browser.prototype[name] = async function() {
    return await this._browser[name](...arguments);
  };
}

for (let name of elementFunctionsToPassThrough) {
  Browser.prototype[name] = resolveElement(async (element, ...args) => {
    return await element[name](...args);
  }, name);
}

Browser.prototype.findByText = resolveElements(async function findByText(elements, text) {
  for (let element of elements) {
    if (await this.getText(element) === text) {
      return element;
    }
  }

  throw new Error(`Find by text "${text}" yielded no results.`);
});

Browser.prototype.waitForText = resolveElement(async function waitForText(element, text) {
  await this.waitUntil(async () => {
    return await this.getText(element) === text;
  });
});

Browser.prototype.elementSendKeys = resolveElement(async function elementSendKeys(element, ...args) {
  await this._browser.elementSendKeys(element.elementId, ...args);
});

Browser.prototype.waitForDisabled = resolveElement(async function waitForDisabled(element) {
  await element.waitForEnabled(undefined, true);
});

Browser.prototype.waitForVisible = resolveElement(async function waitForVisible(element) {
  await element.waitForDisplayed();
});

Browser.prototype.waitForHidden = resolveElement(async function waitForHidden(element) {
  await element.waitForDisplayed(undefined, true);
});

Browser.prototype.findChild = findChild('findChild', '_findElement', '$');
Browser.prototype.findChildren = findChild('findChildren', '_findElements', '$$');

/**
 * end class fields
 */

module.exports = Browser;
module.exports.ElementError = ElementError;
