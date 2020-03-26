const mongoose = require('mongoose');
const { isValid } = require('date-fns');

module.exports.isString = val => typeof val === 'string';

module.exports.isNumber = val => !Number.isNaN(val);

module.exports.isBoolean = val =>
  val === true || val === false || toString.call(val) === '[object Boolean]';

module.exports.isDate = val => isValid(val);

module.exports.isObject = val => typeof val === 'object';

module.exports.isArray = val => Array.isArray(val);

module.exports.isObjectId = val => mongoose.Types.ObjectId.isValid(val);

module.exports.matchesRegex = (val, regex) => regex.test(val);