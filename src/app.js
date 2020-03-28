const express = require('express');
const logger = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
const status = require('http-status');
const dotenv = require('dotenv');

dotenv.config();

const { MEDIA_FOLDER, NODE_ENV } = process.env;

const routes = require('./routes');

const app = express();

const cron = require("node-cron");

const {
  findAllHospitals,
} = require('./services/hospital.service');


const {
  findAllTotals
} = require('./services/totals.service');

app.use(logger(NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(
  cors({
    origin: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  }),
);
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
  }),
);
app.disable('etag');
app.use('/api', routes);
cron.schedule("1 1 */1 * * *", async () => { // Job that should run everyday to get daily count of patients, using 1hours interval for testing
  console.log("Running CRON job")
  let totals = await findAllTotals();
  let hospitals = await findAllHospitals();
  totalBeds = 0;
  totalCOVIDs = 0;
  hospitals.forEach(element => {
      totalBeds = totalBeds + element.freeBeds
      totalCOVIDs = totalCOVIDs + element.covidPatients
      totals["hospitalsTotals"].push({hospitalName:element.hospitalName,freeBeds:element.freeBeds,covidPatients:element.covidPatients,day:new Date(new Date().toDateString())})
  });
  totals["grandTotals"].push({freeBeds:totalBeds,covidPatients:totalCOVIDs,day:new Date(new Date().toDateString())})
  await totals.save();
});
// Logic Error Handler
app.use((err, req, res, next) => {
  if (NODE_ENV !== 'production') {
    console.error(err);
  }
  res.status(err.statusCode || status.INTERNAL_SERVER_ERROR).json({
    msg: err.msg || status[status.INTERNAL_SERVER_ERROR],
  });
});

// 404 Error Handler
app.use((req, res) => {
  res.status(status.NOT_FOUND).json({
    msg: status[status.NOT_FOUND],
  });
});

module.exports = app;