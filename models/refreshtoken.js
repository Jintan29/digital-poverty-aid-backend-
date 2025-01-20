'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RefreshToken extends Model {

    static associate(models) {
      RefreshToken.belongsTo(models.User,{foreignKey:'user_id'})
    }
  }
  RefreshToken.init({
    user_id: DataTypes.INTEGER,
    token: DataTypes.STRING,
    is_revoked: DataTypes.BOOLEAN,
    expires_at: DataTypes.DATE
  }, {
    sequelize,
    freezeTableName: true,
    modelName: 'RefreshToken',
  });
  return RefreshToken;
};