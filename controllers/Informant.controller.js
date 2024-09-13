const informantService = require('../services/Informant.service')
const Joi = require('joi');

//Create Validators
const CreateInformantSchema = Joi.object({
    fname: Joi.string().required(),
    lname: Joi.string().required(),
    title: Joi.string().required(),
    national_id: Joi.string().length(13).required(), 
    phone: Joi.string().pattern(/^\d{10}$/).required(),
    address:Joi.string().required(),
    number_total_fam: Joi.number().integer().required(),  
    total_live_fam: Joi.number().integer().required(),    
    total_not_live_fam: Joi.number().integer().required(),
    formId: Joi.number().integer().optional()
});


//Update Validators
const UpdateInformantSchema = Joi.object({
    fname: Joi.string().required(),
    lname: Joi.string().required(),
    title: Joi.string().required(),
    national_id: Joi.string().length(13).required(), 
    phone: Joi.string().pattern(/^\d{10}$/).required(),
    address:Joi.string().required(),
    number_total_fam: Joi.number().integer().required(),  
    total_live_fam: Joi.number().integer().required(),    
    total_not_live_fam: Joi.number().integer().required(),
    formId: Joi.number().integer().optional()
});



const informantList = async (req, res) => {
    await informantService.getInformant()
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
const findOneinformant = async (req, res) => {
    await informantService.findOneById(req.params.id)
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

const createinformant = async (req, res) => {

     // Validate request body
 const { error, value } = CreateInformantSchema.validate(req.body);

 if (error) {
     return res.status(400).send({
         msg: "Validation error",
         error: error.details
     });
 }
    const informantObj ={
        fname: value.fname,
        lname: value.lname,
        title: value.title,
        national_id: value.national_id,
        phone: value.phone,
        address: value.address,
        number_total_fam: value.number_total_fam,
        total_live_fam: value.total_live_fam,
        total_not_live_fam: value.total_not_live_fam,
        formId: value.formId
    };
    await informantService.create(informantObj)
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


const updateinformant  = async (req, res) => {

    const id = req.params.id

    // Validate request body
    const { error, value } = UpdateInformantSchema.validate(req.body);

 if (error) {
     return res.status(400).send({
         msg: "Validation error",
         error: error.details
     });
 }
    const informantObj ={
        fname: value.fname,
        lname: value.lname,
        title: value.title,
        national_id: value.national_id,
        phone: value.phone,
        address: value.address,
        number_total_fam: value.number_total_fam,
        total_live_fam: value.total_live_fam,
        total_not_live_fam: value.total_not_live_fam,
        formId: value.formId
    };
    await informantService.update(informantObj,id)
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


const deleteinformant= async (req, res) => {
    await informantService.deleted(req.params.id)
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
    informantList,
    findOneinformant,
    createinformant,
    updateinformant,
    deleteinformant
};
