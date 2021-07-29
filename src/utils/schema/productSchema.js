const joi = require('joi');

exports.addProductSchema = joi.object({
  name: joi.string().required(),
  price: joi.number().required(),
  description: joi.string().required(),
  stock: joi.string().required(),
});

exports.updateProductSchema = joi.object({
  name: joi.string(),
  price: joi.number(),
  description: joi.string(),
  stock: joi.string(),
});
