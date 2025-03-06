const db = require('../models');
const agi_financial_model = db.AGIFinancial;
const Joi = require('joi');

const createSchema = Joi.object({
    type: Joi.string().required(),
    amount_per_year: Joi.number().required(),
    finan_capital_id:Joi.number().required(),
    // Test
})


const create = async(req,res)=>{
    try{
        const {error,value} = createSchema.validate(req.body)

        if(error){
            return res.status(400).send({
                message:'Validation error',
                error:error.details
            })
        }

        const result = await agi_financial_model.create(value)

        return res.status(200).send({message:'success',result})

    }catch(err){
        return res.status(500).send({message:'Sever error',error:err.message})
    }
}

const list = async(req,res)=>{
    try{
        const results = await agi_financial_model.findAll()

        return res.status(200).send({message:'success',results:results})

    }catch(err){
        return res.status(500).send({message:'Sever error',error:err.message})
    }
}

module.exports ={
    create,
    list
}