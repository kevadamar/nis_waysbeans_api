'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Order.hasMany(models.Order_product, {
        as: 'products',
        foreignKey: 'order_id',
      });

      Order.belongsTo(models.User, {
        as: 'user',
        foreignKey: 'user_id',
      });
    }
  }
  Order.init(
    {
      user_id: DataTypes.INTEGER,
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      address: DataTypes.TEXT,
      possCode: DataTypes.STRING,
      phone: DataTypes.STRING,
      attachment: DataTypes.STRING,
      status: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'Order',
      tableName: 'order',
    },
  );
  return Order;
};
