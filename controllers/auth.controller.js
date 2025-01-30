const db = require("../models");
const user_model = db.User;
const token_model = db.Token;



//JWT
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const secret = process.env.SECRET;

//validate Input
const {
  createUserSchema,
  updateUserSchema,
  loginSchema,
} = require("../validators/User/User.validator");

const register = async (req, res) => {
  const { error, value } = createUserSchema.validate(req.body);

  if (error) {
    return res
      .status(400)
      .send({ message: "Validation error", error: error.details });
  }

  try {
    // Hash password with salt rounds 10
    const hashedPassword = await bcrypt.hash(value.password, 10);

    //Check email
    const existingEmail = await user_model.findOne({
      where: {
        email: value.email,
      },
    });

    if (existingEmail) {
      return res
        .status(400)
        .send({ message: "มีอีเมลล์นี้อยู่ในระบบแล้วกรุณากรอกอีเมลล์อื่น" });
    }

    // Check username
    const existingUsername = await user_model.findOne({
      where: { username: value.username },
    });

    if (existingUsername) {
      return res
        .status(400)
        .send({ message: "มี username นี้อยู่ในระบบอยู่แล้วกรุณาใช้ชื่ออื่น" });
    }

    // If both email and username are available, create the user
    const user = await user_model.create({
      
      email: value.email,
      username: value.username,
      password: hashedPassword,
      title: value.title,
      fname: value.fname,
      lname: value.lname,
      phone: value.phone,
      role: value.role,
      status: value.status,
    });

    return res.status(200).send({ message: "success" });
  } catch (error) {
    return res
      .status(500)
      .send({ message: "Sever error", error: error.message });
  }
};

const login = async (req, res) => {
  const { error, value } = loginSchema.validate(req.body);

  if (error) {
    return res
      .status(400)
      .send({ message: "Validation error", error: error.details });
  }

  try {
    const username = value.username;

    const user = await user_model.findOne({
      where: {
        username: username,
      },
    });

    if (!user) {
      return res
        .status(404)
        .send({ message: "ชื่อผู้ใช้ หรือ รหัสผ่านไม่ถูกต้อง" });
    }

    const passwordValit = await bcrypt.compare(value.password, user.password);
    if (!passwordValit) {
      return res.status(401).send({ message: "รหัสผ่านไม่ถูกต้อง" });
    }

    //ออก token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        status: user.status,
      },
      secret,
      { expiresIn: "24h" }
    );

    //บันทึกข้อมูลการเข้าระบบของ user
    await token_model.create({
      user_id: user.id,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), //24 hr
    });

    return res.status(200).send({
      message: "Login success",
      data: {
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          status: user.status,
        },
      },
      Token: token,
    });
  } catch (error) {
    return res
      .status(500)
      .send({ message: "Sever error", error: error.message });
  }
};

const currentUser = async (req, res) => {
  try {
    const user = await user_model.findOne({
      where: {
        id: req.user.id,
      },
      attributes: { exclude: ["password", "phone"] },
    });

    return res.status(200).send(user);
  } catch (e) {
    return res.status(500).send({ message: "Sever error", errors: e });
  }
};

module.exports = {
  register,
  login,
  currentUser,
};
