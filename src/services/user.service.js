const User = require('../models/user.model');

module.exports.findUserById = id => User.findById(id).exec();

module.exports.findAllUsers = () => User.find().exec();

module.exports.findUser = (query, lean = true) =>
  User.findOne(query)
    .lean(lean)
    .exec();
module.exports.findUsers = (query, lean = true) =>
  User.find(query)
      .lean(lean)
      .exec();
module.exports.createUser = body => User.create(body);

module.exports.findUserByIdAndUpdate = ({ id, update, options, lean = true }) =>
  User.findByIdAndUpdate(id, update, options)
    .lean(lean)
    .exec();

module.exports.findUserAndUpdate = ({ query, update, options, lean = true }) =>
  User.findOneAndUpdate(query, update, options)
    .lean(lean)
    .exec();

module.exports.findUserAndRemove = ({ query, lean = true }) =>
  User.findOneAndDelete(query)
    .lean(lean)
    .exec();