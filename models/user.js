'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    
    static associate(models) {
      User.hasMany(models.Token,{foreignKey:'user_id'})
      //สำหรับแก้ไข / เพิ่มข้อมูลในหน้า admin
      User.hasMany(models.Career,{
        foreignKey: 'editBy',
        onDelete: 'SET NULL',  
        onUpdate: 'CASCADE',
      })
      User.hasMany(models.MemberHousehold,{
        foreignKey: 'editBy',
        onDelete: 'SET NULL',  
        onUpdate: 'CASCADE',
      })
      User.hasMany(models.SocialWelfare,{
        foreignKey: 'editBy',
        onDelete: 'SET NULL',  
        onUpdate: 'CASCADE',
      })
      User.hasMany(models.MemberFinancial,{
        foreignKey: 'editBy',
        onDelete: 'SET NULL',  
        onUpdate: 'CASCADE',
      })
      User.hasMany(models.AdminLog,{foreignKey:'user_id'})
    }
  }
  User.init({

    email: DataTypes.STRING,
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    title: DataTypes.STRING,
    fname: DataTypes.STRING,
    lname: DataTypes.STRING,
    phone: DataTypes.STRING,
    role: DataTypes.STRING,
    status: DataTypes.STRING,
    approveBy: DataTypes.INTEGER,
  }, {
    sequelize,
    freezeTableName: true,
    modelName: 'User',
  });
  return User;
};