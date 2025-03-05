'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Log extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Log.belongsTo(models.User, { foreignKey: 'user_id' })
      Log.belongsTo(models.NonAGIincome, {
        foreignKey: 'record_id',
        constraints: false
      });
      Log.belongsTo(models.Householdexpenses, {
        foreignKey: 'record_id',
        constraints: false,
      });
      Log.belongsTo(models.Saving, {
        foreignKey: 'record_id',
        constraints: false
      });
      Log.belongsTo(models.Creditsources, {
        foreignKey: 'record_id',
        constraints: false
      });
      Log.belongsTo(models.PhysicalCapital, {
        foreignKey: 'record_id',
        constraints: false
      });
      Log.belongsTo(models.AGIFinancial, {
        foreignKey: 'record_id',
        constraints: false
      });
      Log.belongsTo(models.Household, {
        foreignKey: 'record_id',
        constraints: false
      });
      Log.belongsTo(models.MemberHousehold, {
        foreignKey: 'record_id',
        constraints: false
      });
      Log.belongsTo(models.MemberFinancial, {
        foreignKey: 'record_id',
        constraints: false
      });
      Log.belongsTo(models.SocialWelfare, {
        foreignKey: 'record_id',
        constraints: false
      });
      Log.belongsTo(models.Career, {
        foreignKey: 'record_id',
        constraints: false
      });
      Log.belongsTo(models.HelpMember, {
        foreignKey: 'record_id',
        constraints: false
      });
    }
  }
  Log.init({
    user_id: DataTypes.INTEGER,
    action: DataTypes.STRING,
    table_name: DataTypes.STRING,
    record_id: DataTypes.INTEGER,
    house_code: DataTypes.STRING
  }, {
    sequelize,
    freezeTableName: true,
    modelName: 'Log',
  });
  return Log;
};