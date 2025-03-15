const Joi = require('joi')

const createUserSchema = Joi.object({
    email: Joi.string().required(),
    username: Joi.string().required(),
    password: Joi.string().required(),
    phone: Joi.string().required(),
    title: Joi.string().required(),
    fname: Joi.string().required(),
    lname: Joi.string().required(),
    role: Joi.string().allow('').optional(),
    status: Joi.string().required(),
})

const loginSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
})

const updateUserSchema = Joi.object({
    email: Joi.string().optional(),
    username: Joi.string().optional(),
    password: Joi.string().allow('').optional(),
    phone: Joi.string().optional(),
    title: Joi.string().optional(),
    fname: Joi.string().optional(),
    lname: Joi.string().optional(),
})

module.exports = {createUserSchema,updateUserSchema,loginSchema}