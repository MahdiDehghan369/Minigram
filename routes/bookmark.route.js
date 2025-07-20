const express = require('express');
const router = express.Router()

const bookmarkCtrl = require('./../controllers/bookmark.ctrl');
const authMiddleware = require('./../middlewares/auth');

const validateBody = require("./../middlewares/validateBody");
const { bookmarkSchema } = require("./../validators/validator");

router
  .route("/")
  .post(
    authMiddleware,
    validateBody(bookmarkSchema),
    bookmarkCtrl.toggleBookmark
  )
  .get(authMiddleware, bookmarkCtrl.getUserBookmarkPosts);

module.exports= router