const householdexpensesService = require('../services/Householdexpenses.service')
const Joi = require('joi');


//Create Validators
const CreateSchema = Joi.object({
    expenses_type: Joi.string().required(),               // STRING type
    amount_per_month: Joi.number().precision(2).required(),  // FLOAT type with 2 decimal precision
    finan_capital_id: Joi.number().integer().required()   // INTEGER type
  });
  

//Update Validators
const UpdateSchema = Joi.object({
    expenses_type: Joi.string().required().optional(),               
    amount_per_month: Joi.number().precision(2).required().optional(), 
    finan_capital_id: Joi.number().integer().required().optional(),  
});


const  HouseholdexpensesList = async (req, res) => {
    await householdexpensesService.get()
        .then(data => {
            res.send({
                data: data,
                msg: "success",
                status: 200
            });
        })
        .catch(err => {
            res.send({
                data: null,
                msg: "error",
                status: 500,
                err: err
            });
        });
}

const findOneHouseholdexpenses= async (req, res) => {
    await householdexpensesService.findOneById(req.params.id)
        .then(data => {
            res.send({
                data: data,
                msg: "success",
                status: 200,
                err: ''
            });
        })
        .catch(err => {
            res.send({
                data: null,
                msg: "error",
                status: 500,
                err: err
            });
        });
}


const createHouseholdexpenses = async (req, res) => {

    // Validate request body
const { error, value } = CreateSchema.validate(req.body);

if (error) {
    return res.status(400).send({
        msg: "Validation error",
        error: error.details
    });
}
   const householdexpensesObj ={
    expenses_type: value.expenses_type,
    amount_per_month:value.amount_per_month,
    finan_capital_id:value.finan_capital_id
   };
   await householdexpensesService.create(householdexpensesObj)
   .then(data => {
       res.send({
           data: data,
           msg:"success",
           status: 200,
           err:''
       })
   })
   .catch(err => {
       res.send({
           data:null,
           msg:"error",
           status:500,
           err:err
       });
   });
}

const updateHouseholdexpenses = async (req, res) => {

    const id = req.params.id

    // Validate request body
    const { error, value } = UpdateSchema.validate(req.body);

 if (error) {
     return res.status(400).send({
         msg: "Validation error",
         error: error.details
     });
 }
    const householdexpensesObj ={
        expenses_type: value.expenses_type,
        amount_per_month:value.amount_per_month,
        finan_capital_id:value.finan_capital_id
    };
    await householdexpensesService.update(householdexpensesObj,id)
    .then(data => {
        res.send({
            data: data,
            msg: "Update success",
            status: 200,
            err: '',
        });
    })
    .catch(err => {
        res.send({
            data: null,
            msg: "error",
            status: 500,
            err: err
        });
    });
}


const deleteHouseholdexpenses= async (req, res) => {
    await householdexpensesService.deleted(req.params.id)
    .then(data => {
        res.send({
            data:data,
            msg:"success",
            status: 200,
            err: ''
        })
    })
    .catch(err =>{
        res.send({
            data: null,
            msg: "error",
            status: 500,
            err: err
        })
    })
}


module.exports = {
    HouseholdexpensesList,
    findOneHouseholdexpenses,
    createHouseholdexpenses,
    updateHouseholdexpenses,
    deleteHouseholdexpenses,
};

