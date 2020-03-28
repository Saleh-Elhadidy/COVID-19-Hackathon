/* eslint-disable no-param-reassign */
const mongoose = require('mongoose');
const totalsSchema = new mongoose.Schema(
    {
    grandTotals:[{
        freeBeds:Number,
        covidPatients:Number,
        day:Date,
    }],

    hospitalsTotals:[{
        hospitalName:String,
        freeBeds:Number,
        covidPatients:Number,
        day:Date,
    }],

  },
  { timestamps: true },
);


module.exports = mongoose.model('totals', totalsSchema);