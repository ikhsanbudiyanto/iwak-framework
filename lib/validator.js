'use strict';

/**
 * Validator
 *
 */

const validator  = require('validator');

/**
 *
 *
 */
validator.isMin = function(data, min = 1, isInt) {
	try {
		if(isInt)
			return (parseInt(data) >= min);
		else if(data.length)
			return (data.length >= min);
		else
			return false;
	}
	catch(err) {
		throw err;
	}
};

/**
 *
 *
 */
validator.isMax = function(data, max = 1, isInt) {
	try {
		if(isInt)
			return (parseInt(data) <= max);
		else if(data.length)
			return (data.length <= max);
		else
			return false;
	}
	catch(err) {
		throw err;
	}
};

/**
 *
 *
 */
validator.isString = function(data) {
	try {
		return (data.search(/[a-zA-Z]/) != -1);
	}
	catch(err) {
		throw err;
	}
};

/**
 *
 *
 */
const rules = {
	email: 'isEmail',
	URL: 'isURL',
	isMACAddress: 'isMACAddress',
	IP: 'isIP',
	FQDN: 'isFQDN',
	boolean: 'isBoolean',
	alpha: 'isAlpha',
	alphanumeric: 'isAlphanumeric',
	numeric: 'isNumeric',
	lowercase: 'isLowercase',
	uppercase: 'isUppercase',
	ascii: 'isAscii',
	fullWidth: 'isFullWidth',
	halfWidth: 'isHalfWidth',
	variableWidth: 'isVariableWidth',
	multibyte: 'isMultibyte',
	surrogatePair: 'isSurrogatePair',
	int: 'isInt',
	integer: 'isInt',
	float: 'isFloat',
	decimal: 'isDecimal',
	hexadecimal: 'isHexadecimal',
	divisibleBy: 'isDivisibleBy',
	hexColor: 'isHexColor',
	JSON: 'isJSON',
	null: 'isNull',
	length: 'isLength',
	byteLength: 'isByteLength',
	UUID: 'isUUID',
	date: 'isDate',
	after: 'isAfter',
	before: 'isBefore',
	in: 'isIn',
	creditCard: 'isCreditCard',
	ISIN: 'isISIN',
	ISBN: 'isISBN',
	mobilePhone: 'isMobilePhone',
	currency: 'isCurrency',
	ISO8601: 'isISO8601',
	base64: 'isBase64',
	dataURI: 'isDataURI',
	min: 'isMin',
	max: 'isMax',
	string: 'isString',
};

/**
 *
 *
 */
const getError = function(param, rule, message) {
	return {
		param: param,
		message: message || `Field '${param}' must be ${rule}`
	};
};

/**
 *
 *
 */
const explodeRules = function(rules) {
	try {
		return rules.split('|');
	}
	catch(err) {
		throw err;
	}
};

/**
 *
 *
 */
const validateParam = function(data, param, rule) {
	try {
		var paramRules = explodeRules(rule[0]);
		var iRequired = paramRules.indexOf('required');
		var isInt = (paramRules.indexOf('int') >= 0 || paramRules.indexOf('integer') >= 0);

		if(iRequired >= 0) {
			if(!data || data.length === 0) return getError(param, null, rule[1] || `Field '${param}' is required`);
			
			paramRules.splice(iRequired, 1);
		}
		else if(!data || data.length === 0) return null;

		for(var i = 0, len = paramRules.length; i < len; i++) {
			try {
				var expValue = getRuleValue(paramRules[i]);
				var validatorProp = rules[expValue.rule];	
				if(!((expValue.value) ? validator[validatorProp](String(data), expValue.value, isInt) : validator[validatorProp](String(data)))) 
					return getError(param, paramRules[i], rule[1]);
			}
			catch(err) {
				throw new Error(`Unknown rule '${expValue.rule}'`);
			}
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
const getRuleValue = function(rule) {
	try {
		var exp = rule.split(':');
		
		return {
			rule: exp[0],
			value: ((exp[0] === 'in') ? exp[1].split(',') : exp[1]) || null
		};
	}
	catch (err) {
		throw err;
	}
};

/**
 *
 *
 */
const result = function(req, res) {
	return {
		error : function() {
			return (res) ? true : false;
		},
		messages : function() {
			return res || [];
		},
		get : function(index, defVal) {
			if(!index) return req;
			else return req[index] || defVal;
		}
	};
};

let Validator = {};

/**
 *
 *
 */
Validator.validate = function(data, rules, filter) {
	try {
		var params = Object.keys(rules);
		var errors = [];
		var filteredData = {};

		for(var i = 0, len = params.length; i < len; i++) {
			let error = validateParam(data[params[i]], params[i], rules[params[i]]);
			if(error) errors.push(error);
			if(data.hasOwnProperty(params[i])) filteredData[params[i]] = data[params[i]];
		}

		return (errors.length > 0) ? result(data, errors) : result((filter) ? filteredData : data);
	}
	catch(err) {
		let error = [
			{
				param: null,
				message: `Error validating data, ${err.message}`
			}
		];

		return result(data, error);
	}
};

/**
 *
 *
 */
Validator.all = function(req, rules, filter = true) {
	return Validator.validate(Object.assign(Object.assign(req.query, req.body), req.params), rules, filter);
};

/**
 *
 *
 */
Validator.params = function(req, rules, filter = true) {
	return Validator.validate(req.params, rules, filter);
};

/**
 *
 *
 */
Validator.body = function(req, rules, filter = true) {
	return Validator.validate(req.body, rules, filter);
};

/**
 *
 *
 */
Validator.query = function(req, rules, filter = true) {
	return Validator.validate(req.query, rules, filter);
};

module.exports = Validator;