const jwt = require('jsonwebtoken');
const config = require('./config');

const accessToken = (userId) => {
    const token = jwt.sign({ id: userId }, config.auth.secretKey, {
      expiresIn: `${config.auth.accessTokenExpire}s`,
    });

    return token
}

const refreshToken = (userId) => {
  const token = jwt.sign({ id: userId }, config.auth.secretKey, {
    expiresIn: `${config.auth.refreshTokenExpire}d`,
  });

  return token;
};


module.exports = {
    accessToken,
    refreshToken
}