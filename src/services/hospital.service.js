const Hospital = require('../models/hospital.model');
const updates = require('../models/updates.model');

module.exports.findHospitalById = id => Hospital.findById(id).exec();

module.exports.findAllHospitals = () => Hospital.find().exec();

module.exports.findHospital = (query, lean = true) =>
Hospital.findOne(query)
    .lean(lean)
    .exec();
module.exports.findHospitals = (query, lean = true) =>
Hospital.find(query)
      .lean(lean)
      .exec();
module.exports.createHospital = body => Hospital.create(body);

module.exports.findHospitalByIdAndUpdate = ({ id, update, options, lean = true }) =>
Hospital.findByIdAndUpdate(id, update, options)
    .lean(lean)
    .exec();

module.exports.findHospitalAndUpdate = ({ query, update, options, lean = true }) =>
Hospital.findOneAndUpdate(query, update, options)
    .lean(lean)
    .exec();

module.exports.findHospitalAndRemove = ({ query, lean = true }) =>
Hospital.findOneAndDelete(query)
    .lean(lean)
    .exec();

module.exports.findHospitalsSorted = (query,sortParams, lean = true) =>
Hospital.find(query).sort(sortParams)
          .lean(lean)
          .exec();

module.exports.findHospitalByIdAndDelete = ({query,lean = true}) => 
    Hospital.findOneAndRemove(query).lean(true).exec();


// -----------------------------------------------------------------------
module.exports.createUpdate = body => updates.create(body);

module.exports.findUpdates = (query, lean = true) =>
updates.findOne(query)
    .lean(lean)
    .exec();

module.exports.findAllUpdates = () => updates.find().exec();
