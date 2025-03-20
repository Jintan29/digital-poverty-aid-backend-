const express = require('express');
const router = express.Router();
const ExportExcelController = require('../../controllers/ExportExcel.controller');
const { auth } = require('../../middleware/auth');

router
    .get("/get", ExportExcelController.householdList)
    .get("/gethousehold", ExportExcelController.gethousehold)
    .get("/getFind",auth, ExportExcelController.getFindhousehold)
    .get("/getYears",auth, ExportExcelController.getYears)
    .get('/log',auth,ExportExcelController.log)
module.exports = router;