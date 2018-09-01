/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const order = sequelize.define('order', {
    orderId: {
      type: DataTypes.STRING(64),
      allowNull: false,
      primaryKey: true
    },
    total: {
      type: "DOUBLE",
      allowNull: false
    },
    subTotal: {
      type: "DOUBLE",
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    brandId: {
      type: DataTypes.STRING(60),
      allowNull: false
    },
    brandLocationId: {
      type: DataTypes.STRING(60),
      allowNull: false
    },
    tipPercentage: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: 0,
    },
    tipAmount: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: 0,
    },
    deliveryFee: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    orderCreationTime: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    firstName: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    city: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    street: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    houseNumber: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    apartment: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    floor: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    postalCode: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: 0,
    },
    company: {
      type: DataTypes.STRING(60),
      allowNull: true
    },
    remarks: {
      type: DataTypes.STRING(200),
      allowNull: true
    }
  }, {
    tableName: 'ORDER',
    timestamps: false,
  });

  return order;
};
