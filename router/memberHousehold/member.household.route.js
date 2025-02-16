const express = require('express');
const router = express.Router();
const MemberHousController = require('../../controllers/MemberHousehold.controller')
const { auth,allowRole } = require('../../middleware/auth')


router
    //CRUD
    .get("/lists",auth, MemberHousController.List)
    .get("/findOne/:id",auth, MemberHousController.findOneMember)
    .post("/create",auth, MemberHousController.create)
    .put("/update/:id",auth, MemberHousController.updateMember)
    .delete("/delete/:id",auth, MemberHousController.deleteMember)

    //Others
    .get('/findByAge/:minAge/:maxAge',auth,MemberHousController.findByAge)
    .get('/search-by-name',auth,MemberHousController.searchByName)
    .get('/search-by-houseCode',auth,MemberHousController.searchByHouseCode)
    .get('/findCapital/:id',auth,MemberHousController.findCapital) 
    .get("/count", MemberHousController.conuntMemberHousehold)
    .post("/create-capital", MemberHousController.createCombined)
    .get("/district-count", MemberHousController.getMembersCountByDistrict)

    //TEST
    .put('/update-log/:id',auth,MemberHousController.updateMemberLog)
module.exports = router;