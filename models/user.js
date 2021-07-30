'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.belongsTo(models.Role, {
        as: 'role',
        foreignKey: 'role_id',
      });

      User.hasMany(models.Cart, {
        as: 'carts',
        foreignKey: 'user_id',
      });

      User.hasMany(models.Order, {
        as: 'orders',
        foreignKey: 'user_id',
      });
    }
  }
  User.init(
    {
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      fullname: DataTypes.STRING,
      photo: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'user',
    },
  );
  return User;
};
