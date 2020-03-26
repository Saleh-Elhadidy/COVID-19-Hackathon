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
    district:{
        type: String,
        required: true,
        trim: true,
    },
    governorate:{
        type: String,
        required: true,
        trim: true,
    },
    freeICU:{
        type: Number,
        required: false,
        default: 0,
    },
    freeVentilators:{
        type: Number,
        required: false,
        default: 0,
    },
    needSupplies:{
        type: Boolean,
        required: false,
        default: false,
    },

  },
  { timestamps: true },
);
if (!hospitalSchema.options.toObject) hospitalSchema.options.toObject = {};

hospitalSchema.options.toObject.transform = (doc, ret) => {
  delete ret.password;
  return ret;
};

module.exports = mongoose.model('Hospital', hospitalSchema);