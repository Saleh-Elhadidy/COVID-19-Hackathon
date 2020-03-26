const joi = require('joi');
const {
  UNAUTHORIZED,
  FORBIDDEN,
  NOT_FOUND,
  CONFLICT,
  UNPROCESSABLE_ENTITY,
  OK,
  CREATED,
} = require('http-status');
const {
  findUser,
  createUser,
  findUserById
} = require('../services/user.service');
const {
    findHospital,
    createHospital,
    findAllHospitals
  } = require('../services/hospital.service');
const {
  checkForCorrectPassword,
  signJWT,
  encryptPassword,
  findHospitalById
} = require('../services/auth.service');
const Hospital = require('../models/hospital.model');

module.exports.createHospital = async (req, res) => {
    const schema = joi
      .object({
        hospitalName: joi
            .string()
            .trim()
            .required(),
        username: joi
            .string()
            .trim()
            .required(),
        password: joi
            .string()
            .trim()
            .min(8)
            .required(),
        email: joi
            .string()
            .trim()
            .required(),
        district: joi
            .string()
            .trim()
            .required(),
        governorate: joi
            .string()
            .trim()
            .required(),
      })
      .options({
        stripUnknown: true,
      });
    const { error, value: body } = schema.validate(req.body);
    if (error) {
      return res.status(UNPROCESSABLE_ENTITY).json({
        msg: error.details[0].message,
      });
    }
    let currUserId = req.decodedToken.user._id;
    let currUser = await findUserById(currUserId);

    if(currUser && currUser.userLevel === 1){
        let hospital = await findHospital({
            $or: [
              {
                  username: body.username
              },
              {
                  hospitalName: body.hospitalName
              },
            ],
          });
          if (hospital) {
            return res.status(CONFLICT).json({
              msg: 'Hospital with the same username/hospital name exists, please choose another.',
            });
          }
          Object.assign(
            body,
            { password: await encryptPassword(body.password),
              email: body.email},
          );
          hospital = await createHospital(body);
          if(hospital){
            return res.status(CREATED).json({
                msg: `Hospital Created successfully.`,
              });
          }
          else
          {
            return res.status(UNAUTHORIZED).json({ msg: 'Wrong data enterd.' });
          }
    }
    else
    {
        return res.status(UNAUTHORIZED).json({msg:'Wrong Un-Authorized action .'})
    }
  };

  module.exports.getHospitals = async (req, res) => {

    let currUserId = req.decodedToken.user._id;
    let currUser = await findUserById(currUserId);
    if(currUser && currUser.userLevel === 1){
        let hospitals = await findAllHospitals();
          if (!hospitals) {
            return res.status(UNPROCESSABLE_ENTITY).json({
              msg: 'Error finding hospitals',
            });
          }
          else
          {
            return res.status(OK).json({
                msg: `Hospital Created successfully.`,
                data:hospitals,
              });
          }
    }
    else
    {
        return res.status(UNAUTHORIZED).json({msg:'Wrong Un-Authorized action .'})
    }
  };

  /**
 * Update an hospital
 */
module.exports.update = async (req, res) => {
  if(req.params.hospitalId == req.decodedToken.user._id){
    Hospital.findById(req.params.hospitalId).exec(function (err, hospital) {
      if (err) {
          return res.status(UNPROCESSABLE_ENTITY).send({
              msg: 'Error Occured'
              });
      } else if (!hospital) {
          return res.status(404).send({
          msg: 'No Hospital with that identifier has been found'
          });
      }else{
      //req.hospital = hospital;    
      var hospital = req.hospital;
      hospital.save(function (err) {
        if (err) {
            return res.status(UNPROCESSABLE_ENTITY).json({
              msg: err.details[0].message,
            });
          }else{
            return res.status(OK).json({
              msg: 'hospital edited successfully',
              data: hospital,
            });
          }
      });

  }
  });
  }


};