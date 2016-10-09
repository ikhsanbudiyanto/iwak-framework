'use strict';

/**
 * Error handler formatter
 *
 */

const Logger = require('./logger');

const writeLog = function (req, code, err, callback) {
	try {
		if(env('APP_DEBUG', 'true') == 'true') {
			let ip = req.connection.remoteAddress || 'unknown';
			let method = req.method || 'unknown';
			let url = req.originalUrl || 'unknown';

			Logger.info(`Request ${method} ${url} (${ip}) [${code}]`);
			Logger.error(err);
		}

		return callback();
	}
	catch(err) {
		callback(err);
	}
}

const ErrorHandler = {

	/**
	 *
	 *
	 */
	json : function(err, req, res, next) {
		let response = {
			error: {
				code: 500,
				message: err.message
			}
		};

		writeLog(res.req, 500, err, function (err) {});

		return res.status(500).json(response);
	},

	/**
	 *
	 *
	 */
	html : function(err, req, res, next) {
		let response = `Something went wrong. Err: ${err.message}`;

		writeLog(res.req, 500, err, function (err) {});
		
		return res.status(500).send(response);
	},

};

module.exports = ErrorHandler;