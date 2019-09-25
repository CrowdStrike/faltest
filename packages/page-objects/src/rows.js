'use strict';

const Elements = require('./elements');
const {
  shouldPurge,
  encodeString,
} = require('./helpers/date');

const defaultPurgeLimit = 2;

class Rows extends Elements {
  async purgeOld(names, purgeLimit = defaultPurgeLimit) {
    let pageObjects = await this.getPageObjects();

    let purgedCount = 0;

    // Start from the end of the list.
    // If you start from the beginning, you'll end up
    // skipping one because the shift in content.
    // WebDriver remembers index in the list, not actual
    // element references.
    for (let i = pageObjects.length - 1; i >= 0; i--) {
      let row = pageObjects[i];

      let propName = 'name';
      let funcName = 'deleteRow';

      if (!row[propName]) {
        throw new Error(`You must implement \`row.${propName}\` if you want to run \`${this.purgeOld.name}\`.`);
      }
      if (!row[funcName]) {
        throw new Error(`You must implement \`row.${funcName}\` if you want to run \`${this.purgeOld.name}\`.`);
      }

      let encoded = await row[propName].getText();

      if (!shouldPurge(encoded, names)) {
        continue;
      }

      await row[funcName]();

      // Only do some of the rows. The list could be really
      // long, and we don't want to be in this cycle forever,
      // so we spread it out across multiple runs.
      if (++purgedCount === purgeLimit) {
        break;
      }
    }
  }
}

Rows.selector = 'tr';
Rows.encodeString = encodeString;

module.exports = Rows;
