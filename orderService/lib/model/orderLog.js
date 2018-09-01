/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const orderLog = sequelize.define('orderLog', {
    transactionId: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    transactionCreationTime: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    orderId: {
      type: DataTypes.STRING(64),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'order',
        key: 'orderId'
      }
    },
    brandId: {
      type: DataTypes.STRING(60),
      allowNull: false
    },
    brandLocationId: {
      type: DataTypes.STRING(60),
      allowNull: false
    },
    posVendorId: {
      type: DataTypes.STRING(60),
      allowNull: false
    },
    posId: {
      type: DataTypes.STRING(60),
      allowNull: false
    },
    orderStatus: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    posResponseStatus: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    posResponseCode: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    }
  }, {
    tableName: 'ORDERLOG',
    timestamps: false,
  });

  orderLog.associate = (models) => {
    models.orderLog.belongsTo(models.order,  {
      onDelete: 'NO ACTION',
      onUpdate: 'NO ACTION',
      foreignKey: 'orderId',
    });
  };

  return orderLog;
};
