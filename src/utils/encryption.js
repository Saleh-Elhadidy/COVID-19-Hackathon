const bcrypt = require('bcryptjs');
const crypto = require('crypto');

module.exports.hashPassword = password => bcrypt.hash(password, 10);

module.exports.comparePasswordToHash = (candidatePassword, hash) =>
  bcrypt.compare(candidatePassword, hash);

module.exports.genToken = (length, encoding) =>
  new Promise((resolve, reject) => {
    crypto.randomBytes(length, (err, buf) => {
      if (err) {
        return reject(err);
      }
      resolve(buf.toString(encoding));
    });
  });