const ExportService = require("../services/ExportExcel.service");
const logService = require("../services/log.service");

const householdList = async (req, res) => {
  await ExportService.householdList()
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

const gethousehold = async (req, res) => {
  try {
    const data = await ExportService.gethousehold();
    res.status(200).json({
      data: data,
      msg: "success",
      status: 200,
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

const getFindhousehold = async (req, res) => {
  try {
    const { year, houseCode, subdistrict, district, page, getAll } = req.query;
    const pageNum = parseInt(page) || 1;
    const getAllData = getAll === "true"; // ✅ แปลงค่า getAll เป็น Boolean

    const data = await ExportService.getFindHouseHold(
      year,
      houseCode,
      subdistrict,
      district,
      pageNum,
      10,
      getAllData
    );

    if (getAllData) {
      //log
      const user_id = req.user.id;
      await logService.createLog(user_id, "นำออกข้อมูล Excel", "Household", 1);

      // ✅ สร้างไฟล์ Excel และส่งคืนให้ดาวน์โหลด
      const ExcelJS = require("exceljs");
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Household Data");

      // ✅ กำหนดคอลัมน์และความกว้าง
      worksheet.columns = [
        { header: "ปีที่สำรวจ", key: "surveyDate", width: 15 },
        { header: "ชื่อ-นามสกุล", key: "name", width: 25 },
        { header: "HC", key: "housecode", width: 15 },
        { header: "จำนวนสมาชิก", key: "members", width: 15 },
        { header: "ที่อยู่", key: "address", width: 30 },
      ];

      // ✅ เพิ่มข้อมูลลงไป และจัดข้อความให้อยู่ตรงกลาง
      data.data.forEach((row) => {
        const newRow = worksheet.addRow(row);
        newRow.eachCell((cell) => {
          cell.alignment = { horizontal: "center", vertical: "middle" };
        });
      });

      // ✅ จัดให้ Header อยู่ตรงกลางด้วย
      worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
        cell.alignment = { horizontal: "center", vertical: "middle" };
      });

      const buffer = await workbook.xlsx.writeBuffer();
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=HouseholdData.xlsx"
      );
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      return res.send(buffer);
    }

    res.status(200).json({
      data: data.data,
      pagination: {
        totalItems: data.totalItems,
        totalPages: data.totalPages,
        currentPage: data.currentPage,
      },
      msg: "success",
      status: 200,
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

const getYears = async (req, res) => {
  try {
    const years = await ExportService.getAvailableYears();
    res.status(200).json({ years });
  } catch (error) {
    res.status(500).json({
      msg: "Error fetching years",
      error: error.message,
    });
  }
};

const log = async (req, res) => {
  try {
    const user_id = req.user.id;
    await logService.createLog(user_id, "นำออกข้อมูล Excel", "Household", 1);
  } catch (err) {
    return res.status(500).send({ message: "Sever error", error: err.message });
  }
};

module.exports = {
  householdList,
  gethousehold,
  getFindhousehold,
  getYears,
  log,
};
