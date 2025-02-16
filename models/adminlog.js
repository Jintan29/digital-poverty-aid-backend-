'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AdminLog extends Model {

    static associate(models) {
      AdminLog.belongsTo(models.User,{foreignKey:'user_id'})
      AdminLog.belongsTo(models.MemberHousehold, {
        foreignKey: 'record_id',
        constraints: false  
      });
      AdminLog.belongsTo(models.MemberFinancial, {
        foreignKey: 'record_id',
        constraints: false  
      });
    }
  }
  AdminLog.init({
    user_id: DataTypes.INTEGER,
    action: DataTypes.STRING,
    table_name: DataTypes.STRING,
    record_id: DataTypes.INTEGER,
  }, {
    sequelize,
    freezeTableName: true,
    modelName: 'AdminLog',
  });
  return AdminLog;
};