const express = require('express');
const app = new express()
const cookieParser = require('cookie-parser');

const setHeaders = require('./middlewares/headers');
const {errorResponse} = require('./utils/responses');
const errorHandler = require('./middlewares/errorHandler');

const authRouter = require('./routes/auth.route');
const followRouter = require('./routes/follow.route');
const postRouter = require('./routes/post.route');
const userRouter = require('./routes/user.route');
const likeRouter = require('./routes/like.route');
const bookmarkRouter = require('./routes/bookmark.route');



app.use(express.json())
app.use(express.urlencoded({extends: true}))
app.use(setHeaders)
app.use(cookieParser())

app.use(followRouter)
app.use("/auth" , authRouter)
app.use("/post" , postRouter)
app.use("/user", userRouter);
app.use("/likes", likeRouter);
app.use("/bookmark", bookmarkRouter);


app.use((req , res , next) => {
    try {
        console.log(`404 | Path Not Found | ${req.url}`);
        errorResponse(res , 404 , "Path Not Found :(")
    } catch (error) {
        next(error)
    }
})


app.use(errorHandler)


module.exports = app