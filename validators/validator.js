const yup = require("yup");

const registerSchema = yup.object({
  name: yup.string().required("Name is required"),

  username: yup
    .string()
    .required("Username is required")
    .matches(
      /^[a-zA-Z0-9_]{3,20}$/,
      "Username must be 3-20 characters long and contain only letters, numbers, and underscores"
    ),

  email: yup
    .string()
    .required("Email is required")
    .email("Invalid email format"),

  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),
});

const loginSchema = yup.object({
  username: yup.string().required("Username is required"),

  password: yup.string().required("Password is required"),
});

const emailSchema = yup.object({
  email: yup
    .string()
    .required("Email is required")
    .email("Invalid email format"),
});

const passwordSchema = yup.object({
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),
});

const postSchema = yup.object({
  caption: yup.string().required("caption is required"),
  ispinned: yup.string(),
});

const usernameSchema = yup.object({
  username: yup
    .string()
    .required("Username is required")
    .matches(
      /^[a-zA-Z0-9_]{3,20}$/,
      "Username must be 3-20 characters long and contain only letters, numbers, and underscores"
    ),
});

const nameSchema = yup.object({
  name: yup.string().required("Name is required"),
});

const bioSchema = yup.object({
  bio: yup.string().required("Bio is required"),
});

const likeSchema = yup.object({
  item: yup.string().required("item is required ❌"),

  itemType: yup
    .string()
    .required("itemType is required ❌")
    .oneOf(["post", "comment"], "itemType is not valid ❌"),
});

const bookmarkSchema = yup.object({
  item: yup.string().required("item is required ❌"),
});

const commentSchema = yup.object({
  content: yup.string().required("Content is required ❌"),
});

const getNotifSchema = yup.object({
  type: yup
    .string()
    .oneOf(
      ["like", "dislike", "comment", "reply", "follow", "mention"],
      "Type is not valid ❌"
    ),
    isRead: yup.boolean()
});

module.exports = {
  registerSchema,
  loginSchema,
  emailSchema,
  passwordSchema,
  postSchema,
  usernameSchema,
  nameSchema,
  bioSchema,
  likeSchema,
  bookmarkSchema,
  commentSchema,
  getNotifSchema,
};
