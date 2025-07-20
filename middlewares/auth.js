const config = require("../utils/config");
const { errorResponse } = require("./../utils/responses");
const jwt = require("jsonwebtoken");

module.exports = async(req, res, next) => {
  try {
     const existsToken = req?.headers["authorization"]?.startsWith("Bearer");

     if (!existsToken) {
       return errorResponse(res, 422, "Token is missing");
     }

     const accessToken = req.headers["authorization"].split(" ")[1];

     try {
       const decoded = jwt.verify(accessToken, config.auth.secretKey);
       req.user = decoded;
       next();
     } catch (error) {
       return errorResponse(res, 400, "Token is invalid");
     }
  } catch (error) {
    next(error)
  }
 
};
