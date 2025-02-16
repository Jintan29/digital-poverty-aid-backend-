'use strict';
const {
  Model,
  DataTypes
} = require('sequelize');
module.exports = (sequelize) => {
  class MemberHousehold extends Model {

    static associate(models) {
      MemberHousehold.belongsTo(models.Form,{foreignKey:'form_id'}),
      MemberHousehold.belongsTo(models.Household,{foreignKey:'houseId'})
      MemberHousehold.hasMany(models.SocialWelfare,{foreignKey:'member_house_id'})
      MemberHousehold.hasMany(models.MemberFinancial,{foreignKey:'member_house_id'})
      MemberHousehold.hasMany(models.Career,{foreignKey:'member_house_id'})
      MemberHousehold.belongsTo(models.User,{
        foreignKey: 'editBy',
        onDelete: 'SET NULL',     
        onUpdate: 'CASCADE',      
      })
      MemberHousehold.hasMany(models.AdminLog,{foreignKey:'record_id'})
    }

  }
  MemberHousehold.init({
    title: { 
      type: DataTypes.STRING,
      allowNull: false,
    },
    fname: { 
      type: DataTypes.STRING,
      allowNull: false,
    },
    lname: { 
      type: DataTypes.STRING,
      allowNull: false,
    },
    sex:{ 
      type: DataTypes.STRING,
      allowNull: false,
    },
    national_id: { 
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: { 
      type: DataTypes.STRING,
      allowNull: false,
    },
    age_yaer:{ 
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    age_month:{ 
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    birthdate: {
      type: DataTypes.DATEONLY, // ใช้ DATEONLY สำหรับการเก็บวันเกิด
      allowNull: false, // หรือ false ถ้าต้องการให้วันเกิดเป็นข้อมูลที่ต้องกรอก
    },
    status_in_house: { 
      type: DataTypes.STRING,
      allowNull: false,
    },
    health: { 
      type: DataTypes.STRING,
      allowNull: false,
    },
    work_can_made_income: {
      type: DataTypes.ARRAY(DataTypes.STRING), 
      allowNull: false,
    },
    //แก้ไข
    max_education: { 
      type: DataTypes.STRING,
      allowNull: false,
    },
    current_edu_level: { 
      type: DataTypes.STRING,
      allowNull: false,
    },
    edu_status: { 
      type: DataTypes.STRING,
      allowNull: false,
    },
    work_status: { 
      type: DataTypes.STRING,
      allowNull: false,
    },
    can_write_TH: { 
      type: DataTypes.STRING,
      allowNull: false,
    },
    can_read_TH: { 
      type: DataTypes.STRING,
      allowNull: false,
    },
    can_speak_TH: { 
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_leader: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, 
    },
    still_poor: {
      type: DataTypes.BOOLEAN,
      defaultValue: true, 
    },
    houseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    editBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    form_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    }
  }, {
    sequelize,
    freezeTableName: true,
    modelName: 'MemberHousehold',
  });
  return MemberHousehold;
};