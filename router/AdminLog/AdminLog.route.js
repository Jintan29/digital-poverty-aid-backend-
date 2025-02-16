const express = require('express');
const router = express.Router();
const AdminLogController = require('../../controllers/AdminLog.controller');
const { auth } = require('../../middleware/auth');


router
    .get('/list',auth,AdminLogController.listLog)


module.exports = router