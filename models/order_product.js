'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order_product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Order_product.belongsTo(models.Order, {
        as: 'order',
        foreignKey: 'order_id',
      });
      Order_product.belongsTo(models.Product, {
        as: 'orders_products',
        foreignKey: 'product_id',
      });
    }
  }
  Order_product.init(
    {
      product_id: DataTypes.INTEGER,
      order_id: DataTypes.INTEGER,
      orderQuantity: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'Order_product',
      tableName: 'order_product',
    },
  );
  return Order_product;
};
