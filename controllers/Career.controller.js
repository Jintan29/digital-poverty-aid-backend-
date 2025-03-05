const db = require('../models')
const career_model = db.Career
const member_model = db.MemberHousehold
const household_model = db.Household
const Joi = require('joi')
const logService = require("../services/log.service");

//Validator input must be []
createSchema = Joi.array().items(
    Joi.object({
        career_type : Joi.string().required(),
        member_house_id: Joi.number().required(),
    })
).min(1).required()


const list = async(req,res)=>{
    try{
        const results = await career_model.findAll()
        return res.status(200).send({message:'success',results:results})
    }catch(errors){
        return res.status(500).send({message:'Sever errors',errors:errors.message})
    }
}

const create = async (req, res) => {
    try {
      const { error, value } = createSchema.validate(req.body);
      if (error) {
        return res.status(400).send({
          message: "Validation error",
          error: error.details,
        });
      }
  
      const user_id = req.user.id;
  
      // ✅ เพิ่มค่า editBy ก่อนสร้างข้อมูล
      const dataToCreate = value.map(item => ({
        ...item,
        editBy: user_id
      }));

      //ดู id สมาชิก
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
      
      
  
      // ✅ ใช้ bulkCreate และดึงข้อมูลที่ถูกสร้างขึ้นมา
      const results = await career_model.bulkCreate(dataToCreate, {
        returning: true // ให้ Sequelize คืนค่าข้อมูลที่ถูกสร้างขึ้น (รองรับใน PostgreSQL)
      });
  
      // ✅ สร้าง Log ทีละรายการ
      const logPromises = results.map(record => 
        logService.createLog(user_id, "เพิ่มข้อมูลทักษะอาชีพของสมาชิก", "Career", record.id,hc)
      );
      await Promise.all(logPromises);
  
      return res.status(200).send({ message: "success", results });
    } catch (errors) {
      return res.status(500).send({ message: "Server error", errors: errors.message });
    }
  };
  


module.exports = {
    list,
    create
}