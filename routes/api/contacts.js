const express = require("express");
const contactController = require("../../controllers/contacts");
const router = express.Router();

router.get("/", contactController.getContacts);
router.get("/:contactId", contactController.getContactById);
router.post("/", contactController.addContact);
router.delete("/:contactId", contactController.removeContact);
router.put("/:contactId", contactController.updateById);
router.patch("/:contactId/favorite", contactController.updateStatusContact);

module.exports = router;
