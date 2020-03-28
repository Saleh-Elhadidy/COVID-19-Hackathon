
/* eslint-disable no-param-reassign */
const mongoose = require('mongoose');
const requestSchema = new mongoose.Schema(
    {
        need:{
            type: String,
            required: true,
            trim: true,
        },
        quantity:{
            type: Number,
            default: 0,
            min: 0,
        },
        available:{
            type: Number,
            default: 0,
            min: 0,
        },
        priority:{
            type: Number,
            enum : [1,2,3],
            default: 1,
            required: true
        },
        hospital: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Hospital',
        },
        handled:{
            type: Boolean,
            default: false,
        },
        hospitalName:{
            type: String,
            default: "no name",
        },

  },
  { timestamps: true },
);


module.exports = mongoose.model('request', requestSchema);