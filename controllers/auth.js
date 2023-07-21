const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Jimp = require("jimp");
const gravatar = require("gravatar");
const path = require("path");
const fs = require("fs/promises");

const { User } = require("../models/user");

const { HttpError } = require("../helpers/httpError");
const { ctrlWrapper } = require("../helpers/ctrlWrapper");

const { SECRET_KEY } = process.env;
const avatarsDir = path.join(__dirname, "public", "avatars");

const register = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    throw errorHandler(409, "Email already in use");
  }

  const hashPassword = await bcryptjs.hash(password, 10);
  const avatarURL = gravatar.url(email);

  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
    avatarURL,
  });

  res.status(201).json({
    email: newUser.email,
    subscription: newUser.subscription,
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(401, "Email or password is wrong");
  }
  const passwordCompare = await bcryptjs.compare(password, user.password);
  if (!passwordCompare) {
    throw HttpError(401, "Email or password is wrong");
  }
  const payload = {
    id: user.id,
  };
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "48h" });
  await User.findByIdAndUpdate(user._id, { token });
  res.json({
    token,
    user: {
      email: user.email,
      subscription: user.subscription,
    },
  });
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
  const targetFileName = path.join(storeAvatars, filename);
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
};
