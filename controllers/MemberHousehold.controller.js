const memberHouseService = require("../services/member.house.services");
const {
  memberSchema,
  updateMemberSchema,
  combinedSchema,
} = require("../validators/MemberHousehold/member.house.validator"); //Validator

const db = require("../models");
const member_model = db.MemberHousehold;
const household_model = db.Household;
const member_finan_model = db.MemberFinancial;
const admin_log_model = db.AdminLog
const { Op, where } = require("sequelize");


//test admin log
const updateMemberLog = async(req,res)=>{
  try{

    const {id} = req.params; // member id
    const memberHouse = await member_model.findByPk(id)
    
    if(!memberHouse){
      return res.status(404).send({message:'ไม่พบสมาชิกครัวเรือน'})
    }

    const updateData = await memberHouse.update(req.body);

    //เก็บ log
    const logData ={
      user_id: req.user.id,
      action:'update Memberhousehold',
      table_name:'MemberHousehold',
      record_id:id,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    //สร้างข้อมูลลง log
    await admin_log_model.create(logData);

    return res.status(200).send({message:'success',result:updateData})

  }catch(err){
    return res.status(500).send({message:"Sever error",error:err.message})
  }
}

const List = async (req, res) => {
  await memberHouseService
    .getMember()
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
const findOneMember = async (req, res) => {
  try {
    const data = await memberHouseService.findOneById(req.params.id);
    res.send({
      data: data,
      msg: "success",
      status: 200,
      err: "",
    });
  } catch (error) {
    res.send({
      data: null,
      msg: error.message || "error",
      status: 500,
      err: error,
    });
  }
};

const create = async (req, res) => {
  // Validate ข้อมูลจาก req.body ก่อน
  const { error, value } = memberSchema.validate(req.body);

  if (error) {
    return res.status(400).send({
      msg: "Validation error",
      error: error.details,
    });
  }
  //ส่ง value ไปสร้างตามฟิลด์
  const data = await memberHouseService.create(value);
  res.send({ data, msg: "success", status: 200 });
};

//Create 3 table
const createCombined = async (req, res) => {
  try {
    const { error, value } = combinedSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .send({ msg: "Validation error", error: error.details });
    }

    // เรียกใช้ Service เพื่อสร้างข้อมูลรวม
    const result = await memberHouseService.createCombined(value); //ส่งค่าที่ Validate ผ่านแล้ว

    res.status(201).send({
      msg: "success",
      status: 201,
      data: {
        memberHousehold: result.memberHousehold,
        humanCapital: result.humanCapital,
        SocialWelfare: result.socialWelfareArray,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ msg: "error", status: 500, err: err.message });
  }
};

const updateMember = async (req, res) => {
  try {
    const { error, value } = updateMemberSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        msg: "Validation error", 
        error: error.details 
      });
    }
    const memberID = req.params.id
    const user_id = req.user.id

    //เพิ่มข้อมูลว่าใคร update
    const dataToUpdate = {
      ...value,
      editBy: user_id
    }
    
    const result = await member_model.update(dataToUpdate,{
      where:{
        id:memberID
      }
    })
    
    return res.status(200).send({message:'success',result})

  } catch (err) {
    res.status(500).json({ 
      msg: "Update failed", 
      error: err.message 
    });
  }
};

const deleteMember = async (req, res) => {
  await memberHouseService
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

const findByAge = async (req, res) => {
  try {
    const today = new Date();
    //convert year
    const yearBE = today.getFullYear() + 543;
    const month = today.getMonth() + 1;
    const day = today.getDate();

    let { minAge, maxAge } = req.params;

    let { page = 1, limit = 30 } = req.query; //Paginatetion
    page = parseInt(page);
    limit = parseInt(limit);
    const offset = (page - 1) * limit;

    //หาวันที่ min,max
    const maxBirthDate = new Date();
    maxBirthDate.setFullYear(today.getFullYear() - minAge);
    maxBirthDate.setMonth(today.getMonth());
    maxBirthDate.setDate(today.getDate() + 1);

    const minBirthDate = new Date();
    minBirthDate.setFullYear(today.getFullYear() - maxAge - 1); //(อายุมาก->เลขปีน้อย)
    minBirthDate.setMonth(today.getMonth());
    minBirthDate.setDate(today.getDate());

    // แปลง คศ->พศ
    const startDateBE = new Date(minBirthDate);
    startDateBE.setFullYear(minBirthDate.getFullYear() + 543);

    const endDateBE = new Date(maxBirthDate);
    endDateBE.setFullYear(maxBirthDate.getFullYear() + 543);

    // ใช้ findAndCountAll เพื่อรับทั้งข้อมูลและจำนวนรวม
    const { count, rows } = await member_model.findAndCountAll({
      where: {
        birthdate: {
          [Op.between]: [startDateBE, endDateBE],
        },
      },
      attributes: [
        "id",
        "title",
        "fname",
        "lname",
        "sex",
        "status_in_house",
        "health",
        "work_status",
        "phone",
        "birthdate",
      ],
      include: [
        {
          model: household_model,
          attributes: [
            "id",
            "house_code",
            "house_number",
            "subdistrict",
            "district",
            "province",
            "postcode",
          ],
        },
      ],
      //ตรงนี้เพิ่มมา
      limit,
      offset,
      order: [["birthdate", "DESC"]],
    });

    const totalPages = Math.ceil(count / limit);

    //return ไปแค่ช่วงอายุที่อยู่ในเกณฑ์เท่านั้น
    const fillterResults = rows
      .map((member) => {
        const birthdate = new Date(member.birthdate);
        let age = yearBE - birthdate.getFullYear();

        if (
          //ยังไม่ถึงวันเกิด -1
          month < birthdate.getMonth() + 1 ||
          (month === birthdate.getMonth() + 1 && day < birthdate.getDate())
        ) {
          age--;
        }
        return {
          ...member.toJSON(),
          age: age,
        };
      })
      .filter((member) => member.age >= minAge && member.age <= maxAge);

    return res
      .status(200)
      .send({
        message: "success",
        month,
        day,
        currentPage: page,
        totalPages,
        totalItems: count,
        results: fillterResults,
      });
  } catch (err) {
    return res
      .status(500)
      .send({ message: "Sever errors", errors: err.message });
  }
};

const searchByName = async (req, res) => {
  try {
    const { fname } = req.query;
    let { page = 1, limit = 20 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    const offset = (page - 1) * limit; //เริ่มต้นการค้นหาที่ index...

    if (!fname) {
      return res.status(200).send({
        message: "success",
        currentPage: page,
        totalPages: 0,
        totalItems: 0,
        results: [],
      });
    }

    const { count , rows  } = await member_model.findAndCountAll({
      where:{
        fname:{
          [Op.like]:`%${fname}%`
        }
      },
      include:[{model:household_model}],
      limit,
      offset,
      order:[['fname','ASC']] // เรียงตามตัวอักษร
    })

    const totalPages = Math.ceil(count/limit);

    return res.status(200).send({
      message:'success',
      currentPage: page,
      totalPages,
      totalItems: count,
      results: rows 
    })

  } catch (error) {
    return res
      .status(500)
      .send({ message: "Sever error", error: error.message });
  }
};

const searchByHouseCode = async(req,res)=>{
  try{
    let {page = 1, limit = 20, code} = req.query; 
    page = parseInt(page);
    limit = parseInt(limit)
    const offset = (page - 1) * limit;

    if(!code){
      return res.status(200).send({
        message:'success',
        currentPage:page,
        totalItems:0,
        totalPages:0,
        results:[]
      })
    }

    const {count , rows} = await member_model.findAndCountAll({
      include:[
        {
          model: household_model,
          where:{
            house_code:{
              [Op.iLike]:`%${code}%`
            },
          },
        }
      ],
      limit,
      offset,
      distinct: true //หลีกเลี่ยงการนับซ้ำเพราะ include
    })

    const totalPages = Math.ceil(count / limit);

    return res.status(200).send({
      message:'success',
      currentPage:page,
      totalPages,
      totalItems: count,
      results:rows
    })

  }catch(error){
    return res.status(500).send({message:'Sever error',error:error.message})
  }
}

const findCapital = async (req, res) => {
  try {
    const { id } = req.params;
    const results = await member_finan_model.findAll({
      where: {
        member_house_id: id,
      },
    });

    return res.status(200).send({ message: "success", results });
  } catch (err) {
    return res
      .status(500)
      .send({ message: "Sever error", errors: err.message });
  }
};

const conuntMemberHousehold = async (req, res) => {
  await memberHouseService
    .countMemberHousehold()
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

const getMembersCountByDistrict = async (req, res) => {
  try {
    const districtCounts = await memberHouseService.countMembersByDistrict();
    res.status(200).json({
      success: true,
      data: districtCounts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to retrieve members count by district: ${error.message}`,
    });
  }
};

module.exports = {
  List,
  findOneMember,
  create,
  updateMember,
  deleteMember,
  createCombined,
  findByAge,
  conuntMemberHousehold,
  getMembersCountByDistrict,
  findCapital,
  searchByName,
  searchByHouseCode,
  //TEST
  updateMemberLog
};
