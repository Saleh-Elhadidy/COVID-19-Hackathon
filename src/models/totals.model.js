/* eslint-disable no-param-reassign */
const mongoose = require('mongoose');
const totalsSchema = new mongoose.Schema(
    {
    grandTotals:[{
        freeBeds:Number,
        covidPatients:Number,
        day:String,
    }],

    hospitalsTotals:[{
        hospitalName:String,
        freeBeds:Number,
        covidPatients:Number,
        day:String,
    }],

  },
  { timestamps: true },
);


module.exports = mongoose.model('totals', totalsSchema);