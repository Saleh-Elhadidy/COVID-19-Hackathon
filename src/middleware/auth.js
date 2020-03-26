const { UNAUTHORIZED } = require('http-status');

const { extractToken, isAuthenticated } = require('../services/auth.service');

module.exports = async (req, res, next) => {
  const token = extractToken(req.headers.authorization);
  try {
    const decodedToken = await isAuthenticated(token);
    req.decodedToken = decodedToken;
    next();
  } catch (err) {
    next({
      statusCode: UNAUTHORIZED,
      msg: 'Token Error',
    });
  }
};