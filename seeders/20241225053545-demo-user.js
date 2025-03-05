'use strict';
const bcrypt = require("bcrypt")
require('dotenv').config();


/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const adminPass = process.env.ADMIN_PASS

    const hashedPassword  =  bcrypt.hashSync(adminPass,10)
    
    await queryInterface.bulkInsert('User',[
      {
        email:'sradss.digitalproverty@gmail.com',
        username:'admin',
        password:hashedPassword,
        title:'นาย',
        fname:'แอดมิน',
        lname:'ทำงานดี',
        phone:'0123456789',
        role:'superAdmin',
        status:'ทีมวิจัย',
        createdAt: new Date(),
        updatedAt: new Date()
      }
  ])

  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('User', { email: 'sradss.digitalproverty@gmail.com' }, {});
  }
};
