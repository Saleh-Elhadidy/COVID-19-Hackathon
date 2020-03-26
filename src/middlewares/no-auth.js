const { FORBIDDEN } = require('http-status');
const {
  extractToken,
  isNotAuthenticated,
} = require('../services/auth.service');

module.exports = async (req, res, next) => {
  const token = extractToken(req.headers.authorization);
  try {
    await isNotAuthenticated(token);
    next();
  } catch (err) {
    next({
      statusCode: FORBIDDEN,
      msg: 'You are already authenticated',
    });
  }
};