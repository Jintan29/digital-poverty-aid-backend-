'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MemberFinancial extends Model {

    static associate(models) {
      MemberFinancial.belongsTo(models.MemberHousehold,{foreignKey:'member_house_id'})
      MemberFinancial.hasMany(models.AdminLog,{foreignKey:'record_id'})
    }
  }
  MemberFinancial.init({
    agv_income: DataTypes.FLOAT,
    avg_expenses:DataTypes.FLOAT,
    inflation: DataTypes.FLOAT,
    member_house_id: DataTypes.INTEGER,
    editBy: {
      type: DataTypes.INTEGER,
      allowNull: true, 
    }
  }, {
    sequelize,
    freezeTableName:true,
    modelName: 'MemberFinancial',
  });
  return MemberFinancial;
};