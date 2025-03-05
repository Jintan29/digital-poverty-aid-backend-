const { where } = require("sequelize");
const db = require("../models");
const PDFDocument = require("pdfkit");
const dayjs = require("dayjs");

const log_model = db.Log;
const nonAgiIncome_model = db.NonAGIincome;
const user_model = db.User;
const householdexpenses_model = db.Householdexpenses;
const saving_model = db.Saving;
const creditsources_model = db.Creditsources;
const memberHouse_model = db.MemberHousehold;
const physical_model = db.PhysicalCapital;
const agi_financial_model = db.AGIFinancial;
const household_model = db.Household;
const member_finan_model = db.MemberFinancial;
const socialWelfare_model = db.SocialWelfare;
const career_model = db.Career;
const help_member_model = db.HelpMember;

exports.getLog = () => {
  try {
    return log_model.findAll();
  } catch (err) {
    return err;
  }
};

exports.createLog = async (userId, action, tableName, recordId, house_code) => {
  try {
    await log_model.create({
      user_id: userId,
      action: action,
      table_name: tableName,
      record_id: recordId,
      house_code:house_code,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error logging action:", error);
  }
};

// Service: listLog.js
exports.listLog = async (userId, paginationOptions) => {
  try {
    // ดึงข้อมูลทั้งหมดโดยไม่ส่ง options pagination
    const lognonAgiIncome = await log_model.findAll({
      where: {
        user_id: userId,
        table_name: "NonAGIincome",
      },
      include: [
        {
          model: user_model,
          attributes: ["fname", "lname", "role", "status"]
        },
        {
          model: nonAgiIncome_model,
          where: db.sequelize.where(
            db.sequelize.col("NonAGIincome.id"),
            "=",
            db.sequelize.col("Log.record_id")
          ),
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const logAGIFinancial = await log_model.findAll({
      where: {
        user_id: userId,
        table_name: "AgiFinancial",
      },
      include: [
        {
          model: user_model,

          attributes: ["fname", "lname", "role", "status"]
        },
        {
          model: agi_financial_model,
          required: false,
        },
      ],

      order: [['createdAt', 'DESC']],
    });

    const logHouseholdexpenses = await log_model.findAll({
      where: {
        user_id: userId,
        table_name: "Householdexpenses",
      },
      include: [
        {
          model: user_model,
          attributes: ["fname", "lname", "role", "status"]

        },
        {
          model: householdexpenses_model,
          as: "Householdexpense",
          required: false,
        },
      ],

      order: [['createdAt', 'DESC']],

    });

    const logSaving = await log_model.findAll({
      where: {
        user_id: userId,
        table_name: "Saving",
      },
      include: [
        {
          model: user_model,
          attributes: ["fname", "lname", "role", "status"]
        },
        {
          model: saving_model,
          where: db.sequelize.where(
            db.sequelize.col("Saving.id"),
            "=",
            db.sequelize.col("Log.record_id")
          ),
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const logCreditsources = await log_model.findAll({
      where: {
        user_id: userId,
        table_name: "Creditsources",
      },
      include: [
        {
          model: user_model,
          attributes: ["fname", "lname", "role", "status"]
        },
        {
          model: creditsources_model,
          required: false,
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const logMember = await log_model.findAll({
      where: {
        user_id: userId,
        table_name: "MemberHousehold",
      },
      include: [
        {
          model: user_model,
          attributes: ["fname", "lname", "role", "status"]
        },
        {
          model: memberHouse_model,
          required: false,
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const logPhysicalCapital = await log_model.findAll({
      where: {
        user_id: userId,
        table_name: "PhysicalCapital",
      },
      include: [
        {
          model: user_model,
          attributes: ["fname", "lname", "role", "status"]
        },
        {
          model: physical_model,
          required: false,
        },
      ],

      order: [['createdAt', 'DESC']],
    });

    const logHousehold = await log_model.findAll({
      where: {
        user_id: userId,
        table_name: "Household",
      },
      include: [
        {
          model: user_model,
          attributes: ["fname", "lname", "role", "status"]
        },
        {
          model: household_model,
          required: false,
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const logMemberFinancial = await log_model.findAll({
      where: {
        user_id: userId,
        table_name: "MemberFinancial",
      },
      include: [
        {
          model: user_model,
          attributes: ["fname", "lname", "role", "status"]
        },
        {
          model: member_finan_model,
          required: false,
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const logSocialWelfare = await log_model.findAll({
      where: {
        user_id: userId,
        table_name: "SocialWelfare",
      },
      include: [
        {
          model: user_model,
          attributes: ["fname", "lname", "role", "status"]
        },
        {
          model: socialWelfare_model,
          required: false,
        },
      ],
      order: [['createdAt', 'DESC']],

    });

    const logCarreer = await log_model.findAll({
      where: {
        user_id: userId,
        table_name: "Career",
      },
      include: [
        {
          model: user_model,
          attributes: ["fname", "lname", "role", "status"]
        },
        {
          model: career_model,
          required: false,
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const logHelpMember = await log_model.findAll({
      where: {
        user_id: userId,
        table_name: "HelpMember",
      },
      include: [
        {
          model: user_model,
          attributes: ["fname", "lname", "role", "status"]
        },
        {
          model: help_member_model,
          required: false,
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    // รวมข้อมูลจากทุก category เข้าด้วยกัน
    let allLogs = [
      ...lognonAgiIncome,
      ...logAGIFinancial,
      ...logHouseholdexpenses,
      ...logSaving,
      ...logCreditsources,
      ...logMember,
      ...logPhysicalCapital,
      ...logHousehold,
      ...logMemberFinancial,
      ...logSocialWelfare,
      ...logCarreer,
      ...logHelpMember,
    ];

    // จัดเรียงข้อมูลตาม createdAt แบบ DESC
    allLogs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // ถ้ามีการส่ง paginationOptions ให้ทำ slicing ตาม limit และ offset
    if (paginationOptions && paginationOptions.limit && paginationOptions.offset !== undefined) {
      const paginatedLogs = allLogs.slice(paginationOptions.offset, paginationOptions.offset + paginationOptions.limit);
      return { total: allLogs.length, logs: paginatedLogs };
    } else {
      return { total: allLogs.length, logs: allLogs };
    }
  } catch (err) {
    throw new Error(err.message);
  }
};

exports.listAction = async (userId) => {
  try {
    const allLogs = await log_model.findAll({
      where: {
        user_id: userId,
      },
      order: [["createdAt", "DESC"]],
    });

    return allLogs;
  } catch (err) {
    throw new Error(err.message);
  }
};

exports.buildSummaryPDF = async (dataCallback, endCallback, actionLogs,user) => {
  try {
    // console.log(user);
    
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    });

    doc.on("data", dataCallback);
    doc.on("end", endCallback);

    // Load fonts
    const normal = "fonts/THSarabunNew.ttf";
    const bold = "fonts/THSarabunNew Bold.ttf";
    doc.font(normal);
    doc.font(bold);

    // Add logo
    doc.image("images/Logo.png", 50, 30, { fit: [70, 70] }).stroke();

    // Add header
    doc
      .font(bold)
      .fontSize(20)
      .text("ระบบรายงานความช่วยเหลือ (Exclusive Summary Report)", 130, 50, {
        align: "left",
      });

    doc
      .font(bold)
      .fontSize(14)
      .text(`ตำแหน่ง : ${user.status}   ${user.title} ${user.fname} ${user.lname}`, 130, 80, {
        align: "left",
      });

    // Table configuration
    const startX = 50;
    let startY = 120;
    const rowHeight = 30;
    const colWidths = [50, 250, 110, 80];

    //ข้อมูลในตารางที่จะแสดงผล
    const tableData = [
      ["ลำดับ", "กิจกรรมที่ทำการช่วยเหลือ", "วันที่", "เวลา"],
      ...actionLogs.results.map((log, index) => {
        
        const date = new Date(log.createdAt);
        const thaiMonths = [
          "ม.ค", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
          "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
        ];

        //แปลงวันที่ภาษาไทย
        const day = date.getDate();
        const month = thaiMonths[date.getMonth()];
        const year = date.getFullYear() + 543;

        return [
          (index + 1).toString(),
          `${log.action} ( ${log.house_code} )` ,
          `${day} ${month} ${year}`,
          dayjs(date).format("HH:mm")
        ];
      }),
    ];

    //วาดาราง
    function drawTable() {
      tableData.forEach((row, rowIndex) => {
        // [] ก้อนใหญ่

        //ตรวจสอบว่าถึงขอบล่างหรือยัง
        if (startY + rowHeight > doc.page.height - doc.page.margins.bottom) {
          doc.addPage();
          startY = 50;
        }

        //เริ่มวาดตาราง
        let x = startX;
        row.forEach((cell, colIndex) => {
          // [] ก้อนเล็กหลายๆก้อนที่อยู่ด้านใน
          doc.rect(x, startY, colWidths[colIndex], rowHeight).stroke();

          //row แรกเป็นตัวหนา
          if (rowIndex === 0) {
            doc
              .font(bold)
              .fontSize(14)
              .text(cell, x + 5, startY + 8, {
                width: colWidths[colIndex] - 10,
                align: "left",
              });
          } else {
            doc
              .font(normal)
              .fontSize(12)
              .text(cell, x + 5, startY + 8, {
                width: colWidths[colIndex] - 10,
                align: "left",
              });
          }

          x += colWidths[colIndex];

        });

        startY += rowHeight;

      });
    }

    drawTable();
    doc.end();

  } catch (err) {
    throw new Error(err.message);
  }
};

