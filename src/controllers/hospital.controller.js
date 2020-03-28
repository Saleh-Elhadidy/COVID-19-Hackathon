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
  findHospitalAndRemove,
  findAllHospitals,
  findHospitalById,
  findUpdates,
  createUpdate,
  findAllUpdates,
} = require('../services/hospital.service');
const{
createRequest,
findAllRequests,
findRequestById
} = require('../services/request.service');
const {
checkForCorrectPassword,
signJWT,
signJWTHospital,
encryptPassword,
} = require('../services/auth.service');
const Hospital = require('../models/hospital.model');
const Request = require('../models/request.model');

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
      totalBeds: joi
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
    return res.status(UNAUTHORIZED).json({msg:"User not found!"});

  }
}

module.exports.insertUpdates = async (req, res) => {
  if(req.decodedToken.hospital!=null && req.decodedToken.hospital!=undefined )
  {    
    if(req.params.hospitalId == req.decodedToken.hospital._id){
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
        covidPatients: joi
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
        hospital.freeVentilators =  body.freeVentilators;
        hospital.freeICU =  body.freeICU;
        hospital.freeBeds =  body.freeBeds;
        hospital.covidPatients = body.covidPatients;
        hospital.save(async function (err) {
          if (err) {
              return res.status(UNPROCESSABLE_ENTITY).json({
                msg: err,
              });
            }else{
              let update = 
              {
                hospitalName: hospital.hospitalName,
                hospitalId: hospital._id,
                freeVentilators: body.freeVentilators,
                freeICU: body.freeICU,
                freeBeds: body.freeBeds,
                covidPatients: body.covidPatients
              }
              let duplicate = await findUpdates({ hospitalId:hospital._id , createdAt:  { $gt: new Date(Date.now() - 6*60*60 * 1000) }  })
              if(duplicate)
              {
                return res.status(OK).json({
                  msg: 'hospital edited only successfully',
                  data: hospital,
                });
              }
              else
              {
                let createdUpdate = await createUpdate(update);
                if(createdUpdate)
                {
                  return res.status(OK).json({
                    msg: 'hospital edited AND UPDATED successfully',
                    data: hospital,
                  });
                }
                else
                {
                  return res.status(OK).json({
                    msg: 'hospital edited but failed to update',
                  });
                }
              }

            }
        });
  
    }
    });
    }
    else
    {
      return res.status(UNAUTHORIZED).send({
        msg: 'Un-Authorized error'
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
module.exports.requestSupplies = async (req, res) => {
  if(req.decodedToken.hospital!=null && req.decodedToken.hospital!=undefined )
    {      
  
      if(req.params.hospitalId == req.decodedToken.hospital._id){
        const schema = joi
        .object({
          need: joi
            .string()
            .required()
            .trim(),
            quantity: joi
            .number()
            .required()
            .min(0),
            available: joi
            .number()
            .required()
            .min(0),
            priority: joi
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
          hospital.password=null;
          hospital.username=null;
          hospital.email=null;
           
           let request = {need: body.need, quantity:body.quantity, available:body.available, hospital:hospital,handled:body.handled, hospitalName:hospital.hospitalName}
                let createdRequest =  createRequest(request);
                if(createdRequest)
                {
                  return res.status(OK).json({
                    msg: 'request created successfully',
                    data: request,
                  });
                }
                else
                {
                  return res.status(OK).json({
                    msg: 'failed to create request',
                  });
                }
        }
      })

      }
    }


}

module.exports.getAllRequests = async (req, res) => {

  let currUserId = req.decodedToken.user._id;
  let currUser = await findUserById(currUserId);
  if(currUser && currUser.userLevel === 1){
      let requests = await findAllRequests();
        if (!requests) {
          return res.status(UNPROCESSABLE_ENTITY).json({
            msg: 'Error finding requests',
          });
        }
            return res.status(OK).json({
              msg: `all requests are retrieved`,
              data:requests,
            });
          
  }
  else
  {
      return res.status(UNAUTHORIZED).json({msg:'Wrong Un-Authorized action .'})
  }
}

module.exports.handleRequest = async (req, res) => {
  const schema = joi
  .object({
    handled: joi
      .boolean()
      .required()
  })
  .options({ stripUnknown: true });
  const { error, value: body } = schema.validate(req.body);
  if (error) {
    console.log(error.details[0].message);
    return res.status(UNPROCESSABLE_ENTITY).json({
      msg: error.details[0].message,
    });
  }

  let currUserId = req.decodedToken.user._id;
  let currUser = await findUserById(currUserId);
  if(currUser && currUser.userLevel === 1){

          
        Request.findById(req.params.requestlId).exec(function (err, request) {
          if (err) {
              return res.status(UNPROCESSABLE_ENTITY).send({
                  msg: 'Error Occured'
                  });
          } else if (!request) {
              return res.status(404).send({
              msg: 'No requests with that identifier has been found'
              });
          }
          else{
           
            request.handled =body.handled;
            
            request.save(async function (err) {
              if (err) {
                  return res.status(UNPROCESSABLE_ENTITY).json({
                    msg: err,
                  });
                }else{
              return res.status(OK).json({
                msg: 'requests is handled by government manager',
                data: request,
              });
            
          }
          })
          }
        })
  }
  else
  {
      return res.status(UNAUTHORIZED).json({msg:'Wrong Un-Authorized action .'})
  }
}


module.exports.getHospitalRequests = async(req,res) => {
let managerialuser = false
let hospitalUser = false
  if(req.decodedToken.user!=null && req.decodedToken.user!=undefined )
    {
   
    managerialuser =true
  }
  if(req.decodedToken.hospital!=null && req.decodedToken.hospital!=undefined )
  {
    hospitalUser =true
  }
  
if(hospitalUser){
    if(( req.params.hospitalId == req.decodedToken.hospital._id)) {


      Request.find({hospital:req.params.hospitalId}).exec(function (err, requests) {
      if (err) {
          return res.status(UNPROCESSABLE_ENTITY).send({
              msg: 'Error Occured'
              });
      } else if (!requests) {
          return res.status(404).send({
          msg: 'No requests with that identifier has been found'
          });
      }
      else{
          return res.status(OK).json({
            msg: 'requests retrieved successfully',
            data: requests,
          });
        
      }
      })

    }
    else
    {
      return res.status(UNAUTHORIZED).send({
        msg: 'Un-Authorized error'
        });
    }
}
else if(managerialuser){
  let currUserId = req.decodedToken.user._id;
  let currUser = await findUserById(currUserId);
  if(currUser && currUser.userLevel === 1){
    Request.find({hospital:req.params.hospitalId}).exec(function (err, requests) {
      if (err) {
          return res.status(UNPROCESSABLE_ENTITY).send({
              msg: 'Error Occured'
              });
      } else if (!requests) {
          return res.status(404).send({
          msg: 'No requests with that identifier has been found'
          });
      }
      else{
          return res.status(OK).json({
            msg: 'requests retrieved successfully',
            data: requests,
          });
        
      }
      })
  }
  else
  {
    return res.status(UNAUTHORIZED).send({
      msg: 'Un-Authorized error'
      });
  }
}
else{
  return res.status(UNAUTHORIZED).send({
    msg: 'Un-Authorized user'
    });
}
}
module.exports.updateRequest= async(req,res) =>{
  let managerialuser = false
  let hospitalUser = false
    if(req.decodedToken.user!=null && req.decodedToken.user!=undefined )
      {
     
      managerialuser =true
    }
    if(req.decodedToken.hospital!=null && req.decodedToken.hospital!=undefined )
    {
      hospitalUser =true
    }
    if(hospitalUser){
      if(( req.params.hospitalId == req.decodedToken.hospital._id)) {
        const schema = joi
        .object({
          need: joi
            .string()
            .trim(),
            quantity: joi
            .number()
            .min(0),
            available: joi
            .number()
            .min(0),
            priority: joi
            .number()
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
        
        let update = {need:body.need, quantity:body.quantity,available:body.available, priority:body.priority}
        Request.findById(req.params.requestlId).exec(function (err, request) {
        if (err) {
            return res.status(UNPROCESSABLE_ENTITY).send({
                msg: 'Error Occured'
                });
        } else if (!request) {
            return res.status(404).send({
            msg: 'No requests with that identifier has been found'
            });
        }
        else{
          if(body.need!=null){
            request.need = body.need
          }
          if(body.quantity!=null){
            request.quantity = body.quantity
          }
          if(body.available!=null){
            request.available = body.available
          }
          if(body.priority!=null){
            request.priority = body.priority
          }
          request.save(async function (err) {
            if (err) {
                return res.status(UNPROCESSABLE_ENTITY).json({
                  msg: err,
                });
              }else{
            return res.status(OK).json({
              msg: 'requests updated successfully',
              data: request,
            });
          
        }
        })
      }
    })
  }
  else
  {
    return res.status(UNAUTHORIZED).send({
      msg: 'Un-Authorized error'
      });
  }
    }
    else if(managerialuser){
      let currUserId = req.decodedToken.user._id;
      let currUser = await findUserById(currUserId);
      if(currUser && currUser.userLevel === 1){
        const schema = joi
        .object({
          need: joi
            .string()
            .trim(),
            quantity: joi
            .number()
            .min(0),
            available: joi
            .number()
            .min(0),
            priority: joi
            .number()
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
        
        let update = {need:body.need, quantity:body.quantity,available:body.available, priority:body.priority}
        Request.findById(req.params.requestlId).exec(function (err, request) {
        if (err) {
            return res.status(UNPROCESSABLE_ENTITY).send({
                msg: 'Error Occured'
                });
        } else if (!request) {
            return res.status(404).send({
            msg: 'No requests with that identifier has been found'
            });
        }
        else{
          if(body.need!=null){
            request.need = body.need
          }
          if(body.quantity!=null){
            request.quantity = body.quantity
          }
          if(body.available!=null){
            request.available = body.available
          }
          if(body.priority!=null){
            request.priority = body.priority
          }
          request.save(async function (err) {
            if (err) {
                return res.status(UNPROCESSABLE_ENTITY).json({
                  msg: err,
                });
              }else{
            return res.status(OK).json({
              msg: 'requests updated successfully',
              data: request,
            });
          
        }
        })
      }
    })
  }
  else
  {
    return res.status(UNAUTHORIZED).send({
      msg: 'Un-Authorized error'
      });
  }
    }
    else{ return res.status(UNAUTHORIZED).send({
      msg: 'Un-Authorized user'
      });}

}
module.exports.deleteRequest= async(req,res) =>{
    
  let managerialuser = false
  let hospitalUser = false
    if(req.decodedToken.user!=null && req.decodedToken.user!=undefined )
      {
     
      managerialuser =true
    }
    if(req.decodedToken.hospital!=null && req.decodedToken.hospital!=undefined )
    {
      hospitalUser =true
    }

    if(hospitalUser){
      if( req.params.hospitalId == req.decodedToken.hospital._id) {

        Request.findById(req.params.requestlId).exec(function (err, request) {
          if (err) {
              return res.status(UNPROCESSABLE_ENTITY).send({
                  msg: 'Error Occured'
                  });
          } else if (!request) {
              return res.status(404).send({
              msg: 'No requests with that identifier has been found'
              });
          }
          else{
            let deleted =  request.remove();
            console.log(deleted);
            if(deleted)
            {
              return res.status(OK).json({msg:"request Deleted by hospital moderator!"})
            }
            else
            {
              return res.status(UNPROCESSABLE_ENTITY).json({msg:"Error deleting hospital!"})
            }
          }
        })

      }
      else{
        return res.status(UNAUTHORIZED).send({
          msg: 'Un-Authorized error'
          });
      }
    }
    else if(managerialuser){
      let currUserId = req.decodedToken.user._id;
      let currUser = await findUserById(currUserId);
      if(currUser && currUser.userLevel === 1){

        Request.findById(req.params.requestlId).exec(function (err, request) {
          if (err) {
              return res.status(UNPROCESSABLE_ENTITY).send({
                  msg: 'Error Occured'
                  });
          } else if (!request) {
              return res.status(404).send({
              msg: 'No requests with that identifier has been found'
              });
          }
          else{
            let deleted =  request.remove();
            console.log(deleted);
            if(deleted)
            {
              return res.status(OK).json({msg:"request Deleted by manager moderator!"})
            }
            else
            {
              return res.status(UNPROCESSABLE_ENTITY).json({msg:"Error deleting hospital!"})
            }
          }
        })
      }
      else{
        return res.status(UNAUTHORIZED).send({
          msg: 'Un-Authorized error'
          });
      }
    }
    else{
      return res.status(UNAUTHORIZED).send({
        msg: 'Un-Authorized error'
        });
    }

}
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
    if(body.sortMethod.toLowerCase() === 'covid')
    {
      sortParams = { covidPatients : 'desc'};
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

module.exports.deleteHospital = async (req,res) =>{
  if(req.decodedToken.user.userLevel === 1 && req.params.hospitalId)
  {
    let hospital = await findHospitalById(req.params.hospitalId);
    let deleted = await hospital.remove();
    console.log(deleted);
    if(deleted)
    {
      return res.status(OK).json({msg:"Deleted!"})
    }
    else
    {
      return res.status(UNPROCESSABLE_ENTITY).json({msg:"Error deleting hospital!"})
    }

    
  }
  else
  {
    return res.status(UNAUTHORIZED).json({msg:"Un-authorized action!"})
  }

};
module.exports.getUpdates = async (req,res) =>{
  if(req.decodedToken.user.userLevel === 1)
  {
    let updates = await findAllUpdates();
    if(updates)
    {
      return res.status(OK).json({msg:"Found updates!",data:updates})
    }
    else
    {
      return res.status(UNPROCESSABLE_ENTITY).json({msg:"Error finding updates!"})
    }
  }
  else
  {
    return res.status(UNAUTHORIZED).json({msg:"Un-authorized action!"})
  }

};



