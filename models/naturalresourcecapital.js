'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Naturalresourcecapital extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Naturalresourcecapital.belongsTo(models.Form, { foreignKey: 'formId' });
      Naturalresourcecapital.hasMany(models.PBresourceforlive,{foreignKey:'national_res_id'})
      Naturalresourcecapital.hasMany(models.PBresourceforincome,{foreignKey:'national_res_id'})
      Naturalresourcecapital.hasMany(models.Farmlandindisasterareas,{foreignKey:'national_res_id'})
      Naturalresourcecapital.hasMany(models.HouseInDisasterAreas,{foreignKey:'national_res_id'})
    }
  }
  Naturalresourcecapital.init({
    formId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  }, {
    sequelize,
    freezeTableName: true,
    modelName: 'Naturalresourcecapital',
    tableName: 'Naturalresourcecapital'
  });
  return Naturalresourcecapital;
};