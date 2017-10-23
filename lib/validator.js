'use strict';

/**
 * Form Validator
 *
 */

import validator from 'validator';
import crypto from 'crypto';

/**
 *
 */
validator.xIsMin = function(data, min = 1, isInt) {
	if (isInt)
		return (parseInt(data) >= min);
	else if (data.length)
		return (data.length >= min);
	else
		return false;
};

/**
 *
 */
validator.xIsMax = function(data, max = 1, isInt) {
	if (isInt)
		return (parseInt(data) <= max);
	else if (data.length)
		return (data.length <= max);
	else
		return false;
};

/**
 * Source: http://stackoverflow.com/a/2048572
 */
validator.xIsTime = function(data) {
	return (data.match(/^([0-1][0-9]|2[0-3]):([0-5][0-9])$/)) ? true : false;
};

/**
 *
 */
validator.xIsDate = function(data) {
	return (data.match(/^\d{4}-\d{2}-\d{2}$/) ? true : false);
};

/**
 *
 */
validator.xIsDatetime = function(data) {
	return (data.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/) ? true : false);
};

/**
 *
 */
validator.xIsMatch = function(data, pattern) {
	return (data.match(new RegExp(pattern))) ? true : false;
};

/**
 *
 */
validator.xIsString = function(data) {
	return (data.search(/[a-zA-Z]/) != -1);
};

/**
 *
 */
validator.xIsAnyChar = function(data) {
	return true;
};

/**
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
	mongoId: 'isMongoId',
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
	after: 'isAfter',
	before: 'isBefore',
	in : 'isIn',
	creditCard: 'isCreditCard',
	ISIN: 'isISIN',
	ISBN: 'isISBN',
	mobilePhone: 'isMobilePhone',
	currency: 'isCurrency',
	ISO8601: 'isISO8601',
	base64: 'isBase64',
	dataURI: 'isDataURI',
	match: 'xIsMatch',
	min: 'xIsMin',
	max: 'xIsMax',
	string: 'xIsString',
	time: 'xIsTime',
	date: 'xIsDate',
	datetime: 'xIsDatetime',
	'*': 'xIsAnyChar'
};

/**
 *
 */
const schemasCache = {};

/**
 *
 */
const getSchema = function(_rules) {
	try {
		var cacheKey = crypto.createHash('sha1').update(JSON.stringify(_rules)).digest('hex');

		if (schemasCache[cacheKey]) {
			return schemasCache[cacheKey];
		}

		var keys = Object.keys(_rules);
		var objSchema = {};

		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];
			var rule = (Array.isArray(_rules[key])) ? _rules[key] : [_rules[key], ''];
			var expRule = rule[0].split('|');

			objSchema[key] = {
				isRequired: false,
				isInteger: false
			};

			var arrRules = [];
			for (var j = 0; j < expRule.length; j++) {
				if (expRule[j] === 'int' || expRule[j] === 'integer')
					objSchema[key].isInteger = true;

				if (expRule[j] === 'required') {
					objSchema[key].isRequired = true;
				} else {
					var expElem = expRule[j].split(/:(.+)?/);
					var ruleValue = (expElem[0].search(/^(in|exists)$/) != -1) ? expElem[1].split(',') : (expElem[1] || null);

					if (!rules[expElem[0]])
						throw new Error(`Invalid rule '${expElem[0]}'`);

					arrRules.push({
						type: expElem[0],
						value: ruleValue
					});
				}
			}
			objSchema[key].rules = arrRules;
			objSchema[key].message = (rule[1] && rule[1] !== '') ? rule[1] : null;
		}

		schemasCache[cacheKey] = objSchema;

		return objSchema;
	} catch (err) {
		throw new Error(`Validator error: ${err.message}`);
	}
};

/**
 *
 */
const getError = function(param, rule, message) {
	return {
		parameter: param,
		type: `${rule.type}Error`,
		message: message || `Parameter '${param}' should be ${rule.type}` + ((rule.value) ? `:${rule.value}` : '')
	};
};

/**
 *
 */
const getResult = function(data, errors) {
	return {
		error: function() {
			return (errors && errors.length > 0) ? true : false;
		},
		messages: function() {
			return errors || [];
		},
		message: function(index = 0) {
			return errors[index];
		},
		get: function(key, defVal) {
			if (!key) return data;
			else return data[key] || defVal;
		}
	};
};

/**
 *
 */
const validateSchema = function(objData, param, schema) {
	try {
		var data = objData[param];

		if (schema.isRequired) {
			if (!data || data.length === 0) return getError(param, {
				type: 'required'
			}, schema.message || `Parameter '${param}' is required`);
		} else {
			if (!data || data.length === 0) return null;
		}

		for (var i = 0; i < schema.rules.length; i++) {
			var schemaRules = schema.rules[i];
			var ruleKey = rules[schemaRules.type];

			var valid = (schemaRules.value) ? validator[ruleKey](String(data), schemaRules.value, schema.isInteger) : validator[ruleKey](String(data));
			if (!valid) {
				return getError(param, schemaRules, schema.message);
			}
		}

		return null;
	} catch (err) {
		throw new Error(`Validation error: ${err.message}`);
	}
};

let Validator = {};

/**
 *
 */
Validator.validate = function(data, rules, filter) {
	// if(Object.keys(data).length == 0) return getResult(data, [getError('*', {type: 'emptyRequest'}, 'Empty request body')]);

	var schema = getSchema(rules);
	var schemaKeys = Object.keys(schema);
	var errors = [];
	var filteredData = {};

	for (var i = 0; i < schemaKeys.length; i++) {
		var key = schemaKeys[i];
		var error = validateSchema(data, key, schema[key]);
		if (error) errors.push(error);
		if (typeof data[key] != 'undefined') {
			filteredData[key] = data[key];
		}
	}

	return getResult((filter) ? filteredData : data, errors);
};

/**
 *
 */
Validator.all = function(req, rules, filter = true) {
	return Validator.validate(Object.assign(Object.assign(req.query, req.body), req.params), rules, filter);
};

/**
 *
 */
Validator.params = function(req, rules, filter = true) {
	return Validator.validate(req.params, rules, filter);
};

/**
 *
 */
Validator.body = function(req, rules, filter = true) {
	return Validator.validate(req.body, rules, filter);
};

/**
 *
 */
Validator.query = function(req, rules, filter = true) {
	return Validator.validate(req.query, rules, filter);
};

module.exports = Validator;