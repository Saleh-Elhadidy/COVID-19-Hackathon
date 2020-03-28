const Request = require('../models/request.model');


module.exports.createRequest = body => Request.create(body);
module.exports.findAllRequests = () => Request.find().exec();
module.exports.findRequestById = id => Request.findById(id).exec();
