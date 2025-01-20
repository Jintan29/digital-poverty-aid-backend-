'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    
    static associate(models) {
      User.hasMany(models.RefreshToken,{foreignKey:'user_id'})
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