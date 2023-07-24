const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Jimp = require("jimp");
const gravatar = require("gravatar");
const path = require("path");
const fs = require("fs/promises");
const { nanoid } = require("nanoid");
const Joi = require("joi");

const { User } = require("../models/user");

const { HttpError } = require("../helpers/httpError");
const { ctrlWrapper } = require("../helpers/ctrlWrapper");
const { sendEmail } = require("../helpers/sendEmail");

const { SECRET_KEY } = process.env;
const avatarsDir = path.join(__dirname, "public", "avatars");
const addSchema = Joi.object({
  email: Joi.string().required(),
});

const register = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    throw HttpError(409, "Email already in use");
  }

  const hashPassword = await bcryptjs.hash(password, 10);
  const avatarURL = gravatar.url(email);
  const verificationToken = nanoid();

  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
    avatarURL,
    verificationToken,
  });
  const varifyEmail = {
    to: email,
    subject: "Verify email",
    html: `<a target="_blank" href="${BASE_URL}/api/auth/verify/${verificationToken}">Click verify email</a>`,
  };

  await sendEmail(varifyEmail);

  res.status(201).json({
    email: newUser.email,
    subscription: newUser.subscription,
  });
};

const verifyEmail = async (req, res) => {
  const { verificationToken } = req.params;
  const user = await UserModel.findOne({ verificationToken });

  if (!user) {
    throw HttpError(404, "User not found");
  }
  await UserModel.findByIdAndUpdate(user._id, {
    verify: true,
    verificationToken: "",
  });

  res.json({
    message: "Email verify success",
  });
};

const resendVerifyEmail = async (req, res) => {
  const { email } = req.body;
  const user = await UserModel.findOne({ email });

  const { error } = addSchema.validate({ email });
  if (error) {
    return res.status(400).json(error.message);
  }

  if (!user) {
    throw HttpError(401, "User not found");
  }
  if (user.verify) {
    throw HttpError(400, "Verification has already been passed");
  }

  const verifyEmail = {
    to: email,
    subject: "Verify email",
    html: `<a target='_blank' href='${BASE_URL}/api/auth/verify/${user.verificationToken}'>Click verify email</a>`,
  };

  await sendEmail(verifyEmail);

  res.json({
    message: "Verification has already been passed",
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(401, "Email or password invalid");
  }

  if (!user.verify) {
    throw HttpError(401, "Email not verify!");
  }

  const passwordCompare = await bcryptjs.compare(password, user.password);
  if (!passwordCompare) {
    throw HttpError(401, "Email or password invalid");
  }

  const payload = {
    id: user._id,
  };

  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });
  await User.findByIdAndUpdate(user._id, { token });
  res.json({ token });
};

const logout = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: "" });

  res.status(201).json({ message: "Logout success" });
};

const current = async (req, res) => {
  const { email, subscription } = req.user;
  res.status(200).json({ email, subscription });
};

const updateSubscriptionUser = async (req, res) => {
  const { subscription } = req.body;
  const { _id } = req.user;
  const updatedUser = await User.findByIdAndUpdate(
    _id,
    { subscription },
    { new: true }
  );

  res.json({
    subscription: updatedUser.subscription,
    email: updatedUser.email,
  });
};
const updateAvatar = async (req, res, next) => {
  if (!req.file) {
    throw HttpError(400, "No file uploaded");
  }
  const { path: temporaryName, originalname } = req.file;
  const { _id } = req.user;
  const filename = `${_id}_${originalname}`;
  const targetFileName = path.join(avatarsDir, filename);
  await fs.rename(temporaryName, targetFileName);

  const image = await Jimp.read(targetFileName);
  image.resize(250, 250).write(targetFileName);

  const avatarURL = path.join("avatars", filename);
  const updatedUser = await User.findByIdAndUpdate(
    _id,
    { avatarURL },
    { new: true }
  );

  res.json({
    avatarURL: updatedUser.avatarURL,
  });
};

module.exports = {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  logout: ctrlWrapper(logout),
  current: ctrlWrapper(current),
  updateSubscriptionUser: ctrlWrapper(updateSubscriptionUser),
  updateAvatar: ctrlWrapper(updateAvatar),
  verifyEmail: ctrlWrapper(verifyEmail),
  resendVerifyEmail: ctrlWrapper(resendVerifyEmail),
};
