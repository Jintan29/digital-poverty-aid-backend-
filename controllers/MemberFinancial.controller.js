const db = require("../models");
const member_finan_model = db.MemberFinancial;
const avg_mem_income = db.AvgMemberIncome;
const admin_log_model = db.AdminLog
const { Op } = require("sequelize");
const {
  createSchema,
  updateSchema,
} = require("../validators/MemberFinancial/member.financial.validator");

//test
// const { SimpleLinearRegression } = require("ml-regression");

const list = async (req, res) => {
  try {
    const results = await member_finan_model.findAll();
    return res.status(200).send({ message: "success", results });
  } catch (errors) {
    return res
      .status(500)
      .send({ message: "Sever errors", errors: errors.message });
  }
};

const create = async (req, res) => {
  try {
    const { error, value } = createSchema.validate(req.body);

    if (error) {
      return res
        .status(400)
        .send({ message: "validation erro", error: error.details });
    }

    const user_id = req.user.id;

    const result = await member_finan_model.create({
      agv_income: value.agv_income,
      avg_expenses: value.avg_expenses,
      inflation: value.inflation,
      member_house_id: value.member_house_id,
      editBy: user_id,
    });

      const logData = {
        user_id,
        action: "create MemberFinancial",
        table_name: "MemberFinancial",
        record_id: result.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const log = await admin_log_model.create(logData)


    return res.status(200).send({ message: "success", result: result,log });
  } catch (errors) {
    return res
      .status(500)
      .send({ message: "Sever error", errors: errors.message });
  }
};

const getLastFinancial = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await member_finan_model.findOne({
      where: { member_house_id: id },
      order: [["createdAt", "DESC"]],
    });

    if (!result) {
      return res.status(400).send({ message: "ไม่พบข้อมูล" });
    }
    return res.status(200).send({ message: "success", result: result });
  } catch (err) {
    return res.status(500).send({ message: "Sever error", error: err.message });
  }
};

const predict = async (req, res) => {
  const ML = require("ml-regression");
  const SLR = ML.SLR; // Simple Linear Regression

  try {
    const { id } = req.params;
    const { district } = req.query; //อำเภอ

    //ดึงข้อมูลของอำเภอนึงย้อนหลัง 4 ปี ตามอำเภอที่ส่งมา
    const data = await avg_mem_income.findAll({
      where: {
        district_name: district,
        createdAt: {
          [Op.gte]: new Date("2021-01-01"),
          [Op.lte]: new Date("2024-12-31"),
        },
      },
      order: [["createdAt", "ASC"]],
    });
    //แปลงค่าเป็น Arr
    const year = data.map((item) => item.createdAt.getFullYear());
    const value = data.map((item) => item.amount);

    //ดึงข้อมูลfinancial ของ member ไปต่อท้าย value เพื่อเอาไว้เทรน
    const financial = await member_finan_model.findAll({
      where: {
        member_house_id: id,
      },
    });

    if (!financial) {
      return res.status(404).send({ message: "ไม่พบข้อมูลสมาชิก" });
    }

    financial.forEach((item) => {
      value.push(item.agv_income);
      year.push(item.createdAt.getFullYear());
    });

    //ดึงข้อมูลปีล่าสุด +1 ไปพยากรณ์
    const lastYear = Math.max(...year);

    //สร้าง model และ predict ค่า
    const regression = new SLR(year, value);
    const prediction = regression.predict(lastYear + 1);

    return res.status(200).send({
      message: "success",
      results: {
        financial,
        prediction: parseFloat(prediction.toFixed(2)),
      },
    });
  } catch (err) {
    return res.status(500).send({ message: "Sever error", error: err.message });
  }
};

const testLinear = async (req, res) => {
  const ML = require("ml-regression");
  const SLR = ML.SLR; // Simple Linear Regression

  try {
    // สร้าง model
    // const x = [1, 2, 3, 4, 5];
    // const y = [2, 4, 6, 8, 10];
    // const regression = new SimpleLinearRegression(x, y);

    // const predict_val = regression.predict(6) //12

    // เทสข้อมูลจริง
    const X = [64, 65, 66, 67]; //ปีของวัดโบส
    const Y = [519.22, 739.29, 1518.5, 999.63];

    //สร้าง model
    const regression = new SLR(X, Y);
    const prediction = regression.predict(68);

    return res.status(200).send({ message: "success", predict: prediction });
  } catch (err) {
    return res.status(500).send({ message: "Sever error", error: err.message });
  }
};

module.exports = {
  create,
  list,
  getLastFinancial,
  testLinear,
  predict,
};
