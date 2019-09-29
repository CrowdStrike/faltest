'use strict';

const scopeSymbol = Symbol();

function selectorFallback(PageObjectClass, selector) {
  // empty string is valid
  if (selector !== null && selector !== undefined) {
    return selector;
  }
  return PageObjectClass.selector;
}

class BasePageObject {
  constructor(browser) {
    this._browser = browser;

    this.Element = require('./element');
    this.Elements = require('./elements');
  }

  _scope(func, childSelector) {
    const BaseElement = require('./base-element');

    let isPage = !this._selector;
    let isBrowserElement = !!childSelector.$;
    let isPageObject = childSelector instanceof BaseElement;
    if (isPage || isBrowserElement || isPageObject) {
      return childSelector;
    }

    this._childSelector = childSelector;

    // don't want to accidentally call `element.$(childSelector)`
    // while building the page objects because
    // `element` probably doesn't exist yet,
    // so wrap it in a function for later resolving
    let scope = async _childSelector => {
      let result = await this._browser[func](this._selector, childSelector || _childSelector);
      return result;
    };

    if (typeof childSelector === 'string') {
      if (typeof this._selector === 'string') {
        return `${this._selector} ${childSelector}`;
      }
      if (this._selector[scopeSymbol]) {
        let _childSelector = `${this._selector[scopeSymbol]} ${childSelector}`;
        scope = this._selector.bind(this, _childSelector);
        scope[scopeSymbol] = _childSelector;
        return scope;
      }

      scope[scopeSymbol] = childSelector;
    }

    return scope;
  }

  scope(childSelector) {
    return this._scope('findChild', childSelector);
  }

  scopeMany(childSelector) {
    return this._scope('findChildren', childSelector);
  }

  scopeChild(childSelector) {
    return this._create(childSelector);
  }

  scopeChildren(childSelector) {
    return this._createMany(childSelector);
  }

  _create(selector, ...args) {
    return this._extend(this.Element, selector, ...args);
  }

  _createMany(selector, ...args) {
    return this._extendMany(this.Elements, selector, ...args);
  }

  _extend(PageObjectClass, selector, ...args) {
    selector = this.scope(selectorFallback(PageObjectClass, selector));

    return this.extend(PageObjectClass, selector, ...args);
  }

  _extendMany(PageObjectClass, selector, ...args) {
    selector = this.scopeMany(selectorFallback(PageObjectClass, selector));

    return this.extend(PageObjectClass, selector, ...args);
  }

  _createUnscoped(selector, ...args) {
    return this._extendUnscoped(this.Element, selector, ...args);
  }

  _createManyUnscoped(selector, ...args) {
    return this._extendManyUnscoped(this.Elements, selector, ...args);
  }

  _chain(extraProperties) {
    return applyProperties(extraProperties, this, this);
  }
}

function extend(PageObjectClass, selector, extraProperties = () => {}) {
  const BaseElement = require('./base-element');

  let assigned;
  let unassigned;

  if (selector instanceof BaseElement) {
    assigned = selector;
  } else {
    assigned = new PageObjectClass(selector, this._browser);
  }
  unassigned = new PageObjectClass(assigned.selector, this._browser);

  // support proper chaining of `_super`
  if (assigned.extraProperties) {
    unassigned = applyProperties(assigned.extraProperties, assigned.unassigned, unassigned);
  }

  assigned.extraProperties = extraProperties;
  assigned.unassigned = unassigned;

  return applyProperties(extraProperties, unassigned, assigned);
}

function applyProperties(extraProperties, unassigned, assigned) {
  const BaseElement = require('./base-element');
  const Elements = require('./elements');

  let scope = assigned.scope.bind(assigned);
  let scopeMany = assigned.scopeMany.bind(assigned);
  let create = assigned._create.bind(assigned);
  let createMany = assigned._createMany.bind(assigned);
  let extend = assigned._extend.bind(assigned);
  let extendMany = assigned._extendMany.bind(assigned);

  let props = extraProperties({
    selector: assigned.selector,
    _super: unassigned,
    pageObject: assigned,
    scope,
    scopeMany,
    each(eachProperties) {
      if (!(assigned instanceof Elements)) {
        throw new Error('each can only be invoked with an Elements type');
      }

      assigned.eachProperties = eachProperties;
      unassigned.eachProperties = eachProperties;
    },
    create,
    createMany,
    extend,
    extendMany,
  });

  if (props instanceof BaseElement) {
    return props;
  }

  return Object.assign(
    assigned,
    props
  );
}

BasePageObject.prototype.extend = extend;
BasePageObject.prototype._extendUnscoped = extend;
BasePageObject.prototype._extendUnscopedMany = extend;

module.exports = BasePageObject;
