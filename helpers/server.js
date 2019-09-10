'use strict';

const path = require('path');
const connect = require('connect');
const serveStatic = require('serve-static');
const { getNewPort } = require('@faltest/remote');

class Server {
  async start(port) {
    if (!port) {
      port = await getNewPort();
    }

    let server = connect().use(serveStatic(path.resolve(__dirname, '../fixtures')));

    await new Promise(resolve => {
      this.server = server.listen(port, resolve);
    });

    return port;
  }

  async stop() {
    if (!this.server) {
      return;
    }

    this.server.close();

    await new Promise(resolve => {
      this.server.once('close', resolve);
    });

    this.server = null;
  }
}

module.exports = Server;
