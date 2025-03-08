const express = require('express');
require('dotenv').config();
const router = express.Router();
const LineOAController = require('../../controllers/LineOA/LineOA.controller')



router
    .post('/webhook', 
        express.json(),
        LineOAController.webHook
    )
    .get('/push',LineOAController.pushMessage)
    .post('/register',LineOAController.register)
    .post('/login',LineOAController.login)
    .get('/change-rich',LineOAController.changeMenu)
    .get('/log/:month/:year',LineOAController.Loging)

module.exports = router;