const { isValidObjectId } = require("mongoose")
const { errorResponse, successResponse } = require("./../utils/responses");

module.exports = (res , type , id) => {
    if(isValidObjectId(id)){
        return true
    }else{
        return errorResponse(res, 422, `${type} ID is not valid :(`);
    }
}