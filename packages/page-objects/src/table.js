'use strict';

const Elements = require('./elements');
const Rows = require('./rows');

class Table extends Elements {
  constructor() {
    super(...arguments);

    this.Rows = Rows;
  }

  get rows() {
    return this._extendMany(this.Rows, null, ({ each }) => {
      each(this.eachProperties);
    });
  }
}

Table.selector = 'table';

module.exports = Table;
