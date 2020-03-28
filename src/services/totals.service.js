const totals = require('../models/totals.model');

module.exports.findAllTotals = () => totals.findOne().lean(false).exec();