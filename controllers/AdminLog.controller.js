const db = require('../models')
const admin_log_model = db.AdminLog;
//ดึงข้อมูลตาราง user , member
const user_model = db.User
const member_model = db.MemberHousehold;
const member_finan_model = db.MemberFinancial;

const listLog = async(req,res)=>{
    try{
        const user_id = req.user.id

        const logMember = await admin_log_model.findAll({
            where:{
                user_id,
                table_name:'MemberHousehold'
            },
            include:[
                {
                    model :user_model,
                    attributes: ['fname', 'lname'],
                },
                //Member
                {
                    model:member_model,
                    where: db.sequelize.where(
                        db.sequelize.col('MemberHousehold.id'),
                        '=',
                        db.sequelize.col('AdminLog.record_id')
                    )

                },
                
            ],
            order: [['createdAt', 'DESC']],  // เรียงลำดับจากการแก้ไขล่าสุด
        })

        const logMemberFinancial = await admin_log_model.findAll({
            where:{
                user_id,
                table_name:'MemberFinancial'
            },
            include:[
                {
                    model :user_model,
                    attributes: ['fname', 'lname'],
                },
                //Member Financial
                {
                    model:member_finan_model,
                    where: db.sequelize.where(
                        db.sequelize.col('MemberFinancial.id'),
                        '=',
                        db.sequelize.col('AdminLog.record_id')
                    )
                }
            ],
            order: [['createdAt', 'DESC']],
        })

        

        return res.status(200).send({message:'success',
            result:{
                MemberAction:logMember,
                MemberFinancialAction: logMemberFinancial
            }    
        })
    
        
    }catch(err){
        return res.status(500).send({message:'Sever error',error:err.message})
    }
}

module.exports={
    listLog
}