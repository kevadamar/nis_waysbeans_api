const joi = require('joi');

exports.checkoutSchema = joi.object({
  name: joi.string().required(),
  email: joi.string().required(),
  address: joi.string().min(5).required(),
  possCode: joi.string().required(),
  phone: joi.string().required(),
  products: joi.array().required(),
});
