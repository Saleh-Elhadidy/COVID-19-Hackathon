/* eslint-disable no-param-reassign */
const mongoose = require('mongoose');
const hospitalSchema = new mongoose.Schema(
    {
    hospitalName:{
        type: String,
        required: true,
        trim: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    phoneNumber:{
        type: String,
        required: false,
        default: "",
    },
    district:{
        type: String,
        required: true,
        trim: true,
    },
    city:{
        type: String,
        required: true,
        trim: true,
    },
    governorate:{
        type: String,
        required: true,
        trim: true,
    },
    country:{
        type: String,
        required: true,
        trim: true,
        default:"Egypt"
    },
    freeICU:{
        type: Number,
        required: false,
        default: 0,
        min: 0,
    },
    freeVentilators:{
        type: Number,
        required: false,
        default: 0,
        min: 0,
    },
    needSupplies:{
        type: Boolean,
        required: false,
        default: false,
    },
    freeBeds:{
        type: Number,
        required: false,
        default: 0,
        min: 0,
    },
    totalBeds:{
        type: Number,
        required: true,
        default: 0,
        min: 0,
    },
    covidPatients:{
        type: Number,
        required: true,
        default: 0,
        min: 0,
    }

  },
  { timestamps: true },
);
if (!hospitalSchema.options.toObject) hospitalSchema.options.toObject = {};

hospitalSchema.options.toObject.transform = (doc, ret) => {
  delete ret.password;
  return ret;
};

module.exports = mongoose.model('Hospital', hospitalSchema);