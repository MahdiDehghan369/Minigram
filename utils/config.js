require('dotenv').config();

const config = {
      auth: {
        secretKey: process.env.JWT_SECRET,
        accessTokenExpire: process.env.JWT_ACCESS_TOKEN_EXPIRE,
        refreshTokenExpire: process.env.JWT_REFRESH_TOKEN_EXPIRE,
      },
      port: process.env.PORT,
      nodemailer: {
        username: process.env.NODEMAILER_USERNAME,
        password: process.env.NODEMAILER_PASSWORD,
      },
      mongodb: {
        url: process.env.MONGODB_URI,
      },
}

module.exports = config


