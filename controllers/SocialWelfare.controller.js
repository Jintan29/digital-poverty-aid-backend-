const SocialWelfareService = require("../services/SocialWelfare.services");
const db = require("../models");
const socialWelfare_model = db.SocialWelfare;
const member_model = db.MemberHousehold
const household_model = db.Household
const Joi = require("joi");
const logService = require("../services/log.service");

//Create Validators
const CreateSchema = Joi.object({
  welfare: Joi.string().required(),
  amount: Joi.number().required(),
  frequency: Joi.string().required(),
  member_house_id: Joi.number().required(),
});

const CreateSchemaArr = Joi.array().items(
  Joi.object({
    welfare: Joi.string().required(),
    amount: Joi.number().required(),
    frequency: Joi.string().required(),
    member_house_id: Joi.number().required(),
  })
);

//Update Validators
const UpdateSchema = Joi.object({
  welfare: Joi.string().optional(),
  amount: Joi.number().optional(),
  frequency: Joi.string().optional(),
  member_house_id: Joi.number().optional(),
});

const List = async (req, res) => {
  await SocialWelfareService.getAll()
    .then((data) => {
      res.send({
        data: data,
        msg: "success",
        status: 200,
      });
    })
    .catch((err) => {
      res.send({
        data: null,
        msg: "error",
        status: 500,
        err: err,
      });
    });
};
const findOne = async (req, res) => {
  await SocialWelfareService.findOneById(req.params.id)
    .then((data) => {
      res.send({
        data: data,
        msg: "success",
        status: 200,
        err: "",
      });
    })
    .catch((err) => {
      res.send({
        data: null,
        msg: "error",
        status: 500,
        err: err,
      });
    });
};

const create = async (req, res) => {
  try {
    // Validate data from req.body
    const { error, value } = CreateSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      const missingFields = error.details.map((detail) => detail.context.key);
      return res.status(400).send({
        msg: "Validation error",
        missingFields: missingFields,
        error: error.details,
      });
    }

    const welfareObj = {
      welfare: value.welfare,
      amount: value.amount,
      frequency: value.frequency,
      member_house_id: value.member_house_id,
    };

    const data = await SocialWelfareService.create(welfareObj);
    res.status(200).send({
      data: data,
      msg: "success",
      status: 200,
      err: "",
    });
  } catch (err) {
    if (err.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).send({
        data: null,
        msg: "Foreign key constraint error",
        status: 400,
        err: "The specified member_house_id does not exist in the MemberHousehold table.",
      });
    }
    res.status(500).send({
      data: null,
      msg: "error",
      status: 500,
      err: err.message,
    });
  }
};

// [ {}, {}]
// const createArr = async (req, res) => {
//   try {
//     const { error, value } = CreateSchemaArr.validate(req.body);

//     if (error) {
//       return res
//         .status(400)
//         .send({ message: "Validation error", error: error.details });
//     }

//     const user_id = req.user.id
//     //เพิ่มค่าว่าใครบันทึก
//     const dataToCreate = value.map(item=>({
//       ...item,
//       editBy: user_id
//     }))

//     const results = await socialWelfare_model.bulkCreate(dataToCreate);

//     return res.status(200).send({ message: "success", results });
//   } catch (err) {
//     return res.status(500).send({ message: "Sever error", error: err.message });
//   }
// };
const createArr = async (req, res) => {
  try {
    const { error, value } = CreateSchemaArr.validate(req.body);

    if (error) {
      return res
        .status(400)
        .send({ message: "Validation error", error: error.details });
    }

    const user_id = req.user.id;

    // ✅ เพิ่มค่าว่าใครบันทึก
    const dataToCreate = value.map(item => ({
      ...item,
      editBy: user_id
    }));

    // ✅ บันทึกข้อมูลหลายแถว
    const results = await socialWelfare_model.bulkCreate(dataToCreate, {
      returning: true // ให้ Sequelize คืนค่ารายการที่ถูกสร้าง
    });

    //ดึง HC บันทึกลง DB
    const memberId = value[0].member_house_id
    const member = await member_model.findByPk(memberId,
      {
        attributes:['id','houseId'],
        include:[
          {
            model:household_model,
            attributes:['id','house_code']
          }
        ]
      }
    )
    const memberJson = await member.toJSON()
    const hc = memberJson.Household.house_code

    // ✅ บันทึก Log ทีละรายการ
    const logPromises = results.map(record =>
      logService.createLog(user_id, "เพิ่มข้อมูลสวัสดิการสังคมของสมาชิก", "SocialWelfare", record.id,hc)
    );
    await Promise.all(logPromises);

    return res.status(200).send({ message: "success", results });
  } catch (err) {
    return res.status(500).send({ message: "Server error", error: err.message });
  }
};


const update = async (req, res) => {
  const id = req.params.id;

  // Validate ข้อมูลจาก req.body ก่อน
  const { error, value } = UpdateSchema.validate(req.body);

  if (error) {
    return res.status(400).send({
      msg: "Validation error",
      error: error.details,
    });
  }

  const welfareObj = {
    welfare: value.welfare,
    amount: value.amount,
    frequency: value.frequency,
    human_capital_id: value.human_capital_id,
  };

  await SocialWelfareService.update(welfareObj, id)
    .then((data) => {
      res.send({
        data: data,
        msg: "success",
        status: 200,
        err: "",
      });
    })
    .catch((err) => {
      res.send({
        data: null,
        msg: "error",
        status: 500,
        err: err,
      });
    });
};

const deleteCapital = async (req, res) => {
  await SocialWelfareService.deleted(req.params.id)
    .then((data) => {
      res.send({
        data: data,
        msg: "success",
        status: 200,
        err: "",
      });
    })
    .catch((err) => {
      res.send({
        data: null,
        msg: "error",
        status: 500,
        err: err,
      });
    });
};

module.exports = {
  List,
  findOne,
  create,
  update,
  deleteCapital,
  createArr,
};
