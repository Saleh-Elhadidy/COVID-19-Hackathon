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
signJWTHospital,
encryptPassword,
} = require('../services/auth.service');

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
  let hospital = await findHospital({
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
  }
  else
  {
    return res.status(UNAUTHORIZED).json({msg:"Wrong data entered!"});
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
    let hospitals = await findHospital({district: new RegExp('^'+body.district+'$', "i")});
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
    let hospitals = await findHospital({governorate: new RegExp('^'+body.governorate+'$', "i")});
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