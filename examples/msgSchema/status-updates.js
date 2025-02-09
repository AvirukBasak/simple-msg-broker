const Joi = require('joi');

module.exports = function validate (msg) {
  const schema = Joi.object({
    status: Joi.string().valid("online", "offline").required(),
    timestamp: Joi.date().required(),
  });

  return schema.validate(msg);
}