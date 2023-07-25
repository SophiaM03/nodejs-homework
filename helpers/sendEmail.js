const nodemailer = require("nodemailer");

require("dotenv").config();

const { META_EMAIL, META_PASSWORD } = process.env;

const config = {
  host: "smtp.meta.ua",
  port: 465,
  secure: true,
  auth: {
    user: META_EMAIL,
    pass: META_PASSWORD,
  },
};

const transporter = nodemailer.createTransport(config);

const sendEmail = async (data) => {
  const emailOptions = { ...data, from: META_EMAIL };
  await transporter.sendMail(emailOptions);
  return true;
};

module.exports = {
  sendEmail,
};
