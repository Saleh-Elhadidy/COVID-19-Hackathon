const { addHours } = require('date-fns');
const jwt = require('jsonwebtoken');
const {
  hashPassword,
  genToken,
  comparePasswordToHash,
} = require('../utils/encryption');
const { isString } = require('../utils/validations');

const { SECRET } = process.env;

module.exports.extractToken = authHeader => {
  if (!isString(authHeader)) {
    return null;
  }
  const headerParts = authHeader.trim().split(' ');
  if (!(headerParts.length === 2 && headerParts[0] === 'Bearer')) {
    console.log(headerParts[0]);
    return null;
  }
  console.log(headerParts[0]);
  return headerParts[1];
};

const verifyToken = token =>
  new Promise((resolve, reject) => {
    jwt.verify(token, SECRET, (err, decodedToken) => {
      if (err) {
        return reject(err);
      }
      resolve(decodedToken);
    });
  });

module.exports.verifyToken = verifyToken;

module.exports.isAuthenticated = token => verifyToken(token);

module.exports.isNotAuthenticated = async token => {
  try {
    await verifyToken(token);
    return Promise.reject();
  } catch (err) {
    return Promise.resolve();
  }
};

module.exports.encryptPassword = hashPassword;

module.exports.genVerificationToken = async () => ({
  verificationToken: await genToken(32, 'hex'),
  verificationTokenExpiry: addHours(new Date(), 24),
});

module.exports.genResetPasswordToken = async () => ({
  resetPasswordToken: await genToken(32, 'hex'),
  resetPasswordTokenExpiry: addHours(new Date(), 24),
});

module.exports.checkForCorrectPassword = (candidatePassword, hash) =>
  comparePasswordToHash(candidatePassword, hash);

module.exports.signJWT = (user, expiresIn) =>
  new Promise((resolve, reject) => {
    console.log(expiresIn)
    console.log(typeof (expiresIn))
    if (!expiresIn) {
      expiresIn = '1d'
    } else {
      expiresIn = '7d'
    }
    jwt.sign(
      {
        user: user.toObject(),
      },
      SECRET,
      {
        expiresIn,
      },
      (err, token) => {
        if (err) {
          return reject(err);
        }
        resolve(token);
      },
    );
  });