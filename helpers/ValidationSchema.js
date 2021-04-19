const Joi = require('@hapi/joi');

const characterString = '♿';

const authSchema = Joi.object().keys({
    email: Joi.string().email().lowercase().min(6).required(),
    password: Joi.string().min(4).required()
});

module.exports = {
    authSchema
};