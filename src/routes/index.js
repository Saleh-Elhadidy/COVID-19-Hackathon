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
// -------------------------------Hospital-------------------------------------------------
router.post('/hospital/create', isAuthenticated, errorHandler(hospCtrl.createHospital));
router.get('/hospital/getHospitals', isAuthenticated, errorHandler(hospCtrl.getHospitals));
router.post('/hospital/loginHospital', isNotAuthenticated , errorHandler(hospCtrl.loginHospital));
router.patch('/hospital/insertUpdates/:hospitalId', isAuthenticated , errorHandler(hospCtrl.insertUpdates));
router.post('/hospital/requestSupplies/:hospitalId', isAuthenticated , errorHandler(hospCtrl.requestSupplies));

router.get('/hospital/findByDistrict', isAuthenticated , errorHandler(hospCtrl.findHospitalByDistrict));
router.get('/hospital/findByGov', isAuthenticated , errorHandler(hospCtrl.findHospitalByGov));
router.get('/hospital/findByCity', isAuthenticated , errorHandler(hospCtrl.findHospitalByCity));
router.get('/hospital/sortHospitals', isAuthenticated , errorHandler(hospCtrl.sortHospitals));
router.patch('/hospital/deleteHospital/:hospitalId', isAuthenticated , errorHandler(hospCtrl.deleteHospital));
router.get('/hospital/getUpdates', isAuthenticated , errorHandler(hospCtrl.getUpdates));
router.get('/hospital/getAllRequests', isAuthenticated , errorHandler(hospCtrl.getAllRequests));
router.get('/hospital/getHospitalRequests/:hospitalId', isAuthenticated , errorHandler(hospCtrl.getHospitalRequests));
router.patch('/hospital/updateRequest/:hospitalId/:requestlId', isAuthenticated , errorHandler(hospCtrl.updateRequest));
router.delete('/hospital/deleteRequest/:hospitalId/:requestlId', isAuthenticated , errorHandler(hospCtrl.deleteRequest))

router.patch('/hospital/handleRequest/:requestlId', isAuthenticated , errorHandler(hospCtrl.handleRequest))

module.exports = router;
