'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Cart extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Cart.belongsTo(models.User, {
        as: 'user',
        foreignKey: 'user_id',
      });

      Cart.belongsTo(models.Product, {
        as: 'product',
        foreignKey: 'product_id',
      });
    }
  }
  Cart.init(
    {
      user_id: DataTypes.INTEGER,
      product_id: DataTypes.INTEGER,
      qty: DataTypes.INTEGER,
      total_price: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'Cart',
      tableName: 'cart',
    },
  );
  return Cart;
};
