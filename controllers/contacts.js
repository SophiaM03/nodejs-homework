const contacts = require("../models/contacts");
const { HttpError } = require("../helpers/httpError");
const { ctrlWrapper } = require("../helpers/ctrlWrapper");

const addContact = async (req, res) => {
  const { _id: owner } = req.user;
  const result = await contacts.create({ ...req.body, owner });
  res.status(201).json(result);
};

const updateById = async (req, res) => {
  const { id } = req.params;
  const result = await contacts.findByIdAndUpdate(id, req.body, { new: true });
  if (!result) {
    throw HttpError(404, "Not found");
  }
  res.json(result);
};

const removeContact = async (req, res) => {
  const { id } = req.params;
  const result = await contacts.findByIdAndRemove(id);
  if (!result) {
    throw HttpError(404, "Not found");
  }
  res.json({
    message: "Contact deleted",
  });
};

const getContacts = async (req, res) => {
  const { _id: owner } = req.user;
  const { page = 1, limit = 20, favorite } = req.query;
  const skip = (page - 1) * limit;
  const query = { owner };
  if (favorite) {
    query.favorite = favorite;
  }

  const result = await contacts.find(query, "-createdAt -updatedAt", {
    skip,
    limit,
  });
  res.json(result);
};

const getContactById = async (req, res) => {
  const { id } = req.params;
  const result = await contacts.findById(id);
  if (!result) {
    throw HttpError(404, "Not found");
  }
  res.json(result);
};

const updateStatusContact = async (req, res) => {
  const { id } = req.params;
  const result = await contacts.findByIdAndUpdate(id, req.body, { new: true });
  if (!result) {
    throw HttpError(404, "Not found");
  }
  res.json(result);
};

module.exports = {
  addContact: ctrlWrapper(addContact),
  updateById: ctrlWrapper(updateById),
  removeContact: ctrlWrapper(removeContact),
  getContacts: ctrlWrapper(getContacts),
  getContactById: ctrlWrapper(getContactById),
  updateStatusContact: ctrlWrapper(updateStatusContact),
};
