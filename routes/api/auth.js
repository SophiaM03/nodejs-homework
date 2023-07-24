const express = require("express");
const { validateBody } = require("../../middlewares/validateBody");
const { schemas } = require("../../models/user");
const { authenticate } = require("../../middlewares/authenticate");
const { upload } = require("../../middlewares/upload");
const ctrl = require("../../controllers/auth");
const router = express.Router();

router.patch(
  "/",
  authenticate,
  validateBody(schemas.updateSubscriptionSchema),
  ctrl.updateSubscriptionUser
);

router.post("/register", validateBody(schemas.registerSchema), ctrl.register);
router.get("/verify/:verificationToken", ctrl.verifyEmail);
router.post(
  "/verify",
  validateBody(schemas.emailSchema),
  ctrl.resendVerifyEmail
);
router.post("/login", validateBody(schemas.loginSchema), ctrl.login);
router.post("/logout", authenticate, ctrl.logout);
router.get("/current", authenticate, ctrl.current);
router.patch(
  "/avatars",
  authenticate,
  upload.single("avatar"),
  ctrl.updateAvatar
);

module.exports = router;
