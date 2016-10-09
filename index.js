'use strict';

/**
 * Index.js
 *
 */

require('./lib/env');
require('./lib/loader');

const app = require('./lib/app');

module.exports = app;