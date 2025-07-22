const { errorResponse } = require("../utils/responses");

module.exports = (validator) => {
  return async (req, res, next) => {
    try {
      await validator.validate(req.query);
      next();
    } catch (error) {
      return errorResponse(res, 400, error.message);
    }
  };
};
