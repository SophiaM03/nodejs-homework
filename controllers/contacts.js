const contacts = require("../models/contacts");
const Joi = require("joi");

const validation = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required(),
  phone: Joi.string().required(),
  favorite: Joi.boolean(),
});

async function addContact(req, res, next) {
  try {
    const { name, email, phone, favorite } = req.body;
    const { error } = validation.validate({ name, email, phone, favorite });
    if (error) {
      return res.status(400).json({
        message: "missing required name field",
      });
    }
    const result = await contacts.create({ name, email, phone, favorite });
    const { _id, ...rest } = result.toObject();
    const map = {
      id: _id,
      ...rest,
    };
    res.status(200).json(map);
  } catch (error) {
    next(error);
  }
}

async function updateById(req, res, next) {
  try {
    const { contactId } = req.params;
    const { name, email, phone, favorite } = req.body;
    const { error } = validation.validate({ name, email, phone, favorite });
    if (error) {
      return res.status(400).json({
        message: "missing fields",
      });
    }
    const result = await contacts
      .findByIdAndUpdate(
        contactId,
        {
          name,
          email,
          phone,
          favorite,
        },
        { new: true }
      )
      .catch((error) => {
        const err = Error(error.message);
        err.code = 400;
        throw err;
      });
    if (result === null) {
      return res.status(404).json({
        message: "Not found",
      });
    }
    const { _id, ...rest } = result.toObject();
    const map = {
      id: _id,
      ...rest,
    };
    res.status(200).json(map);
  } catch (error) {
    next(error);
  }
}

async function removeContact(req, res, next) {
  try {
    const { contactId } = req.params;
    const result = await contacts
      .findByIdAndDelete(contactId)
      .catch((error) => {
        const err = Error(error.message);
        err.code = 400;
        throw err;
      });
    if (result === null) {
      return res.status(404).json({
        message: "Not found",
      });
    }
    res.status(200).json({
      message: "Contact deleted",
    });
  } catch (error) {
    next(error);
  }
}

async function getContacts(req, res, next) {
  try {
    const result = await contacts.find();
    const mapContacts = (contactDocument) => {
      const { _id, ...rest } = contactDocument.toObject();
      const mapContact = {
        id: _id,
        ...rest,
      };
      return mapContact;
    };
    const map = result.map(mapContacts);

    res.status(200).json(map);
  } catch (error) {
    next(error);
  }
}

async function getContactById(req, res, next) {
  try {
    const { contactId } = req.params;
    const result = await contacts.findById(contactId).catch((error) => {
      const err = Error(error.message);
      err.code = 400;
      throw err;
    });
    if (!result) {
      return res.status(404).json({
        message: "Not found",
      });
    }
    const { _id, ...rest } = result.toObject();
    const map = {
      id: _id,
      ...rest,
    };
    res.status(200).json(map);
  } catch (error) {
    next(error);
  }
}

async function updateStatusContact(req, res, next) {
  try {
    const { contactId } = req.params;
    const { favorite } = req.body;

    if (favorite === undefined) {
      return res.status(400).json({
        message: "missing field favorite",
      });
    }
    const result = await contacts.findByIdAndUpdate(
      contactId,
      {
        favorite,
      },
      { new: true }
    );
    if (result === null) {
      return res.status(404).json({
        message: "Not found",
      });
    }
    const { _id, ...rest } = result.toObject();
    const map = {
      id: _id,
      ...rest,
    };

    res.status(200).json(map);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  addContact,
  updateById,
  removeContact,
  getContacts,
  getContactById,
  updateStatusContact,
};
