'use strict';

const path = require('path');
const connect = require('connect');
const serveStatic = require('serve-static');
const { getNewPort } = require('../packages/remote');

class Server {
  constructor(fixtures) {
    this.fixtures = fixtures || path.resolve(__dirname, '../fixtures');
  }

  async start(port) {
    if (!port) {
      port = await getNewPort();
    }

    let app = connect().use(serveStatic(this.fixtures));

    await new Promise(resolve => {
      this.server = app.listen(port, resolve);
    });

    return port;
  }

  async stop() {
    if (!this.server) {
      return;
    }

    await new Promise(resolve => {
      this.server.close(resolve);
    });

    this.server = null;
  }
}

module.exports = Server;
