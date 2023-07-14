const Joi = require("joi");
const { Schema, model } = require("mongoose");
const { handleMongooseError } = require("../helpers/handleMongooseError.js");
const contactSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Set name for contact"],
    },
    email: {
      type: String,
      required: [true, "Set email for contact"],
    },
    phone: {
      type: String,
      required: [true, "Set phone for contact"],
    },
    favorite: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { versionKey: false, timestamps: true }
);

contactSchema.post("save", handleMongooseError);

const requiredField = (fieldName) =>
  Joi.string()
    .required()
    .messages({
      "any.required": `missing required '${fieldName}' field`,
    });

const addSchema = Joi.object({
  name: requiredField("name"),
  email: requiredField("email"),
  phone: requiredField("phone"),
  favorite: Joi.boolean(),
});

const updateSchema = Joi.object({
  name: Joi.string().optional(),
  email: Joi.string().optional(),
  phone: Joi.string().optional(),
  favorite: Joi.boolean().optional(),
})
  .required()
  .messages({
    "object.min": "missing fields",
  })
  .min(1);

const updateStatusSchema = Joi.object({
  favorite: Joi.boolean().required().messages({
    "any.required": "missing field favorite",
  }),
});

const schemas = {
  addSchema,
  updateSchema,
  updateStatusSchema,
};

const contacts = model("Contact", contactSchema);

module.exports = { contacts, schemas };
