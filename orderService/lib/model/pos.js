/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('pos', {
    brandId: {
      type: DataTypes.STRING(45),
      allowNull: false,
      primaryKey: true
    },
    brandLocationId: {
      type: DataTypes.STRING(45),
      allowNull: false,
      primaryKey: true
    },
    posVendorId: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    posId: {
      type: DataTypes.STRING(45),
      allowNull: false
    }
  }, {
    tableName: 'POS',
    timestamps: false,
  });
};
