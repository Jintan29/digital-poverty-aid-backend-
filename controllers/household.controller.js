const householdService = require("../services/household.services");
const logService = require("../services/log.service");
const db = require("../models");
const household_model = db.Household;
const avg_house_income = db.AvgHouseIncome;
const form_model = db.Form;
const financialcapital_model = db.Financialcapital;
const non_agi_model = db.NonAGIincome;
const agi_financial_model = db.AGIFinancial;
const { Op } = require("sequelize");
const Joi = require("joi");

//Create Validators
const CreateHouseholdSchema = Joi.object({
  house_code: Joi.string().required(),
  host_title: Joi.string().required(),
  host_fname: Joi.string().required(),
  host_lname: Joi.string().required(),
  host_national_id: Joi.string().length(13).required(), // 13 characters validation
  has_greenBook: Joi.boolean().required(),
  green_book_id: Joi.string().optional(),
  postcode: Joi.string().required(),
  subdistrict: Joi.string().required(),
  district: Joi.string().required(),
  province: Joi.string().required(),
  house_number: Joi.string().required(),
  village: Joi.string().optional(),
  alley: Joi.string().optional(),
  road: Joi.string().optional(),
  form_id: Joi.number().optional(),
});

//Update Validators
const UpdateHouseholdSchema = Joi.object({
  house_code: Joi.string().optional(),
  host_title: Joi.string().optional(),
  host_fname: Joi.string().optional(),
  host_lname: Joi.string().optional(),
  host_national_id: Joi.string()
    .pattern(/^\d{13}$/) // Validate as a 13-digit number
    .messages({
      "string.pattern.base": "หมายเลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก",
    })
    .optional(),
  has_greenBook: Joi.boolean().optional(),
  green_book_id: Joi.string()
    .pattern(/^\d{12}$/) // Validate as a 12-digit number
    .when("has_greenBook", {
      is: true,
      then: Joi.required().messages({
        "any.required": "กรุณากรอกหมายเลขสมุดเกษตรเมื่อเลือกมีสมุดเกษตร",
        "string.pattern.base": "หมายเลขสมุดเกษตรต้องเป็นตัวเลข 12 หลัก",
      }),
      otherwise: Joi.allow("").optional(),
    }),
  postcode: Joi.number().integer().optional(),
  subdistrict: Joi.string().optional(),
  district: Joi.string().optional(),
  province: Joi.string().optional(),
  house_number: Joi.string().optional(),
  village: Joi.string().optional(),
  alley: Joi.string().optional(),
  road: Joi.string().optional(),
  form_id: Joi.number().optional(),
});

const List = async (req, res) => {
  try {
    const data = await householdService.getCapital();

    return res.status(200).json({
      data: data,
      msg: "success",
      status: 200,
    });
  } catch (err) {
    console.error("Error in List controller:", err);
    return res.status(500).json({
      data: null,
      msg: "error",
      status: 500,
      error: err.message,
    });
  }
};

const houseList = async (req, res) => {
  await householdService
    .getHouse()
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
const findOneHouse = async (req, res) => {
  await householdService
    .findOneById(req.params.id)
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
  // Validate request body
  const { error, value } = CreateHouseholdSchema.validate(req.body);

  if (error) {
    return res.status(400).send({
      msg: "Validation error",
      error: error.details,
    });
  }
  const houseObj = {
    house_code: value.house_code,
    host_title: value.host_title,
    host_fname: value.host_fname,
    host_lname: value.host_lname,
    host_national_id: value.host_national_id,
    has_greenBook: value.has_greenBook,
    green_book_id: value.green_book_id,
    postcode: value.postcode,
    subdistrict: value.subdistrict,
    district: value.district,
    province: value.province,
    house_number: value.house_number,
    village: value.village,
    alley: value.alley,
    road: value.road,
    form_id: value.form_id,
  };
  await householdService
    .create(houseObj)
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

const updateHouse = async (req, res) => {
  const id = req.params.id;
  const adminId = req.user.id; // ดึง ID ของ admin ที่อัปเดตข้อมูล

  // Validate request body
  const { error, value } = UpdateHouseholdSchema.validate(req.body);

  if (error) {
    return res.status(400).send({
      msg: "Validation error",
      error: error.details,
    });
  }

  const houseObj = {
    house_code: value.house_code,
    host_title: value.host_title,
    host_fname: value.host_fname,
    host_lname: value.host_lname,
    host_national_id: value.host_national_id,
    has_greenBook: value.has_greenBook,
    green_book_id: value.green_book_id,
    postcode: value.postcode,
    subdistrict: value.subdistrict,
    district: value.district,
    province: value.province,
    house_number: value.house_number,
    village: value.village,
    alley: value.alley,
    road: value.road,
    form_id: value.form_id,
    editBy: adminId,
  };

  try {
    const result = await householdService.update(houseObj, id);

    if (result[0] === 1) { // Sequelize update() returns an array, [1] means update success
      // บันทึก Log
      await logService.createLog(adminId, "แก้ไขข้อมูลครัวเรือน", "Household", id, houseObj.house_code);

      return res.send({
        data: result,
        msg: "success",
        status: 200,
        err: "",
      });
    } else {
      return res.status(400).send({
        data: null,
        msg: "No changes applied or Household not found",
        status: 400,
      });
    }
  } catch (err) {
    return res.status(500).send({
      data: null,
      msg: "error",
      status: 500,
      err: err.message,
    });
  }
};

const deleteHouse = async (req, res) => {
  await householdService
    .deleted(req.params.id)
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

// Controller function: ส่งผลลัพธ์การนับจำนวนข้อมูลกลับไปยัง client
const countHouseholds = async (req, res) => {
  // เรียกใช้ฟังก์ชัน countHouseholds() จาก service layer
  await householdService
    .countHouseholds()
    .then((data) => {
      // หากการนับสำเร็จ ส่งผลลัพธ์กลับไปยัง client ในรูป JSON
      res.send({
        count: data, // จำนวนข้อมูลที่ได้จากการนับ
        msg: "success", // สถานะข้อความ "success"
        status: 200, // HTTP status code 200 หมายถึงการทำงานสำเร็จ
        err: "", // ไม่มีข้อผิดพลาด
      });
    })
    .catch((err) => {
      // หากเกิดข้อผิดพลาด ส่งข้อความและ error กลับไปยัง client
      res.send({
        count: null, // ไม่มีข้อมูลการนับ (null)
        msg: "error", // สถานะข้อความ "error"
        status: 500, // HTTP status code 500 หมายถึงเกิดข้อผิดพลาดในเซิร์ฟเวอร์
        err: err, // รายละเอียดข้อผิดพลาด
      });
    });
};

// Controller Layer
const countHouseholdsByDistrict = async (req, res) => {
  try {
    const data = await householdService.countHouseholdsByDistrict();
    res.status(200).json({
      data: data,
      msg: "success",
      status: 200,
      err: "",
    });
  } catch (err) {
    res.status(500).json({
      data: null,
      msg: "error",
      status: 500,
      err: err.message,
    });
  }
};

const searchByHouseCode = async (req, res) => {
  try {
    const { search } = req.query;

    let { page = 1, limit = 30 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const offset = (page - 1) * limit;

    if (!search) {
      return res.status(200).send({
        message: "success",
        currentPage: page,
        totalItems: 0,
        totalPages: 0,
        results: [],
      });
    }

    const { count, rows } = await household_model.findAndCountAll({
      where: {
        [Op.or]: [
          {
            house_code: {
              [Op.iLike]: `%${search}%`,
            },
          },
          {
            host_fname: {
              [Op.iLike]: `%${search}%`,
            },
          },
        ],
      },
      limit,
      offset,
      order: [["house_code", "ASC"]],
    });

    const totalPages = Math.ceil(count / limit);

    return res.status(200).send({
      message: "success",
      currentPage: page,
      totalPages,
      totalItems: count,
      results: rows,
    });
  } catch (error) {
    return res.status(500).send({
      message: "Sever errors",
      error: error.message,
    });
  }
};

const createNonAgiIncome = async (req, res) => {
  const { householdId } = req.params; // Get householdId from the route parameter
  const nonAgiIncomeData = req.body; // Data for NonAGIincome from the request body
  const adminId = req.user.id; // ดึง id ของ admin ที่ทำการเพิ่มข้อมูล

  try {
    const result = await householdService.createNonAgiIncome(
      householdId,
      nonAgiIncomeData,
      adminId
    );

    if (result.success) {
      res.status(201).send({
        data: result.data,
        message: result.message,
        status: 201,
      });
    } else {
      res.status(400).send({
        data: null,
        message: result.error,
        status: 400,
      });
    }
  } catch (error) {
    res.status(500).send({
      data: null,
      message: "Internal server error",
      status: 500,
      error: error.message,
    });
  }
};

const createAgiFinancial = async (req, res) => {
  try {
    const { householdId } = req.params;
    const adminId = req.user.id;

    //find HH -> form -> financial
    const household = await household_model.findByPk(householdId, {
      include: [
        {
          model: form_model
        }
      ]
    });

    if (!household) {
      return res.status(400).send({ message: "Household not found" })
    }
    const form = household.Form;
    if (!form) {
      return res.status(400).send({ message: 'No associated form found for the household' })
    }

    const financialCapital = await financialcapital_model.findOne({
      where: { formId: form.id }
    })
    if (!financialCapital) {
      return res.status(400).send({ message: 'No associated financialcapital found in the form' })
    }

    const result = await agi_financial_model.create({
      ...req.body,
      finan_capital_id: financialCapital.id,
      editBy:adminId
    })

    // บันทึก Log
    await logService.createLog(adminId, "เพิ่มข้อมูลการเงินภาคเกษตรของครัวเรือน", "AgiFinancial", result.id , household.house_code);

    return res.status(200).send({ message: 'success', result })


  } catch (err) {
    return res.status(500).send({ message: 'Sever error', error: err.message })
  }
}

const createHouseholdExpenses = async (req, res) => {
  const { householdId } = req.params; // Get householdId from the route parameter
  const householdExpensesData = req.body; // Data for HouseholdExpenses from the request body
  const adminId = req.user.id; // ดึง id ของ admin ที่ทำการเพิ่มข้อมูล

  try {
    const result = await householdService.createHouseholdExpenses(
      householdId,
      householdExpensesData,
      adminId
    );

    if (result.success) {
      res.status(201).send({
        data: result.data,
        message: result.message,
        status: 201,
      });
    } else {
      res.status(400).send({
        data: null,
        message: result.error,
        status: 400,
      });
    }
  } catch (error) {
    res.status(500).send({
      data: null,
      message: "Internal server error",
      status: 500,
      error: error.message,
    });
  }
};

const createSaving = async (req, res) => {
  const { householdId } = req.params; // Get householdId from the route parameter
  const savingData = req.body; // Data for Saving from the request body
  const adminId = req.user.id

  try {
    const result = await householdService.createSaving(householdId, savingData, adminId);

    if (result.success) {
      res.status(201).send({
        data: result.data,
        message: result.message,
        status: 201,
      });
    } else {
      res.status(400).send({
        data: null,
        message: result.error,
        status: 400,
      });
    }
  } catch (error) {
    res.status(500).send({
      data: null,
      message: "Internal server error",
      status: 500,
      error: error.message,
    });
  }
};

const createCreditsource = async (req, res) => {
  const { householdId } = req.params; // Get householdId from the route parameter
  const creditsourceData = req.body; // Data for Creditsource from the request body
  const adminId = req.user.id

  try {
    const result = await householdService.createCreditsource(
      householdId,
      creditsourceData,
      adminId
    );

    if (result.success) {
      res.status(201).send({
        data: result.data,
        message: result.message,
        status: 201,
      });
    } else {
      res.status(400).send({
        data: null,
        message: result.error,
        status: 400,
      });
    }
  } catch (error) {
    res.status(500).send({
      data: null,
      message: "Internal server error",
      status: 500,
      error: error.message,
    });
  }
};

const createMember = async (req, res) => {
  const { householdId } = req.params; // Get householdId from the route parameter
  const memberData = req.body; // Data for Member from the request body
  const adminId = req.user.id

  try {
    const result = await householdService.createMember(householdId, memberData, adminId);

    if (result.success) {
      res.status(201).send({
        data: result.data,
        message: result.message,
        status: 201,
      });
    } else {
      res.status(400).send({
        data: null,
        message: result.error,
        status: 400,
      });
    }
  } catch (error) {
    res.status(500).send({
      data: null,
      message: "Internal server error",
      status: 500,
      error: error.message,
    });
  }
};

const createPin = async (req, res) => {
  try {
    // Extract householdId from URL parameters
    const { householdId } = req.params;
    const { lat, lon } = req.body; // lat and lon are still received from request body
    const adminId = req.user.id

    if (!lat || !lon) {
      return res
        .status(400)
        .json({ message: "Latitude (lat) and Longitude (lon) are required" });
    }

    const updatedPhysicalCapital = await householdService.createPin(
      householdId,
      lat,
      lon,
      adminId
    );

    return res.status(200).json({
      message: "Pin created/updated successfully",
      data: updatedPhysicalCapital,
    });
  } catch (error) {
    console.error("Error in createPin controller:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

//ML for HH
const predict = async (req, res) => {
  const ML = require("ml-regression");
  const SLR = ML.SLR; // Simple Linear Regression

  try {
    const { householdId } = req.params;
    const { district } = req.query; //อำเภอ

    //ดึงข้อมูลย่อน 4ปี หลังใน DB
    const data = await avg_house_income.findAll({
      where: {
        district_name: district,
        createdAt: {
          [Op.gte]: new Date("2021-01-01"),
          [Op.lte]: new Date("2024-12-31"),
        },
      },
      order: [["createdAt", "ASC"]],
    });

    //แปลงเป็น Arr
    const year = data.map((item) => item.createdAt.getFullYear());
    const value = data.map((item) => item.amount);

    //ดึงข้อมูล 3 (นอก/ใน เกษตร ลูกหลาน)  ก้อนมมารวมเป็น 1 เลข

    //ดึงข้อมูล HH , form , finan หา finanId เพื่อไป loop รวมค่า income ที่สร้างในวันเดียวกันไปลง []
    const incomeData = await household_model.findByPk(householdId, {
      attributes: ["id", "form_id"],
      include: {
        model: form_model,
        attributes: ["id"],
        include: {
          model: financialcapital_model,
          order: [["createdAt", "ASC"]],
          attributes: ["id"],
          include: [
            {
              model: non_agi_model,
            },
            {
              model: agi_financial_model,
            },
          ],
        },
      },
    });

    //เรียงลำดับข้อมูล NonAGIincomes และ AGIFinancials หลังจากดึงข้อมูล
    const nonAgiIncomes = incomeData.Form.Financialcapital.NonAGIincomes.sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
    const agiFinancials = incomeData.Form.Financialcapital.AGIFinancials.sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );

    //รวมยอดเงินถ้าสร้างวันเดียวกันเป็น 1 value , year
    const incomeMap = {};

    //Non AGI income
    nonAgiIncomes.forEach((item) => {
      const createdAt = new Date(item.createdAt).toISOString().split("T")[0]; //  (YYYY-MM-DD)
      //เจอวันที่ซ้ำ + ทบไป
      if (incomeMap[createdAt]) {
        incomeMap[createdAt] += item.amount_per_year;
      }
      //ไม่เจอซ้ำสร้างใหม่
      else {
        incomeMap[createdAt] = item.amount_per_year; //key:value
      }
    });

    //AGI financial
    agiFinancials.forEach((item) => {
      const createdAt = new Date(item.createdAt).toISOString().split("T")[0];
      //เจอวันที่ซ้ำบวกทบไป
      if (incomeMap[createdAt]) {
        incomeMap[createdAt] += item.amount_per_year;
      } else {
        incomeMap[createdAt] = item.amount_per_year;
      }
    });

    // แปลง incomeMap เป็น Array และเรียงลำดับตามวันที่
    const incomeArray = Object.entries(incomeMap).sort(
      (a, b) => new Date(a[0]) - new Date(b[0])
    );

    // เพิ่มค่าที่รวมแล้วลงใน value และ year
    const newYear = [];
    const newValue = [];
    incomeArray.forEach(([date, amount]) => {
      newYear.push(new Date(date).getFullYear());
      newValue.push(amount);
    });

    // นำค่าจาก newYear และ newValue ไปต่อท้าย year และ value
    year.push(...newYear);
    value.push(...newValue);

    //predict amount next year
    const lastYear = Math.max(...year);
    const resgression = new SLR(year, value);
    const prediction = resgression.predict(lastYear + 1);
    return res.status(200).send({
      message: "success",
      year,
      value,
      result: {
        incomeData,
        prediction: parseFloat(prediction.toFixed(2)),
      },
    });
  } catch (err) {
    return res.status(500).send({ message: "Sever error", error: err.message });
  }
};

const searchHousehold = async(req,res)=>{
  try{

    const  {
      district,
      subdistrict,
      host_fname,
      house_code
    } = req.query

    let {page,limit} = req.query;
    page = parseInt(page)
    limit = parseInt(limit)
    const offset = (page-1) * limit

    const householdCondition = {}

    if(district){
      householdCondition.district = district
    }
    if(subdistrict){
      householdCondition.subdistrict = subdistrict
    }
    if(host_fname){
      householdCondition.host_fname = {
        [Op.iLike]: `%${host_fname}%`
      }
    }
    if(house_code){
      householdCondition.house_code = {
        [Op.iLike]: `%${house_code}%`
      }
    }

    //ค้นหา
    const {count,rows} = await household_model.findAndCountAll({
      where: householdCondition,
      limit,
      offset
    })

    if(rows.length === 0 ){
      return res.status(200).send({message:'success',results:[],totalPages:0,currentPage:1})
    }


    return res.status(200).send({
      messaage:'success',
      results:rows,
      currentPage:page,
      totalPages: Math.ceil(count/limit),
      totalItems:count
    })
  
  }catch(err){
    return res.status(500).send({message:'Sever error',error:err.message})
  }
}

module.exports = {
  List,
  houseList,
  findOneHouse,
  create,
  updateHouse,
  deleteHouse,
  countHouseholds,
  countHouseholdsByDistrict,
  searchByHouseCode,
  createNonAgiIncome,
  createHouseholdExpenses,
  createSaving,
  createCreditsource,
  createMember,
  createPin,
  predict,
  createAgiFinancial,
  searchHousehold
};
