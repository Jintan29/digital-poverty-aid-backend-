const houseHoldProblemService = require('../services/houseHoldProblem.service')
const Joi = require('joi');
const {CreatehouseHoldProblemSchema,UpdatehouseHoldProblemSchema} = require('../validators/householdproblem/householdproblem.validator')

const  houseHoldProblemList = async (req, res) => {
    await houseHoldProblemService.gethouseHoldProblem()
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

const findOnehouseHoldProblem= async (req, res) => {
    await houseHoldProblemService.findOneById(req.params.id)
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


const createhouseHoldProblem = async (req, res) => {
    // Validate request body
    const { error, value } = CreatehouseHoldProblemSchema.validate(req.body);

    if (error) {
        return res.status(400).send({
            msg: "Validation error",
            error: error.details
        });
    }

    const houseHoldProblemObj = {
        name_problem: value.name_problem,
        details_problem: value.details_problem,
        type_problem: value.type_problem,
        indicators: value.indicators,
        type_household: value.type_household,
        details_household: value.details_household,
        survey_data: value.survey_data,
        problem_solving: value.problem_solving,
        details_solving: value.details_solving,
        desire: value.desire,
        houseId: value.houseId,
        teamServeyId: value.teamServeyId
    };
    await houseHoldProblemService.create(houseHoldProblemObj)
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


const updatehouseHoldProblem  = async (req, res) => {
    const id = req.params.id;

    // Validate request body
    const { error, value } = UpdatehouseHoldProblemSchema.validate(req.body);

    if (error) {
        return res.status(400).send({
            msg: "Validation error",
            error: error.details
        });
    }

    const houseHoldProblemObj = {
        name_problem: value.name_problem,
        details_problem: value.details_problem,
        type_problem: value.type_problem,
        indicators: value.indicators,
        type_household: value.type_household,
        details_household: value.details_household,
        survey_data: value.survey_data,
        problem_solving: value.problem_solving,
        details_solving: value.details_solving,
        desire: value.desire,
        houseId: value.houseId,
        teamServeyId: value.teamServeyId
    };

    await houseHoldProblemService.update(houseHoldProblemObj, id)
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

const deletehouseHoldProblem= async (req, res) => {
    await houseHoldProblemService.deleted(req.params.id)
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
    houseHoldProblemList,
    findOnehouseHoldProblem,
    createhouseHoldProblem,
    updatehouseHoldProblem,
    deletehouseHoldProblem,

};