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
  findHospitals,
  createHospital,
  findHospitalsSorted,
  findAllHospitals
} = require('../services/hospital.service');
const {
findHospitalById,
checkForCorrectPassword,
signJWT,
signJWTHospital,
encryptPassword,
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
      city: joi
          .string()
          .trim()
          .required(),
      governorate: joi
          .string()
          .trim()
          .required(),
      country: joi
          .string()
          .trim()
          .required(),
      phoneNumber: joi
          .string()
          .required(),
      totalsBeds: joi
          .number()
          .required()
          .min(0),
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
            {
                email: body.email
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
          if(Array.isArray(hospitals))
          {
            hospitals.forEach(hospital => {
              hospital.password = null
              hospital.username = null
              hospital.email = null
            });
            return res.status(OK).json({
              msg: `Sorted by district!.`,
              data:hospitals,
            });
          }
          else
          {
            hospitals.password = null
            hospitals.username = null
            hospitals.email = null
            return res.status(OK).json({
              msg: `Sorted by district!.`,
              data:hospitals,
            });
          }
        }
  }
  else
  {
      return res.status(UNAUTHORIZED).json({msg:'Wrong Un-Authorized action .'})
  }
};

module.exports.loginHospital = async (req,res) =>{
  const schema = joi
  .object({
    username: joi
      .string()
      .trim()
      .lowercase()
      .required(),
    password: joi
      .string()
      .trim()
      .required(),
    rememberMe: joi.boolean(),
  })
  .options({ stripUnknown: true });

  const { error, value: body } = schema.validate(req.body);

  if (error) {
    console.log(error.details[0].message);
    return res.status(UNPROCESSABLE_ENTITY).json({
      msg: error.details[0].message,
    });
  }
  let hospital = await findHospitals({
    username:body.username
  },false);
  if(hospital)
  {
    let passCheck = await checkForCorrectPassword(body.password,hospital.password);
    if(passCheck)
    {
      let data2 = await signJWTHospital(hospital,true);
      return res.status(OK).json({msg:"Login Successfull",token:data2});
    }
    else
    {
      return res.status(UNAUTHORIZED).json({msg:"Wrong data entered!"});
    }
  };
}
  /**
 * Update an hospital
 */
module.exports.updateHospital = async (req, res) => {
  if(req.decodedToken.hospital!=null && req.decodedToken.hospital!=undefined )
  {      console.log("here")
    console.log(req.decodedToken.hospital._id)
    if(req.params.hospitalId == req.decodedToken.hospital._id){
      console.log("here")

      const schema = joi
      .object({
        freeVentilators: joi
          .number()
          .required()
          .min(0),
        freeICU: joi
          .number()
          .required()
          .min(0),
        freeBeds: joi
          .number()
          .required()
          .min(0),
      })
      .options({ stripUnknown: true });
    
      const { error, value: body } = schema.validate(req.body);
      if (error) {
        console.log(error.details[0].message);
        return res.status(UNPROCESSABLE_ENTITY).json({
          msg: error.details[0].message,
        });
      }
      console.log("here")
      Hospital.findById(req.params.hospitalId).exec(function (err, hospital) {
        if (err) {
            return res.status(UNPROCESSABLE_ENTITY).send({
                msg: 'Error Occured'
                });
        } else if (!hospital) {
            return res.status(404).send({
            msg: 'No Hospital with that identifier has been found'
            });
        }
        else{
        hospital.freeVentilators =  body.freeVentilators
        hospital.freeICU=  body.freeICU
        hospital.freeBeds =  body.freeBeds  
        hospital.save(function (err) {
          if (err) {
              return res.status(UNPROCESSABLE_ENTITY).json({
                msg: err,
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
  }
else
{
  return res.status(404).send({
    msg: 'No Hospital with that identifier has been found'
    });
}
};

module.exports.findHospitalByDistrict = async (req,res) =>{
  const schema = joi
  .object({
    district: joi
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
else
{
  if(req.decodedToken.user.userLevel === 1)
  {
    let hospitals = await findHospitals({district: new RegExp('^'+body.district+'$', "i")});
    if(hospitals)
    {
      if(Array.isArray(hospitals))
      {
        hospitals.forEach(hospital => {
          hospital.password = null
          hospital.username = null
          hospital.email = null
        });
        return res.status(OK).json({
          msg: `Sorted by district!.`,
          data:hospitals,
        });
      }
      else
      {

        hospitals.password = null
        hospitals.username = null
        hospitals.email = null
        return res.status(OK).json({
          msg: `Sorted by district!.`,
          data:hospitals,
        });
      }
    }
    else
    {
      return res.status(UNPROCESSABLE_ENTITY).json({msg:"Error retrieving hospitals!"})
    }
  }
  else
  {
    return res.status(UNAUTHORIZED).json({msg:"Un-authorized action!"})
  }
}
};

module.exports.findHospitalByGov = async (req,res) =>{
  const schema = joi
  .object({
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
else
{
  if(req.decodedToken.user.userLevel === 1)
  {
    let hospitals = await findHospitals({governorate: new RegExp('^'+body.governorate+'$', "i")});
    if(hospitals)
    {
      if(Array.isArray(hospitals))
      {
        hospitals.forEach(hospital => {
          hospital.password = null
          hospital.username = null
          hospital.email = null
        });
        return res.status(OK).json({
          msg: `Sorted by governorate!.`,
          data:hospitals,
        });
      }
      else
      {

        hospitals.password = null
        hospitals.username = null
        hospitals.email = null
        return res.status(OK).json({
          msg: `Sorted by governorate!.`,
          data:hospitals,
        });
      }
    }
    else
    {
      return res.status(UNPROCESSABLE_ENTITY).json({msg:"Error retrieving hospitals!"})
    }
  }
  else
  {
    return res.status(UNAUTHORIZED).json({msg:"Un-authorized action!"})
  }
}
};

module.exports.findHospitalByCity = async (req,res) =>{
  const schema = joi
  .object({
    city: joi
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
else
{
  if(req.decodedToken.user.userLevel === 1)
  {
    let hospitals = await findHospitals({city: new RegExp('^'+body.city+'$', "i")});
    if(hospitals)
    {
      if(Array.isArray(hospitals))
      {
        hospitals.forEach(hospital => {
          hospital.password = null
          hospital.username = null
          hospital.email = null
        });
        return res.status(OK).json({
          msg: `Sorted by city!.`,
          data:hospitals,
        });
      }
      else
      {

        hospitals.password = null
        hospitals.username = null
        hospitals.email = null
        return res.status(OK).json({
          msg: `Sorted by city!.`,
          data:hospitals,
        });
      }
    }
    else
    {
      return res.status(UNPROCESSABLE_ENTITY).json({msg:"Error retrieving hospitals!"})
    }
  }
  else
  {
    return res.status(UNAUTHORIZED).json({msg:"Un-authorized action!"})
  }
}
};
module.exports.sortHospitals = async (req,res) =>{
  const schema = joi
  .object({
    sortMethod: joi
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
else
{
  if(req.decodedToken.user.userLevel === 1)
  {
    var sortParams;
    if(body.sortMethod.toLowerCase() === 'icu')
    {
      sortParams = { freeICU : 'asc'};
    }
    if(body.sortMethod.toLowerCase() === 'vent')
    {
      sortParams = { freeVentilators : 'asc'};
    }
    if(body.sortMethod.toLowerCase() === 'beds')
    {
      sortParams = { freeBeds : 'asc'};
    }
    let hospitals = await findHospitalsSorted({},sortParams);
    if(hospitals)
    {
      if(Array.isArray(hospitals))
      {
        hospitals.forEach(hospital => {
          hospital.password = null
          hospital.username = null
          hospital.email = null
        });
        return res.status(OK).json({
          msg: `Sorted By Param.`,
          data:hospitals,
        });
      }
      else
      {

        hospitals.password = null
        hospitals.username = null
        hospitals.email = null
        return res.status(OK).json({
          msg: `Sorted By Param.`,
          data:hospitals,
        });
      }
    }
    else
    {
      return res.status(UNPROCESSABLE_ENTITY).json({msg:"Error retrieving hospitals!"})
    }
  }
  else
  {
    return res.status(UNAUTHORIZED).json({msg:"Un-authorized action!"})
  }
}
};

