const log_service = require("../services/log.service");
const db = require('../models')
const user_model = db.User;

const getLoglist = async (req, res) => {
  await log_service
    .getLog()
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



const listAction = async (req, res) => {
  try {
    //แก้เป็นให้ดูของคนอื่นก็ได้
    const userId = req.user.id;

    const logs = await log_service.listAction(userId);

    return res.status(200).send({
      message: "success",
      results: logs,
    });

  } catch (err) {
    return res.status(500).send({
      message: "Server error",
      error: err.message,
    });
  }
};

const SummaryReport = async(req,res)=>{
  try{
    const userId= req.user.id

    //get logs
    const logs = await log_service.listAction(userId)

    //get user 
    const user = await user_model.findByPk(userId)
    user.toJSON()
    
    if (!logs || logs.length === 0) {
      return res.status(404).send({
        message: "No logs found",
      });
    }

    // แปลงข้อมูลให้อยู่ในรูปแบบเดียวกับ listAction response
    const formattedLogs = {
      message: "success",
      results: logs.map(log => ({
        id: log.id,
        user_id: log.user_id,
        action: log.action,
        house_code: log.house_code,
        table_name: log.table_name,
        record_id: log.record_id,
        createdAt: log.createdAt,
        updatedAt: log.updatedAt
      }))
    };

    //response PDF
    res.writeHead(200,{
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment;filename=summary-report.pdf'
    })

    //Generate PDF
    await log_service.buildSummaryPDF(
      (chunk) => res.write(chunk),
      () => res.end(),
      formattedLogs,
      user
    )

  }catch(err){
    // ตรวจสอบว่า headers ยังไม่ถูกส่งก่อนส่ง error response
    if (!res.headersSent) {
      res.status(500).send({
        message: "Server error",
        error: err.message
      });
    }
  }
}


// Controller: logController.js
const listLog = async (req, res) => {
    try {
        const userId = req.params.id;
        // อ่าน query parameters สำหรับ pagination
        let { page = 1, limit = "all" } = req.query;
        let options = {};

        // ถ้า limit ไม่ใช่ "all" ให้แปลงเป็นตัวเลขและคำนวณ offset
        if (limit !== "all") {
            limit = parseInt(limit);
            page = parseInt(page);
            options.limit = limit;
            options.offset = (page - 1) * limit;
        }

        const logsData = await log_service.listLog(userId, options);
        const user = await user_model.findByPk(userId,{
          attributes:{exclude:['password']}
        })
        return res.status(200).send({
            message: "success",
            user,
            result: logsData // ส่งทั้ง total และ logs
        });
    } catch (err) {
        return res.status(500).send({
            message: "Server error",
            error: err.message
        });
    }
};


module.exports = {
  getLoglist,
  listLog,
  listAction,
  SummaryReport
};
