const express = require('express');
const errorHandler = require('express-async-handler');
const isAuthenticated = require('../middlewares/auth');
const isNotAuthenticated = require('../middlewares/no-auth');
const authCtrl = require('../controllers/auth.controller');
const hospCtrl = require('../controllers/hospital.controller');


const router = express.Router();

// -------------------------------Auth------------------------------------------
router.post(
  '/auth/register',
  isNotAuthenticated,
  errorHandler(authCtrl.register),
);
router.post('/auth/login', isNotAuthenticated, errorHandler(authCtrl.login));
// --------------------------------------------------------------------------------
router.post('/hospital/create', isAuthenticated, errorHandler(hospCtrl.createHospital));
router.get('/hospital/getHospitals', isAuthenticated, errorHandler(hospCtrl.getHospitals));

module.exports = router;
