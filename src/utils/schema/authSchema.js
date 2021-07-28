const joi = require('joi');

exports.loginSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().min(8).required(),
});
