require("dotenv").config();
const line = require("@line/bot-sdk");
const db = require("../../models");
const {
  createSchema,
  updateSchema,
} = require("../../validators/LineOA/LineOA.validator");
const { Op } = require("sequelize");

//model
const houshold_model = db.Household;
const member_house_model = db.MemberHousehold;
const social_welfare_model = db.SocialWelfare;
const line_oa_model = db.LineOA; //เก็บข้อมูล user id คู่กับ housecode
const line_log_model = db.LineUserLog;
const help_member_model = db.HelpMember;

//Controller
const MemberFinancialController = require("../MemberFinancial.controller"); //สำหรับ predict รายรับ
const HouseholdController = require("../household.controller");

//Service
const districtService = require("../../services/district.service"); //ดึงService เก่ามาใช้
const financialcapitalService = require("../../services/Financialcapital.service");

const config = {
  channelAccessToken: process.env.token,
  channelSecret: process.env.secretcode,
};

// Initialize LINE client
const client = new line.Client(config);

const handleEvents = async (event) => {
  console.log(event);

  if (event.type !== "message" || event.message.type != "text") {
    return Promise.resolve(null); //ไม่ต้องการ
  }

  //ดึงข้อมูลคนจนในพิษณุโลก
  if (event.type === "message" && event.message.text === "สถิติคนจนในจังหวัด") {
    return countPoor(event);
  }

  //ติดต่อสอบถาม
  if (event.type === "message" && event.message.text === "ติดต่อสอบถาม") {
    return client.replyMessage(event.replyToken, [
      {
        type: "text",
        text: `หากมีข้อสงสัยเพิ่มเติมติดต่อ
email: sradss.digitalproverty@gmail.com`,
      },
    ]);
  }

  //ข้อมูลครัวเรือน
  if (event.type === "message" && event.message.text === "ข้อมูลครัวเรือน") {
    return householdInfo(event);
  }

  //ข้อมูลสมาชิกครัวเรือน
  if (
    event.type === "message" &&
    event.message.text === "ข้อมูลสมาชิกครัวเรือน"
  ) {
    return memberInfo(event);
  }

  //วิเคราะห์รายได้บุคคล
  if (
    event.type === "message" &&
    event.message.text === "วิเคราะห์รายได้บุคคล"
  ) {
    return calculateMemberIncome(event);
  }

  //รายรับครัวเรือน
  if (event.type === "message" && event.message.text === "รายรับของครัวเรือน") {
    return householdFinancial(event);
  }

  //หนี้สินและการออม
  if (event.type === "message" && event.message.text === "หนี้สินและการออม") {
    return DebtAndSaving(event);
  }

  //กดออกจากระบบ
  if (event.type === "message" && event.message.text === "ออกจากระบบ") {
    const userId = event.source.userId;

    await line_log_model.create({
      userId: event.source.userId,
      action: "ออกจากระบบ",
    });

    client.unlinkRichMenuFromUser([userId]);

    return client.replyMessage(event.replyToken, [
      {
        type: "text",
        text: `ออกจากระบบสำเร็จ`,
      },
    ]);
  }

  return client.replyMessage(event.replyToken, [
    {
      type: "text",
      text: `กรุณาเลือกข้อมูลให้ถูกต้อง`,
    },
  ]);
};

const webHook = async (req, res) => {
  try {
    const results = await Promise.all(
      req.body.events.map((event) => handleEvents(event))
    );

    return res.status(200).send("OK");
  } catch (err) {
    console.error("Webhook Error:", err);
    return res
      .status(500)
      .send({ message: "Server error", error: err.message });
  }
};


//log report per month
const Loging = async (req, res) => {
  try {
    const { month, year } = req.params;

    //pagiante
    let { page, limit } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const offset = (page - 1) * limit;

    //หา start,end Date
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const { count, rows } = await line_log_model.findAndCountAll({
      distinct: true,
      where: {
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
      },
      include: line_oa_model,
      order:[['id','DESC']],
      limit: limit,
      offset: offset,
    });

    //หากไม่เจอข้อมูล
    if (rows.length === 0) {
      return res.status(200).send({
        message: "success",
        results: [],
        totalPages: 0,
        currentPage: page,
        totalItems: 0,
      });
    }

    return res.status(200).send({
      message: "success",
      results: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalItems: count,
    });


  } catch (err) {
    return res.status(500).send({ message: "Sever error", error: err.message });
  }
};

//Push message
const pushMessage = async (req, res) => {
  try {
    client.pushMessage("U528a3568c3cbe72a8979c5fd9e8c13b9", [
      {
        type: "text",
        text: `ทดสอบ push message`,
      },
    ]);
    return res.status(200).send({ message: "ok" });
  } catch (err) {
    return res.status(500).send({ message: "Sever error", error: err.message });
  }
};

//LIFF and change rich menu
const register = async (req, res) => {
  try {
    //check is user already register
    const userId = req.body.userId;

    const user = await line_oa_model.findOne({
      where: {
        userId: userId,
      },
    });

    if (user) {
      return res.status(400).send({
        message: "บัญชีไลน์ของท่านได้ทำการลงทะเบียนไปแล้วกรุณา เข้าสู่ระบบ",
      });
    }

    //check house code valid

    const household = await houshold_model.findOne({
      where: {
        house_code: req.body.house_code,
      },
    });

    if (!household) {
      return res.status(404).send({
        message: "ไม่พบข้อมูลครัวเรือนกรุณาตรวจสอบรหัสครัวเรือนใหม่อีกครั้ง",
      });
    }

    const { error, value } = createSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .send({ message: "Validation error", error: error.details });
    }

    //save to DB
    const result = await line_oa_model.create(value);

    const log = await line_log_model.create({
      userId: value.userId,
      action: "สมัครเข้าสู่ระบบ",
    });

    if (!result) {
      return res.status(400).send({ message: "error" });
    }

    //ยิงสำเร็จ -> เปลี่ยน rich menu (user , richmenu id)
    client.linkRichMenuToUser(
      [userId],
      "richmenu-b10075cc1bb67f28effbb5b2e1653f93"
    );

    return res.status(200).send({ message: "success", result, log });
  } catch (err) {
    return res
      .status(500)
      .send({ message: "Server error", error: err.message });
  }
};

const login = async (req, res) => {
  try {
    //check user is in DB ?
    const userId = req.body.userId;

    const user = await line_oa_model.findOne({
      where: {
        userId: userId,
      },
    });

    if (!user) {
      return res.status(404).send({
        message: "ไม่พบข้อมูลผู้ใช้งานในระบบกรุณาสมัครสมาชิกก่อนเข้าสู่ระบบ",
      });
    }

    const household = await houshold_model.findOne({
      where: {
        house_code: req.body.house_code,
      },
    });

    if (!household) {
      return res.status(404).send({
        message: "ไม่พบข้อมูลครัวเรือนของท่านกรุณากรอกรหัสบ้านให้ถูกต้อง",
      });
    }

    const log = await line_log_model.create({
      userId,
      action: "เข้าสู่ระบบ",
    });

    //all valid -> change rich menu
    client.linkRichMenuToUser(
      [userId],
      "richmenu-b10075cc1bb67f28effbb5b2e1653f93"
    );

    return res.status(200).send({ message: "success", log });
  } catch (err) {
    return res
      .status(500)
      .send({ message: "Server error", error: err.message });
  }
};

//สถิติคนจนในจังหวัด
const countPoor = async (event) => {
  try {
    const results = await districtService.getDatalatest();

    if (!results || !results.data) {
      return client.replyMessage(event.replyToken, [
        {
          type: "text",
          text: `ไม่พบข้อมูลคนจนในระบบ`,
        },
      ]);
    }

    const statesMessage = formatPovertyStats(results);

    return client.replyMessage(event.replyToken, [
      {
        type: "text",
        text: statesMessage,
      },
    ]);
  } catch (err) {
    console.error("Error in countPoor:", err);
    return client.replyMessage(event.replyToken, [
      {
        type: "text",
        text: "ขออภัย เกิดข้อผิดพลาดในการดึงข้อมูล กรุณาลองใหม่อีกครั้ง",
      },
    ]);
  }
};

// format Msg for count poor
const formatPovertyStats = (data) => {
  const { data: districts, totalFamily, totalPoor } = data;

  // Create header
  let message = "📊 สถิติคนจนในจังหวัดพิษณุโลก\n\n";

  // นำข้อความไปต่อท้าย message
  districts.forEach((district) => {
    message += `🏠 ${district.district_name_thai}\n`;
    message += `   ครัวเรือน: ${district.family.toLocaleString()} ครัวเรือน\n`;
    message += `   ผู้มีรายได้น้อย: ${district.poor.toLocaleString()} คน\n\n`;
  });

  // Add summary
  message += "📍 สรุปภาพรวมจังหวัด\n";
  message += `   รวมครัวเรือนทั้งหมด: ${totalFamily.toLocaleString()} ครัวเรือน\n`;
  message += `   รวมผู้มีรายได้น้อยทั้งหมด: ${totalPoor.toLocaleString()} คน\n`;
  message += "\n🗓️ข้อมูล ณ วันที่ " + new Date().toLocaleDateString("th-TH");

  return message;
};

//ข้อมูลครัวเรือน
const householdInfo = async (event) => {
  try {
    const result = await line_oa_model.findOne({
      where: { userId: event.source.userId },
    });
    const house_code = result.house_code;

    const household = await houshold_model.findOne({
      where: {
        house_code,
      },
    });

    //log
    await line_log_model.create({
      userId: event.source.userId,
      action: "ดูข้อมูลครัวเรือน",
    });

    const message = formatHousehold(household);

    return client.replyMessage(event.replyToken, [
      {
        type: "text",
        text: message,
      },
    ]);
  } catch (err) {
    return client.replyMessage(event.replyToken, [
      {
        type: "text",
        text: "ขออภัย เกิดข้อผิดพลาดในการดึงข้อมูล กรุณาลองใหม่อีกครั้ง",
      },
    ]);
  }
};

//format msg for HH
const formatHousehold = (household) => {
  let message = "📋 ข้อมูลครัวเรือน\n\n";

  // House information
  message += `🏠 รหัสบ้าน: ${household.house_code}\n`;
  message += `📍 ที่อยู่: ${household.house_number}  ต.${household.subdistrict} อ.${household.district} จ.${household.province}  ${household.postcode} \n\n`;

  if (household.has_greenBook) {
    message += ` 🌾  หมายเลขสมุดเกษตร: ${household.green_book_id}\n`;
  }

  // Host information
  message += "👤 ข้อมูลหัวหน้าครัวเรือน\n";
  message += `   ชื่อ: ${household.host_title} ${household.host_fname} ${household.host_lname}\n`;
  message += `   เลขบัตรประชาชน: ${household.host_national_id}\n\n`;
  message += `📈 สถานะครัวเรือน : ยังอยู่ในความยากจน\n\n`;

  message += `\n🗓️ข้อมูล ณ วันที่ ${new Date(
    household.updatedAt
  ).toLocaleDateString("th-TH")}`;

  return message;
};

//ข้อมูลสมาชิก
const memberInfo = async (event) => {
  try {
    const result = await line_oa_model.findOne({
      where: { userId: event.source.userId },
    });

    const household = await houshold_model.findOne({
      where: { house_code: result.house_code },
    });

    const members = await member_house_model.findAll({
      where: { houseId: household.id },
      include: [
        {
          model: social_welfare_model,
        },
        {
          model: help_member_model,
        },
      ],
    });

    //แปลงค่าเป็น Obj
    const membersPlain = members.map((member) => member.toJSON());
    console.log(membersPlain);

    //log
    await line_log_model.create({
      userId: event.source.userId,
      action: "ดูข้อมูลสมาชิกครัวเรือน",
    });

    const message = formatMemberInfo(membersPlain);

    return client.replyMessage(event.replyToken, [
      {
        type: "text",
        text: message,
      },
    ]);
  } catch (err) {
    // console.log(err);
    return client.replyMessage(event.replyToken, [
      {
        type: "text",
        text: `ขออภัย เกิดข้อผิดพลาดในการดึงข้อมูล กรุณาลองใหม่อีกครั้ง
        ${err}`,
      },
    ]);
  }
};

const formatMemberInfo = (members) => {
  let message = "👨‍👩‍👧‍👦 ข้อมูลสมาชิกในครัวเรือน\n";
  message += `จำนวนสมาชิกทั้งหมด ${members.length} คน\n\n`;

  members.forEach((member, index) => {
    const birthdate = new Date(member.birthdate);
    const fomatBrithDate = birthdate.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    //ข้อมูลสมาชิก
    message += `👤 สมาชิกคนที่ ${index + 1}\n`;
    message += `ชื่อ: ${member.title}${member.fname} ${member.lname}\n`;
    message += `เพศ: ${member.sex}\n`;
    message += `วันเกิด: ${fomatBrithDate}\n`;
    message += `เบอร์โทร: ${member.phone || "-"}\n`;
    message += `🏡 สถานะในบ้าน: ${member.status_in_house}\n`;
    message += `💊 สุขภาพ: ${member.health}\n\n`;

    // Education information
    message += `🎓 การศึกษาสูงสุด: ${member.max_education}\n`;
    message += `🎓 ระดับการศึกษาปัจจุบัน: ${member.current_edu_level}\n\n`;

    // Work status
    message += `🔨 สถานะการทำงาน: ${member.work_status}\n`;

    // Thai language abilities
    message += "🌐 ทักษะการสื่อสาร:\n";
    message += `- อ่าน: ${member.can_read_TH}\n`;
    message += `- เขียน: ${member.can_write_TH}\n`;
    message += `- พูด: ${member.can_speak_TH}\n`;

    //ข้อมูลการช่วยเหลือ
    if (member.HelpMembers && member.HelpMembers.length > 0) {
      message += "\n📙 ข้อมูลการช่วยเหลือ:";
      member.HelpMembers.forEach((help, index) => {
        message += `\n\nการช่วยเหลือที่ ${index + 1}\n`;
        message += `-ทุนการดำรงชีพ: ${help.capital}\n`;
        message += `-องค์ประกอบเชิงยืนยัน: ${help.components}\n`;
        message += `-การช่วยเหลือ: ${help.help_name}\n`;
        message += `-หน่วยงานที่ช่วยเหลือ: ${help.agency}\n`;
        message += `-จำนวน: ${parseFloat(help.amount).toLocaleString()} บาท\n`;
      });
    } else {
      message += "\n📙 ไม่มีข้อมูลการช่วยเหลือ:\n\n";
    }

    // ข้อมูลสวัสดิการ
    if (member.SocialWelfares && member.SocialWelfares.length > 0) {
      message += "\n📋 ข้อมูลสวัสดิการ:\n";
      member.SocialWelfares.forEach((welfare, welfareIndex) => {
        message += `สวัสดิการที่ ${welfareIndex + 1}:\n`;
        message += `- ประเภทสวัสดิการ: ${welfare.welfare || "-"}\n`;
        message += `- จำนวนเงิน: ${welfare.amount || "-"}\n`;
        message += `- ความถี่: ${welfare.frequency || "-"}\n`;
        if (welfareIndex < member.SocialWelfares.length - 1) {
          message += "\n";
        }
      });
    } else {
      message += "\n📋 ข้อมูลสวัสดิการ: ไม่มีข้อมูล\n";
    }

    if (index < members.length - 1) {
      message += "\n────────────\n\n";
    }
  });

  return message;
};

//รายรับบุคคล
const calculateMemberIncome = async (event) => {
  try {
    //หาข้อมูล user , HH , MB ,MF
    const lineUSer = await line_oa_model.findOne({
      where: { userId: event.source.userId },
    });

    const household = await houshold_model.findOne({
      where: { house_code: lineUSer.house_code },
    });
    const members = await member_house_model.findAll({
      where: { houseId: household.id },
    });

    //เก็บผลการทำนาย
    let predictions = [];

    for (const member of members) {
      const req = {
        params: { id: member.id },
        query: { district: household.district },
      };

      let predictionResult;
      await MemberFinancialController.predict(req, {
        status: (code) => ({
          send: (data) => {
            //assign response to predictionResult
            predictionResult = data;
          },
        }),
      });

      const financialInfo = predictionResult.results.financial
        .map((item) => {
          return `💰 รายได้เฉลี่ยต่อเดือน: ${parseFloat(
            item.agv_income
          ).toLocaleString(
            "th-TH"
          )} บาท\n💸 รายจ่ายเฉลี่ยต่อเดือน: ${parseFloat(
            item.avg_expenses
          ).toLocaleString("th-TH")} บาท\n📉 อัตราเงินเฟ้อ: ${
            item.inflation
          } % \n ข้อมูลวันที่ : ${new Date(item.createdAt).toLocaleDateString(
            "th-TH"
          )} \n\n`;
        })
        .join("\n");

      predictions.push({
        name: member.title + member.fname + " " + member.lname,
        financialInfo: financialInfo,
        prediction: predictionResult.results.prediction,
      });
    }

    //สร้างข้อความสำหรับส่งกลับ
    const messageText = predictions
      .map((p) => {
        return `👤 ${p.name}\n${
          p.financialInfo
        }📅 คาดการณ์รายได้ในปีหน้า: ${parseFloat(
          p.prediction
        ).toLocaleString()} บาทต่อเดือน
        \n\n ──────────────`;
      })
      .join("\n");

    //log
    await line_log_model.create({
      userId: event.source.userId,
      action: "วิเคราะห์รายได้บุคคล",
    });

    return client.replyMessage(event.replyToken, [
      {
        type: "text",
        text: `📊 ผลการวิเคราะห์รายได้ต่อเดือนของสมาชิกในครัวเรือน:\n\n${messageText}`,
      },
    ]);
  } catch (err) {
    console.log(err);

    return client.replyMessage(event.replyToken, [
      {
        type: "text",
        text: "ขออภัย เกิดข้อผิดพลาดในการดึงข้อมูล กรุณาลองใหม่อีกครั้ง",
      },
    ]);
  }
};

//รายรับครัวเรือน
const householdFinancial = async (event) => {
  try {
    const lineUser = await line_oa_model.findOne({
      where: { userId: event.source.userId },
    });
    const household = await houshold_model.findOne({
      where: { house_code: lineUser.house_code },
    });

    //log
    await line_log_model.create({
      userId: event.source.userId,
      action: "ดูรายรับของครัวเรือน",
    });

    //ดึง financial summary
    const financialData = await financialcapitalService.getAllFinancialData(
      household.id
    );

    //ข้อมูลย้อนหลัง รายรับ รายจ่าย และข้อมูลล่าสุด
    const lastestFinancial = financialData.financialSummary;
    console.log(lastestFinancial);

    const houseNonAGIincome = financialData.Form.Financialcapital.NonAGIincomes;
    const houseAGIincome = financialData.Form.Financialcapital.AGIFinancials;
    const houseExpenses = financialData.Form.Financialcapital.Householdexpenses;

    //prediction income จำลอง req,res
    const req = {
      params: { householdId: household.id },
      query: { district: household.district },
    };

    const res = {
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      send: function (data) {
        this.data = data;
        return this;
      },
    };
    await HouseholdController.predict(req, res);
    //เก็บ res
    const prediction = res.data;
    //ข้อมูลพยากรณ์
    const predictionData = prediction.result.prediction;

    return client.replyMessage(event.replyToken, [
      {
        type: "text",
        text: `📊 สรุปสถานะการเงินครัวเรือน
    
💰 รายรับรวมล่าสุด: ${lastestFinancial.totalIncomePerYear.toLocaleString()} บาท/ปี
💸 รายจ่ายรวมล่าสุด: ${lastestFinancial.totalExpenses.toLocaleString()} บาท/ปี
    
📅 คาดการณ์รายได้ปีหน้า: ${predictionData.toLocaleString()} บาท/ปี
    `,
      },
      //นอกภาคเกษตร
      {
        type: "text",
        text: `📑 รายละเอียดรายได้นอกภาคเกษตร:

    ${houseNonAGIincome
      .map(
        (income) =>
          `• ${income.income_type}
  💰 รายได้: ${income.amount_per_year.toLocaleString()} บาท/ปี
  💸 ต้นทุน: ${income.cost_per_year.toLocaleString()} บาท/ปี
  📅 ข้อมูลวันที่: ${new Date(income.createdAt).toLocaleDateString("th-TH")}`
      )
      .join("\n\n")}`,
      },
      //จากการเกษตร
      {
        type: "text",
        text: `🌾 รายละเอียดรายได้ภาคเกษตร:

    ${houseAGIincome
      .map(
        (income) =>
          `• ${income.type}
    💰 รายได้: ${income.amount_per_year.toLocaleString()} บาท/ปี
    📅 ข้อมูลวันที่ : ${new Date(income.createdAt).toLocaleDateString("th-TH")}
    `
      )
      .join("\n\n")}`,
      },
      {
        type: "text",
        text: `📋 รายละเอียดรายจ่ายครัวเรือน:

    ${houseExpenses
      .map(
        (expense) =>
          `• ${expense.expenses_type}
      💸 : ${expense.amount_per_month.toLocaleString()} บาท/เดือน
      📅 ข้อมูลวันที่ : ${new Date(expense.createdAt).toLocaleDateString(
        "th-TH"
      )}
      `
      )
      .join("\n\n")}`,
      },
    ]);
  } catch (err) {
    console.log(err);
    return client.replyMessage(event.replyToken, [
      {
        type: "text",
        text: "ขออภัย เกิดข้อผิดพลาดในการดึงข้อมูล กรุณาลองใหม่อีกครั้ง",
      },
    ]);
  }
};

//หนี้สินและการออม
const DebtAndSaving = async (event) => {
  try {
    const lineUser = await line_oa_model.findOne({
      where: { userId: event.source.userId },
    });
    const household = await houshold_model.findOne({
      where: { house_code: lineUser.house_code },
    });
    //log
    await line_log_model.create({
      userId: event.source.userId,
      action: "ดูหนี้สินและการออมครัวเรือน",
    });

    //ข้อมูลหนี้สิน
    const resultDebt = await financialcapitalService.findDebt(household.id);
    const debtAmount = resultDebt.totalDebt;
    const debtData = resultDebt.Form.Financialcapital.Debt;

    //ข้อมูลการออม
    const resultSaving = await financialcapitalService.findSaving(household.id);
    const savingAmount = resultSaving.totalAmount;
    const savingData = resultSaving.Form.Financialcapital.Savings;

    const formattedMessage = formatFinancialInfo(
      debtData,
      savingData,
      debtAmount,
      savingAmount
    );

    return client.replyMessage(event.replyToken, [
      {
        type: "text",
        text: formattedMessage,
      },
    ]);
  } catch (err) {
    console.log(err);
    return client.replyMessage(event.replyToken, [
      {
        type: "text",
        text: "ขออภัย เกิดข้อผิดพลาดในการดึงข้อมูล กรุณาลองใหม่อีกครั้ง",
      },
    ]);
  }
};

//format MSG Saving & debt
const formatFinancialInfo = (
  debtData,
  savingData,
  debtAmount,
  savingAmount
) => {
  let message = "💰 ข้อมูลนี้สินและการออมของครัวเรือน\n\n";

  // แสดงข้อมูลหนี้สิน
  message += "📊 หนี้สิน\n";
  if (debtData.is_has_debt && debtData.Creditsources.length > 0) {
    message += `💵 ยอดหนี้สินรวม: ${debtAmount?.toLocaleString() || 0} บาท\n\n`;
    message += "รายละเอียดหนี้สิน:\n\n";

    debtData.Creditsources.forEach((debt, index) => {
      message += `${index + 1}. ${debt.form}\n`;
      message += `   ยอดคงเหลือ: ${
        debt.outstanding_amount?.toLocaleString() || 0
      } บาท\n`;
      if (index < debtData.Creditsources.length - 1) {
        message += "\n";
      }
    });
  } else {
    message += "ไม่มีหนี้สิน\n";
  }

  // แสดงข้อมูลการออม
  message += "\n────────────\n\n";
  message += "💰 การออม\n";
  if (savingData.length > 0) {
    message += `💵 ยอดเงินออมรวม: ${
      savingAmount?.toLocaleString() || 0
    } บาท\n\n`;
    message += "รายละเอียดการออม:\n";

    savingData.forEach((saving, index) => {
      message += `${index + 1}. ${saving.saving_type}\n`;
      message += `   จำนวนเงิน: ${saving.amount?.toLocaleString() || 0} บาท\n`;
      if (index < savingData.length - 1) {
        message += "\n";
      }
    });
  } else {
    message += "ไม่มีข้อมูลการออม\n";
  }

  // แสดงสรุปภาพรวม
  message += "\n────────────\n\n";
  message += "📈 สรุปภาพรวม\n";
  const netWorth = (savingAmount || 0) - (debtAmount || 0);
  message += `💵 มูลค่าสุทธิ: ${netWorth.toLocaleString()} บาท\n`;
  message += `(เงินออม ${savingAmount?.toLocaleString() || 0} - หนี้สิน ${
    debtAmount?.toLocaleString() || 0
  })`;

  return message;
};

//เปลี่ยน rich menu กลับ (Logout)
const changeMenu = async (req, res) => {
  try {
    client.unlinkRichMenuFromUser("U528a3568c3cbe72a8979c5fd9e8c13b9");
    return res.status(200).send({ message: "success" });
  } catch (err) {
    return res
      .status(500)
      .send({ message: "Server error", error: err.message });
  }
};

module.exports = {
  webHook,
  pushMessage,
  register,
  changeMenu,
  login,
  Loging,
};
