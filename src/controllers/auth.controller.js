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
} = require('../services/user.service');
const {
  checkForCorrectPassword,
  signJWT,
  encryptPassword,
} = require('../services/auth.service');



module.exports.register = async (req, res) => {
  const schema = joi
    .object({
      fullName: joi
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
      username: joi
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
  let user = await findUser({
    $or: [
      {
        username: body.username
      },
    ],
  });
  if (user) {
    return res.status(CONFLICT).json({
      msg: 'Username or Email or Phone already taken, please choose another.',
    });
  }
  Object.assign(
    body,
    { password: await encryptPassword(body.password),
      email: body.email},
  );
  user = await createUser(body);
  if(user){
    return res.status(CREATED).json({
        msg: `Welcome, ${user.username}, your registration was successful.`,
      });
  }
  else
  {
    return res.status(UNAUTHORIZED).json({ msg: 'Wrong data enterd.' });
  }

};

module.exports.login = async (req, res) => {
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
  console.log(req.body.rememberMe);
  console.log(typeof req.body.rememberMe);
  const { error, value: body } = schema.validate(req.body);
  if (error) {
    console.log(error.details[0].message);
    return res.status(UNPROCESSABLE_ENTITY).json({
      msg: error.details[0].message,
    });
  }
  let user = await findUser({
    $or: [
      {
        username: body.username,
      },
      {
        email: body.username,
      },
    ],
  },false);
  if (!user) {
    return res.status(NOT_FOUND).json({ msg: 'Account not found.' });
  }
  const passwordMatches = await checkForCorrectPassword(
    body.password,
    user.password,
  );
  if (!passwordMatches) {
    return res.status(UNAUTHORIZED).json({ msg: 'Wrong data enterd.' });
  }
    const token = await signJWT(user, body.rememberMe);
    console.log(user.username);
    res.status(OK).json({
      msg: `Welcome, ${user.username}.`,
      data: token,
    });


};