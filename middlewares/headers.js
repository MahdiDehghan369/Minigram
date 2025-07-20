const setHeaders = (req , res, next) => {
    res.setHeader("Access-Control-Allow-Origin" , "*")
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type , Authorization"
    );
    res.setHeader(
      "Access-Control-Allow-Methods",
      "POST , GET , PATCH , DELETE , PUT "
    );
    next()
}


module.exports= setHeaders