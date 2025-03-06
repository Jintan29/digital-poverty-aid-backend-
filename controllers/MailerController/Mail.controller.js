const { where } = require("sequelize");
const db = require("../../models");
const user_model = db.User;
const jwt = require("jsonwebtoken");
const JWT_secret = process.env.SECRET; //for gen link
const base_url = process.env.BASE_URL;
const gmail = process.env.GMAIL;
const appPass = process.env.APP_PASS
const bcrypt = require("bcrypt");

const nodeMailer = require("nodemailer");

//config ข้อมูลเมลเราที่จะใช้ส่ง
const transporter = nodeMailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587, // เปลี่ยนพอร์ตเป็น 587 (TLS)
  secure: false, // TLS ไม่ใช่ SSL ดังนั้น secure เป็น false
  auth: {
    user: gmail,
    pass: appPass,
  },
  tls: {
    rejectUnauthorized: false // ช่วยแก้ปัญหา certificate
  }
});

//TEST
const sendEmail = (req, res) => {
  transporter.sendMail(mailOptions, function (err, info) {
    if (err) {
      console.log(err);
    } else {
      console.log(info);
      return res.send({ message: "Send mail success" });
    }
  });
};

const forgotPass = async (req, res) => {
  try {
    const { email } = req.body;

    // validate is user exis
    const user = await user_model.findOne({
      where: { email: email },
    });

    if (!user) {
      return res
        .status(404)
        .send({ message: "ไม่พบข้อมูลอีเมลล์ดังกล่าวในระบบ" });
    }

    //create one time link 15m
    const secret = JWT_secret + user.password;
    const payload = {
      email: user.email,
      id: user.id,
    };

    const token = jwt.sign(payload, secret, { expiresIn: "15m" });

    const link = `${base_url}/reset-password/${user.id}/${token}`;
    console.log(link);

    //ตรงนี้ส่งไปหาที่ email ของ user
    let mailOptions = {
      from: "sradss.digitalproverty@gmail.com",
      to: user.email,
      subject: "ลิงค์สำหรับเปลี่ยนรหัสผ่าน (หมดอายุภายใน 15 นาที)",
      html: `
        <p>สวัสดีคุณ <b>${user.email}</b></p>
        <p>มีการร้องขอเปลี่ยนรหัสผ่านจากระบบ SRADSS หากเป็นคุณที่ทำรายการ กรุณาคลิกที่ลิงก์ด้านล่างเพื่อเปลี่ยนรหัสผ่าน:</p>
        <p><a href="${link}" target="_blank">${link}</a></p>
        <p><i>ลิงก์นี้จะหมดอายุภายใน 15 นาที</i></p>
        <p>หากไม่ใช่คุณที่ทำรายการ กรุณาเพิกเฉยอีเมลฉบับนี้</p>
      `,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Error while sending email:", err);
        return res.status(500).send({
          message: "ไม่สามารถส่งอีเมลได้ กรุณาลองใหม่ภายหลัง",
          error: err,
        });
      } else {
        console.log("Email sent:", info.response);
        return res.status(200).send({
          message: "ระบบได้ส่งลิงก์เปลี่ยนรหัสผ่านไปยังอีเมลของคุณแล้ว",
        });
      }
    });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    return res.status(500).send({
      message: "มีข้อผิดพลาดบางอย่าง กรุณาลองใหม่ภายหลัง",
      error: err.message,
    });
  }
};

const checkToken = async(req,res)=>{
    const {id,token} = req.params;

    const user = await user_model.findOne({
        where:{
            id:id
        }
    })

    if(!user){
        return res.status(404).send({message:'User not in database'})
    }

    const secret = JWT_secret + user.password;

    try{
        const payload = jwt.verify(token,secret) // if invalid throw to catch
        
        return res.status(200).send({message:'success',email:user.email})
    }catch(err){
        console.log(err);
        return res.status(500).send({message:'ลิงค์หมดอายุ',errors:err.message})
    }

}

const resetPassword = async(req,res)=>{
try{
    const {id,token} = req.params;
    const {password} = req.body;

    const user = await user_model.findOne({
        where:{
            id:id
        }
    })

    if(!user){
        return res.status(404).send({message:'ไม่พบผู้ใช้คนนี้ในระบบ'})
    }

    //validate token
    const secret = JWT_secret + user.password 
    
    const payload = jwt.verify(token,secret) //return email ,id
    
    const hashedPassword = await bcrypt.hash(password,10)

    user.password = hashedPassword
    await user.save()

    return res.status(200).send({message:'success',user:user})

}catch(err){
    console.log(err);
    return res.status(500).send({message:'Sever error',err:err.message})
}
}

module.exports = { sendEmail, forgotPass,checkToken,resetPassword };
