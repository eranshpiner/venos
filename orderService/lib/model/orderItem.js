/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const orderItem = sequelize.define('orderItem', {
    itemId: {
      type: DataTypes.STRING(30),
      allowNull: false,
      primaryKey: true
    },
    itemName: {
      type: DataTypes.STRING(150),
      allowNull: false,
      primaryKey: true
    },
    categoryId: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    price: {
      type: "DOUBLE",
      allowNull: false
    },
    unitPrice: {
      type: "DOUBLE",
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
    remarks: {
      type: DataTypes.STRING(200),
      allowNull: true
    }
  }, {
    tableName: 'ORDERITEMS',
    timestamps: false,
  });
  orderItem.associate = (models) => {
    models.order.hasMany(models.orderItem,  {
      onDelete: 'NO ACTION',
      onUpdate: 'NO ACTION',
      foreignKey: 'orderId',
    });
  };

  return orderItem;
};
