const express = require("express");
const { validateBody } = require("../../middlewares/validateBody");
const { schemas } = require("../../models/user");
const { authenticate } = require("../../middlewares/authenticate");
const ctrl = require("../../controllers/auth");
const router = express.Router();

router.patch(
  "/",
  authenticate,
  validateBody(schemas.updateSubscriptionSchema),
  ctrl.updateSubscriptionUser
);
router.post("/register", validateBody(schemas.authSchema), ctrl.register);
router.post("/login", validateBody(schemas.authSchema), ctrl.login);
router.post("/logout", authenticate, ctrl.logout);
router.get("/current", authenticate, ctrl.current);

module.exports = router;
