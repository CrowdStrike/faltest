'use strict';

const debug = require('./debug');
const { defaults } = require('@faltest/utils');

const defaultTarget = 'default';
const defaultEnv = 'default';

function initCli({
  targets = {
    default: defaultTarget,
    list: [defaultTarget],
  },
  tags = [],
  envs = {
    default: defaultEnv,
    list: [defaultEnv],
  },
  extraOptions = {},
} = {}) {
  /**
   * IF YOU CHANGE THIS
   * REGENERATE THE README
   */
  const { argv } = require('yargs')
    .options({
      'browser': {
        type: 'string',
        default: defaults.browser,
        description: 'Type of browser to run',
        choices: ['chrome', 'firefox'],
      },
      'browsers': {
        type: 'integer',
        default: defaults.browsers,
        description: 'Number of browsers to run',
      },
      'port': {
        type: 'string',
        default: '0',
        description: 'Port for WebDriver',
      },
      'headless': {
        type: 'boolean',
        default: false,
        description: 'Run browser in headless mode',
      },
      'retries': {
        type: 'integer',
        default: 0,
        description: 'When all else fails, try again!',
      },
      'target': {
        type: 'string',
        default: targets.default,
        description: 'Run against a different UI server/URL',
        choices: targets.list,
      },
      'env': {
        type: 'string',
        default: envs.default,
        description: 'Run against a different data source',
        choices: envs.list,
      },
      'share-webdriver': {
        type: 'boolean',
        default: true,
        description: 'Keep the WebDriver process open between test runs',
      },
      'keep-browser-open': {
        type: 'boolean',
        default: false,
        description: 'Keep the browser open between test runs (sets --share-webdriver)',
      },
      'share-session': {
        type: 'boolean',
        default: false,
        description: 'Keep the session (login, etc.) between test runs (sets --share-webdriver and --keep-browser-open)',
      },
      'size': {
        nargs: 2,
        description: 'Override the browser size. ex. "--size 1024 768"',
      },
      'throttle-network': {
        type: 'boolean',
        default: false,
        description: 'Slow down the network so you can see the loading states better',
      },
      // Should this be plural?
      'tag': {
        type: 'array',
        default: [],
        description: 'Filter groups of tests using the #hash tagging system (hashes are optional). Prefix with ! to negate.',
        choices: tags.reduce((tags, tag) => {
          return tags.concat(tag, `!${tag}`);
        }, []),
      },
      'filter': {
        type: 'string',
        default: '.*',
        description: 'Filter the tests by name using a pattern',
      },
      'random': {
        type: 'boolean',
        default: false,
        description: 'Randomise test order',
      },
      'seed': {
        type: 'string',
        description: 'Set the random seed to reproduce test order',
      },
      'timeouts-override': {
        type: 'integer',
        description: 'Override all Mocha timeouts for debugging purposes',
      },
      'disable-timeouts': {
        type: 'boolean',
        default: false,
        description: 'Disable all Mocha timeouts for debugging purposes',
      },
      'disable-cleanup': {
        type: 'boolean',
        default: false,
        description: 'Disable all browser cleanup',
      },
      'reporter': {
        type: 'string',
        description: 'Change the Mocha reporter',
      },
      'reporter-options': {
        type: 'string',
        description: 'Supply Mocha reporter options',
      },
      ...extraOptions,
    })
    .strict();

  function addOrRemoveTag(op, tag) {
    let tags = new Set(argv.tag);
    tags[op](tag);
    argv.tag = [...tags];
  }

  // This will probably come back at some point
  // eslint-disable-next-line no-unused-vars
  function addTag(tag) {
    addOrRemoveTag('add', tag);
  }

  // This will probably come back at some point
  // eslint-disable-next-line no-unused-vars
  function removeTag(tag) {
    addOrRemoveTag('delete', tag);
  }

  // This will probably come back at some point
  // eslint-disable-next-line no-unused-vars
  function intersectTags(tags1, tags2) {
    return tags1.filter(tag => tags2.includes(tag));
  }

  if (argv.shareSession && !argv.keepBrowserOpen) {
    debug('setting --keep-browser-open to true');
    argv.keepBrowserOpen = true;
  }

  if (argv.keepBrowserOpen && !argv.shareWebdriver) {
    debug('setting --share-webdriver to true');
    argv.shareWebdriver = true;
  }

  if (argv.seed && !argv.random) {
    debug('setting --random to true');
    argv.random = true;
  }

  let { env } = process;

  for (let [envVar, option] of [
    ['WEBDRIVER_BROWSER', 'browser'],
    ['WEBDRIVER_BROWSERS', 'browsers'],
    ['WEBDRIVER_PORT', 'port'],
    ['WEBDRIVER_HEADLESS', 'headless'],
    ['WEBDRIVER_TARGET', 'target'],
    ['NODE_CONFIG_ENV', 'env'], // https://github.com/lorenwest/node-config/wiki/Environment-Variables#node_config_env
    ['WEBDRIVER_SHARE_WEBDRIVER', 'shareWebdriver'],
    ['WEBDRIVER_KEEP_BROWSER_OPEN', 'keepBrowserOpen'],
    ['WEBDRIVER_SHARE_SESSION', 'shareSession'],
    ['WEBDRIVER_SIZE', 'size'],
    ['WEBDRIVER_THROTTLE_NETWORK', 'throttleNetwork'],
    ['WEBDRIVER_TIMEOUTS_OVERRIDE', 'timeoutsOverride'],
    ['WEBDRIVER_DISABLE_CLEANUP', 'disableCleanup'],
  ]) {
    if (!env[envVar] && argv[option] !== undefined) {
      env[envVar] = argv[option];
    }
  }

  return argv;
}

function printVersion(name, version) {
  if (!name) {
    name = require('../package').name;
  }
  if (!version) {
    version = require('../package').version;
  }

  console.log(`${name} v${version}`);
}

module.exports = initCli;
module.exports.printVersion = printVersion;
