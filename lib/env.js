'use strict';

/**
 * Env configuration
 *
 */

require('dotenv').config({silent: true});

/**
 *
 *
 */
const Env = function (name, defaultValue) {
	return process.env[name] || defaultValue;
};

global.env = Env;