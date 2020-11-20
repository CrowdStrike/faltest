'use strict';

const path = require('path');
const connect = require('connect');
const serveStatic = require('serve-static');
const { getNewPort } = require('../packages/remote');
const debug = require('./debug');
const stoppable = require('stoppable');

const defaultFixtures = path.resolve(__dirname, '../fixtures');

class Server {
  constructor(fixtures) {
    this.fixtures = fixtures || defaultFixtures;
  }

  async start(port) {
    if (!port) {
      port = await getNewPort();
    }

    let app = connect().use(serveStatic(this.fixtures));

    await new Promise(resolve => {
      this.server = stoppable(app.listen(port, resolve), 0);
    });

    // `close` takes 5 secs otherwise
    // `0` makes it hang forever
    // https://nodejs.org/api/http.html#http_server_keepalivetimeout
    this.server.keepAliveTimeout = 1;

    return port;
  }

  async stop() {
    if (!this.server) {
      return;
    }

    debug('Stopping test server...');

    await new Promise(resolve => {
      this.server.stop(resolve);
    });

    debug('Stopped test server');

    this.server = null;
  }
}

module.exports = Server;
