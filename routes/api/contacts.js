const express = require("express");
const contactController = require("../../controllers/contacts");
const router = express.Router();
const { authenticate } = require("../../middlewares/authenticate");

router.get("/", authenticate, contactController.getContacts);
router.get("/:contactId", authenticate, contactController.getContactById);
router.post("/", authenticate, contactController.addContact);
router.delete("/:contactId", authenticate, contactController.removeContact);
router.put("/:contactId", authenticate, contactController.updateById);
router.patch(
  "/:contactId/favorite",
  authenticate,
  contactController.updateStatusContact
);

module.exports = router;
