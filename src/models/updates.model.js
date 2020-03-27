/* eslint-disable no-param-reassign */
const mongoose = require('mongoose');
const updatesSchema = new mongoose.Schema(
    {
    hospitalName:{
        type: String,
        required: true,
        trim: true,
    },
    hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Hospital',
    },
    updateTime: {
        type:Date,
        required:true,
        default:Date.now(),
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
if (!updatesSchema.options.toObject) updatesSchema.options.toObject = {};

updatesSchema.options.toObject.transform = (doc, ret) => {
  delete ret.password;
  return ret;
};

module.exports = mongoose.model('updates', updatesSchema);