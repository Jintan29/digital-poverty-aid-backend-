'use strict';
const { Model, DataTypes } = require('sequelize'); // เพิ่ม DataTypes ที่นี่

module.exports = (sequelize) => {
  class UnrestIn3Southern extends Model {
    static associate(models) {
      UnrestIn3Southern.belongsTo(models.Form, { foreignKey: 'form_id' });
    }
  }

  UnrestIn3Southern.init({
    effect: { type: DataTypes.STRING },
    urgent_to_do: { type: DataTypes.STRING },
    effect_in_life: { type: DataTypes.ARRAY(DataTypes.STRING) },
    effect_in_work: { type: DataTypes.ARRAY(DataTypes.STRING) },
    form_id: { type: DataTypes.INTEGER }
  }, {
    sequelize,
    modelName: 'UnrestIn3Southern',
    freezeTableName: true,
  });

  return UnrestIn3Southern;
};
