const jwt = require('jsonwebtoken');

exports.sign = function jwtSign(payload) {
  return jwt.sign(payload, process.env.AUTH_STRING, { algorithm: 'HS384' });
};

exports.verify = function verify(token) {
  return jwt.verify(token, process.env.AUTH_STRING, { algorithm: 'HS384' });
};
