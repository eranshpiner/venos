/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('log', {
    orderId: {
      type: DataTypes.STRING(65),
      allowNull: false,
      references: {
        model: 'ORDER',
        key: 'orderId'
      }
    },
    transactionId: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    timestamp: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    errorCode: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    errorText: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    componentName: {
      type: DataTypes.STRING(100),
      allowNull: false
    }
  }, {
    tableName: 'LOG'
  });
};
