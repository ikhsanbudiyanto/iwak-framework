'use strict';

/**
 * Loader
 *
 */

const path = require('path');

const providers = {
	'Route'			: 'router',
	'Validator'		: 'validator',
	'ErrorHandler'	: 'error-handler',
	'Response'		: 'response',
	'Logger'		: 'logger',
	'Database' 		: 'database',
};

/**
 *
 *
 */
const Use = function (namespace) {
	if(providers.hasOwnProperty(namespace)) {
		return require(path.join(`${__dirname}/${providers[namespace]}`));
	}
	else {
		if(namespace.match(/^app\/[a-zA-Z0-9_\/\.]+$/)) {
			return require(path.join(`${__dirname}./../../../${namespace}`));
		}
		else {
			return require(namespace);
		}
	}
};

global.use = Use;