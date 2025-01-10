const Joi = require('joi')

const createSchema = Joi.object({
    agv_income: Joi.number().required(),
    inflation: Joi.number().required(),
    member_house_id: Joi.number().required()
})

const updateSchema = Joi.object({
    agv_income: Joi.number().optional(),
    inflation: Joi.number().optional(),
    member_house_id: Joi.number().optional()
})

module.exports = {
    createSchema,
    updateSchema
}