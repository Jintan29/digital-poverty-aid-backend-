const db = require("../models");
const user_model = db.User;
const token_model = db.Token;

const bcrypt = require("bcrypt");
const { Op } = require("sequelize");

//validate input
const {
  updateUserSchema,
  loginSchema,
} = require("../validators/User/User.validator");

//ดึงข้อมูลการ login ของ user ทั้งหมด
const loginHistory = async(req,res)=>{
  try{
    const { month , year} = req.params;


    if(month && year){
      //หา startDate & endDate
      const startDate = new Date(year , month-1 , 1) //month start at 0
      const endDate = new Date(year , month, 0) // วันที่0ของเดือนถัดไป
    
    
      const results = await user_model.findAll({
        attributes:['id','email','username','title','fname','lname'],
        include:[
          {
            model:token_model,
            where:{
              createdAt:{
                [Op.between]: [startDate,endDate]
              }
            },
            require: false //แสดงข้อมูล user แม้จะไม่ได้ login ในช่วงเวลานั้น
          }
        ]
      })
  
      if (results.length === 0) {
        return res.status(404).send({ message: "ไม่พบประวัติการเข้าสู่ระบบ" ,results:[]});
      }
  
      //แปลงข้อมูลเป็น {} เพื่อคำนวนจำนวนการ login
      const formattedResults = results.map(user=>{
        const plainUser = user.get({plain:true})
  
        return{
          ...plainUser,
          totalLogin: plainUser.Tokens.length
        }
      })
  
      return res.status(200).send({message:'success',results:formattedResults})
    
    
    }else{
      return res.status(404).send({message:'ไม่พบวันที่ค้นหากรุณากรอกวันที่'})
    }
    

  }catch(err){
    return res.status(500).send({message:"Sever error",errors:err.message})
  }
}

const userList = async(req,res)=>{
  try{
    const user = await user_model.findAll({
      attributes:{exclude:['password']},
      where:{
        role:{
          [Op.not]:null
        }
      }
    })

    return res.status(200).send({message:'success',user:user})
  }catch(err){
    return res.status(500).send({message:'Sever error',errors:err})
  }
}

const findOneUser = async(req,res)=>{
  try{
    const userId = req.params.id

    const user = await user_model.findOne({
      where:{id:userId},
      attributes:{exclude:['password']}
    })

    return res.status(200).send({message:'success',user:user})

  }catch(err){
    return res.status(500).send({message:'Sever error',errors:err})
  }
}

const deleteUser = async(req,res)=>{
  try{
    const userId = req.params.id

    const user = await user_model.destroy({
      where:{id:userId}
    })
    return res.status(200).send({message:'User deleted',user})

  }catch(err){
    return res.status(500).send({message:'Sever error',err})
  }
}

const findNonApprove = async(req,res)=>{
  try{
    const results = await user_model.findAll({
      where:{
        role:{
          [Op.is]:null
        }
      }
    })

    return res.status(200).send({message:'success',results:results})
  }catch(err){
    return res.status(500).send({message:'Sever Error',errors:err})
  }
}

const approveUser = async(req,res)=>{
  try{
    const id = req.params.id
    const user = await user_model.findByPk(id)

    if(user === null){
      return res.status(404).send({message:'User not found'})
    }

    //Assign role
    const adminStatus = ['อสม', 'อพม', 'พอช', 'ผู้ใหญ่บ้าน']
    const superAdminStatus = ['ทีมวิจัย', 'ศึกษาธิการจังหวัด', 'พมจ', 'พช']

    if(adminStatus.includes(user.status)){
      user.role = 'admin'
    }else if(superAdminStatus.includes(user.status)){
      user.role = 'superAdmin'
    }else{
      return res.status(400).send({message:'Invalid user status for role assignment'})
    }

    user.approveBy = req.user.id
    await user.save()

    return res.status(200).send({message:'success',user})
    
  }catch(err){
    return res.status(500).send({message:'Sever Error',errors:err.message})
  }
}
// ฟังก์ชันสำหรับการอัปเดตข้อมูลผู้ใช้
const updateUser = async (req, res) => {
  try {
    // ตรวจสอบค่าข้อมูลที่รับเข้ามา
    const { error, value } = updateUserSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        msg: "Validation error",
        error: error.details,
      });
    }

    // const user_id = req.user.id; // ดึงข้อมูล ID ของผู้ที่ทำการแก้ไข
    const user_id = req.params.id

        // ตรวจสอบว่ามีการเปลี่ยนแปลงรหัสผ่านหรือไม่
        if (value.password) {
          // แฮชรหัสผ่านใหม่
          value.password = await bcrypt.hash(value.password, 10);
        }

    // เพิ่มข้อมูลว่าใครเป็นผู้แก้ไข
    const dataToUpdate = {
      ...value,
      editBy: user_id, // <- ใช้ตัวแปรที่ดึงจาก Token
    };

    // อัปเดตข้อมูลในฐานข้อมูล
    const result = await user_model.update(dataToUpdate, {
      where: {
        id: user_id,
      },
    });
    

    return res.status(200).send({ message: 'User updated successfully', result });
  } catch (err) {
    // จับข้อผิดพลาด
    res.status(500).json({
      msg: "Update failed",
      error: err.message,
    });
  }
};

module.exports = { 
   userList,
   findOneUser,
   deleteUser,
   findNonApprove,
   approveUser,
   loginHistory,
   updateUser
   };
