'use strict';

/**
 * Logger
 *
 */

const winston = require('winston');

/**
 *
 *
 */
const logger = new (winston.Logger)({
    transports: [
		new (winston.transports.Console)({
			timestamp: function () {
				return new Date().toLocaleString('en-US', { 
					hour12: false, 
					weekday: 'short',
					year: 'numeric',
					month: '2-digit',
					day: '2-digit',
					hour: '2-digit',
					minute: '2-digit',
					second: '2-digit'
				});
			}
		})
    ]
});

module.exports = logger;