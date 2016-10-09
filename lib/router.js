'use strict';

/**
 * Router
 *
 */

const express = require('express');
const path    = require('path');
const app     = require('./app');
const routes  = {};

const appDir  = path.join(`${__dirname}./../../../app`);

/**
 *
 *
 */
const Router  = (function() {

	var newInstance = null;

	/**
	*
	*
	*/
	const Router = function(namespace = '', prefix = '', router = app) {
		this.namespace = namespace;
		this.prefix = prefix;
		this.router = router;
		this.hasRoute = false;
	};

	/**
	*
	*
	*/
	Router.prototype.get = function(config, paramA, paramB) {
		try {
			this.route('get', config, paramA, paramB);

			return this;
		}
		catch(err) {
			throw err;
		}
	};

	/**
	*
	*
	*/
	Router.prototype.post = function(config, paramA, paramB) {
		try {
			this.route('post', config, paramA, paramB);

			return this;
		}
		catch(err) {
			throw err;
		}
	};

	/**
	*
	*
	*/
	Router.prototype.put = function(config, paramA, paramB) {
		try {
			this.route('put', config, paramA, paramB);

			return this;
		}
		catch(err) {
			throw err;
		}
	};

	/**
	*
	*
	*/
	Router.prototype.patch = function(config, paramA, paramB) {
		try {
			this.route('patch', config, paramA, paramB);

			return this;
		}
		catch(err) {
			throw err;
		}
	};

	/**
	*
	*
	*/
	Router.prototype.delete = function(config, paramA, paramB) {
		try {
			this.route('delete', config, paramA, paramB);

			return this;
		}
		catch(err) {
			throw err;
		}
	};

	/**
	*
	*
	*/
	Router.prototype.all = function(config, paramA, paramB) {
		try {
			this.route('all', config, paramA, paramB);

			return this;
		}
		catch(err) {
			throw err;
		}
	};

	/**
	*
	*
	*/
	Router.prototype.group = function(config, paramA, paramB) {
		try {
			config = parseConfig(this.namespace, config);

			let router = express.Router();
			this.router.use(config.prefix, router);
			this.newInstance = new Router(config.namespace, `${this.prefix}${config.prefix}`, router);

			// middleware is not exists
			if(typeof paramB === 'undefined') {
				paramA(this.newInstance);
			}
			else {
				var middlewares = loadMiddleware(paramA);
				for(var i = 0, len = middlewares.length; i < len; i++) {
					router.use(middlewares[i]);
				}

				paramB(this.newInstance);
			}

			return this;
		}
		catch(err) {
			throw err;
		}
	};

	/**
	*
	*
	*/
	Router.prototype.controller = function(config, paramA, paramB) {
		try {
			config = parseConfig(this.namespace, config);

			var loaded = loadControllerAndMiddleware(config, paramA, paramB);
			var methods = loaded.methods;

			for(var i = 0, len = methods.length; i < len; i++) {
				var name = restNamed(methods[i]);
				if(name) {
					this.hasRoute = true;
					var nPrefix = `${config.prefix}${name.prefix}`;

					declareRoute(this.prefix, name.method, nPrefix);

					if(!loaded.insMiddlewares[methods[i]]) {
						if(loaded.middlewares) 
							this.router[name.method](nPrefix, loaded.middlewares, loaded.controller[methods[i]]);
						else 
							this.router[name.method](nPrefix, loaded.controller[methods[i]]);
					}
					else {
						let nMiddlewares = (loaded.middlewares) ? loaded.insMiddlewares[methods[i]].concat(loaded.middlewares) : loaded.insMiddlewares[methods[i]];
						this.router[name.method](nPrefix, nMiddlewares, loaded.controller[methods[i]]);
					}
				}
			}

		  return this;
		}
		catch(err) {
		  throw err;
		}
	};

	/**
	*
	*
	*/
	Router.prototype.resource = function(config, paramA, paramB, paramC) {
		try {
			var param = (config.param) ? `/:${config.param}` : '/:id';

			config = parseConfig(this.namespace, config);

			var loaded = loadControllerAndMiddleware(config, paramA, paramB);
			var methods = loaded.methods;

			const crud = {
				index: {method: 'get', hasParam: false},
				store: {method: 'post', hasParam: false},
				update: {method: 'put', hasParam: true},
				show: {method: 'get', hasParam: true},
				destroy: {method: 'delete', hasParam: true},
			};

			for(var i = 0, len = methods.length; i < len; i++) {
				if(crud.hasOwnProperty(methods[i])) {
					this.hasRoute = true;
					var prefix = config.prefix + ((crud[methods[i]].hasParam) ? param : '');

					declareRoute(this.prefix, crud[methods[i]].method, prefix);

					if(!loaded.insMiddlewares[methods[i]]) {
						if(loaded.middlewares) 
						  this.router[crud[methods[i]].method](prefix, loaded.middlewares, loaded.controller[methods[i]]);
						else 
						  this.router[crud[methods[i]].method](prefix, loaded.controller[methods[i]]);
					}
					else {
						let nMiddlewares = (loaded.middlewares) ? loaded.insMiddlewares[methods[i]].concat(loaded.middlewares) : loaded.insMiddlewares[methods[i]];
						this.router[crud[methods[i]].method](prefix, nMiddlewares, loaded.controller[methods[i]]);
					}
				}
			}

			if(typeof paramC !== 'undefined' && typeof paramC === 'function') this.group(config.prefix, paramA, paramC);
			else if(typeof paramC === 'undefined' && typeof paramB === 'function') this.group(config.prefix, paramB);

			return this;
		}
		catch(err) {
			throw err;
		}
	};

	/**
	*
	*
	*/
	Router.prototype.route = function(method, config, paramA, paramB) {
		try {
			config = parseConfig(this.namespace, config);
			declareRoute(this.prefix, method, config.prefix);

			this.hasRoute = true;

			// middleware is not exists
			if(typeof paramB === 'undefined') {
				const controller = (typeof paramA === 'function') ? paramA : loadController(config.namespace, paramA);
				this.router[method](config.prefix, controller);
			}
			else {
				const controller = (typeof paramB === 'function') ? paramB : loadController(config.namespace, paramB);
				const middleware = (typeof paramA === 'function') ? paramA : loadMiddleware(paramA);
				this.router[method](config.prefix, middleware, controller);
			}

			return this;
		}
		catch(err) {
		 	throw err;
		}
	};

	/**
	*
	*
	*/
	Router.prototype.error = function(handler) {
		try {
			if(typeof handler !== 'function') {
				const errHandler = require('./error-handler');
				handler = errHandler[handler];
			}

			if(!this.hasRoute && !this.newInstance) {
				throw new Error('Error handler cannot be assigned on empty route');
			}
			else if(!this.hasRoute && this.newInstance) {
				this.newInstance.error(handler);
				this.newInstance = null;
			}
			else {
				this.router.use(handler);
				this.newInstance = null;
			}

			return null;
		}
		catch(err) {
			throw err;
		}
	};

	/**
	*
	*
	*/
	var loadControllerAndMiddleware = function(config, paramA, paramB) {
		try {
			if(typeof paramB === 'undefined' || typeof paramB === 'function') {
				var Controller = require(`${appDir}/controllers${config.namespace}/${paramA}`);
				var middlewares = null; 
			}
			else {
				var Controller = require(`${appDir}/controllers${config.namespace}/${paramB}`);
				var middlewares = loadMiddleware(paramA); 
			}

			const instance = new Controller();
			const methods = Object.getOwnPropertyNames(Controller.prototype);

			var insMiddlewares = {};
			if(instance.middleware) {
				var midMethods = Object.getOwnPropertyNames(instance.middleware);
				for(var i = 0; i < midMethods.length; i++) {
					for(var j = 0, len = instance.middleware[midMethods[i]].length; j < len; j++) {
						var key = instance.middleware[midMethods[i]][j];
						if(!insMiddlewares[key]) insMiddlewares[key] = [];
						insMiddlewares[key].push(loadMiddleware(midMethods[i])[0]); 
					}
				}
			}

			return { controller: instance, methods: methods, middlewares: middlewares, insMiddlewares: insMiddlewares };
		}
		catch(err) {
			throw err;
		}
	};

	/**
	*
	*
	*/
	var declareRoute = function(mPrefix, method, prefix) {
		try {
			const key = `${method.toUpperCase()}\t${mPrefix}${prefix}`;

			if(routes[key]) 
				throw new Error(`Cannot redeclare prefix ${method.toUpperCase()} '${mPrefix}${prefix}'`);

			routes[key] = 1;

			if(env('APP_DEBUG', 'true') == 'true') console.log(`Route : ${key}`);

			return;
		}
		catch(err) {
			throw err;
		}
	};

	/**
	*
	*
	*/
	var parseConfig = function(mNamespace, config = '') {
		try {
			if(typeof config === 'string') {
				return {
					namespace: mNamespace,
					prefix: config,
					options: {}
				};
			}
			else {
				return {
					namespace: (config.namespace) ? `${mNamespace}/${config.namespace}` : `${mNamespace}`,
					prefix: (config.prefix) ? config.prefix : '/',
					options: config.options || {}
				};
			}
		}
		catch(err) {
		  throw err;
		}
	};

	/**
	*
	*
	*/
	var restNamed = function(name) {
		try {
			var expName = name.match(/^(get|post|put|patch|delete)([A-Z][a-zA-Z0-9_\$]+)$/);
			if(expName) {
				var secondPrefix = expName[2].substr(1);
				var prefix = expName[2].charAt(0) + secondPrefix.replace(/([A-Z])/g, '-$1');
				prefix = prefix.toLowerCase();
				prefix = prefix.replace(/\$([a-zA-Z0-9]+)/g, '/:$1');
				prefix = prefix.replace(/^index\/([a-zA-Z0-9_:\/]+)/g, '$1');

				return {
					method: expName[1],
					prefix: (prefix === 'index') ? '/' : `/${prefix}`
				};
		  	}

			return null;
		}
		catch(err) {
			throw err;
		}
	};

	/**
	*
	*
	*/
	var loadController = function(namespace, controller) {
		try {
			const split = controller.split('.');
			var Controller = require(`${appDir}/controllers${namespace}/${split[0]}`);
			const instance = new Controller();

			return instance[split[1]];
		}
		catch(err) {
			throw err;
		}
	}

	/**
	*
	*
	*/
	var loadMiddleware = function(middlewares) {
		try {
			var arrMiddlewares = [];

			if(typeof middlewares !== 'object') {
				middlewares = [middlewares];
			}

			for(var i = 0, len = middlewares.length; i < len; i++) {
				if(typeof middlewares[i] === 'function') {
					arrMiddlewares.push(middlewares[i]);
				}
				else {
					const Middleware = require(`${appDir}/${middlewares[i]}`);
					let middleware = new Middleware();

					if(!middleware.handle) throw new Error(`${split[0]} is not a middleware function, handle() method not found`);

					arrMiddlewares.push(middleware.handle);
				}
			}

			return arrMiddlewares;
		}
		catch(err) {
			throw err;
		}
	};

	return Router;

})();

module.exports = new Router();