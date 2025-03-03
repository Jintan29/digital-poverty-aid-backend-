'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class HelpMember extends Model {

    static associate(models) {
      HelpMember.belongsTo(models.MemberHousehold, { foreignKey: 'member_house_id' })
      HelpMember.hasMany(models.Log, { foreignKey: 'record_id' })
    }
  }
  HelpMember.init({
    capital: DataTypes.STRING,
    components: DataTypes.STRING,
    help_name: DataTypes.STRING,
    amount: DataTypes.FLOAT,
    description: DataTypes.TEXT,
    agency: DataTypes.STRING,
    help_date: DataTypes.DATE,
    member_house_id: DataTypes.INTEGER,
    editBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    freezeTableName: true,
    modelName: 'HelpMember',
  });
  return HelpMember;
};