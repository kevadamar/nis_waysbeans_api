const { Cart, User, Product, sequelize } = require('../../models');
const { QueryTypes } = require('sequelize');
const { Op } = require('sequelize');
const { baseUrlImage } = require('../utils/config');

exports.addCart = async (req, res) => {
  try {
    const user_id = req.user.id;
    const product_id = req.params.product_id;
    let total_price = 0,
      qty = 0;

    let resultCart = await Cart.findOne({
      where: {
        user_id,
        product_id,
      },
    });

    let resultProduct = await Product.findOne({
      where: {
        id: product_id,
        stock: { [Op.gt]: { stock: 0 } },
      },
    });

    if (!resultProduct) {
      return res.status(404).json({
        status: 404,
        message: 'Failed Add Cart. Product not found!',
      });
    }

    // add to cart jika user belum memasukkan ke cart

    if (!resultCart) {
      const resultAddToCart = await Cart.create({
        user_id,
        product_id,
        total_price: resultProduct.price,
      });

      return res.status(200).json({
        status: 200,
        message: 'Successfully Added TO Cart!',
      });
    }

    if (resultCart.qty === resultProduct.stock) {
      return res.status(200).json({
        status: -1,
        message: `Stok barang ini sisa ${resultProduct.stock} dan kamu sudah punya ${resultCart.qty} di keranjangmu.`,
      });
    }

    // add qty item dan recalculate total price
    qty = resultCart.qty + 1;
    total_price = resultProduct.price + resultCart.total_price;

    await Cart.update(
      { qty, total_price },
      {
        where: {
          user_id,
          product_id,
        },
      },
    );

    res.status(200).json({
      status: 200,
      message: 'Successfully Added qty item Cart!',
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 500,
      message: 'Internal Server Error',
      error,
    });
  }
};

exports.minusCart = async (req, res) => {
  try {
    const user_id = req.user.id;
    const product_id = req.params.product_id;
    let total_price = 0,
      qty = 0;

    let resultCart = await Cart.findOne({
      where: {
        user_id,
        product_id,
      },
    });

    let resultProduct = await Product.findOne({
      where: {
        id: product_id,
      },
    });

    if (!resultProduct) {
      return res.status(404).json({
        status: 404,
        message: 'Failed Minus Cart. Product not found!',
      });
    }

    // add to cart jika user belum memasukkan ke cart

    if (!resultCart) {
      return res.status(404).json({
        status: 404,
        message: 'Failed Minus Cart. Cart not found!',
      });
    }

    // add qty item dan recalculate total price
    qty = resultCart.qty - 1;
    total_price = resultCart.total_price - resultProduct.price;

    if (qty === 0) {
      await Cart.destroy({ where: { user_id, product_id } });
    } else {
      await Cart.update(
        { qty, total_price },
        {
          where: {
            user_id,
            product_id,
          },
        },
      );
    }

    res.status(200).json({
      status: 200,
      message: 'Successfully Minus qty item Cart!',
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 500,
      message: 'Internal Server Error',
      error,
    });
  }
};

exports.getDetailCart = async (req, res) => {
  try {
    const user_id = req.user.id;

    let resultDetailCart = await Cart.findAll({
      where: { user_id },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['name', 'photo', ['price', 'product_price']],
        },
      ],
      attributes: {
        exclude: ['updatedAt'],
      },

      order: [['createdAt', 'DESC']],
    });

    let totalPrice = 0;
    resultDetailCart = JSON.parse(JSON.stringify(resultDetailCart));

    resultDetailCart = resultDetailCart.map((cart) => {
      totalPrice += parseInt(cart.total_price);
      const newProduct = {
        ...cart.product,
        photo: !cart.product.photo
          ? null
          : `${baseUrlImage}${cart.product.photo}`,
      };

      return {
        id: cart.id,
        user_id: cart.user_id,
        product_id: cart.product_id,
        ...newProduct,
        qty: cart.qty,
        total_price: cart.total_price,
        createdAt: cart.createdAt,
      };
    });

    res.status(200).json({
      data: {
        totalPrice,
        detailCarts: resultDetailCart,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 500,
      message: 'Internal Server Error',
      error,
    });
  }
};

exports.getCountCart = async (req, res) => {
  try {
    const user_id = req.user.id;
    const strQuery = `SELECT IFNULL(SUM(qty),0) AS countCart FROM cart WHERE user_id = ${user_id}`;
    const countCart = await sequelize.query(strQuery, {
      type: QueryTypes.SELECT,
    });

    let resultCarts = await Cart.findAll({
      where: {
        user_id,
      },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['stock'],
        },
      ],
      attributes: ['qty'],
    });

    resultCarts = JSON.parse(JSON.stringify(resultCarts));
    resultCarts = resultCarts.map((cart) => ({
      qty: cart.qty,
      max_stock: cart.product.stock,
    }));

    const newCount = { ...countCart[0] };

    const data = {
      countCart: parseInt(newCount.countCart),
      detailCarts: resultCarts,
    };
    res.status(200).json({
      status: 200,
      message: 'Success',
      data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 500,
      message: 'Internal Server Error',
      error,
    });
  }
};

exports.deleteCart = async (req, res) => {
  try {
    const cart_id = req.params.cart_id;
    const user_id = req.user.id;
    console.log(cart_id, user_id);

    await Cart.sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, {
      raw: true,
    });

    const resultDelete = await Cart.destroy({
      where: { id: cart_id, user_id },
    });

    if (!resultDelete) {
      return res.status(404).json({
        status: 404,
        message: 'Cart Not Found!',
      });
    }

    res.status(200).json({
      status: 200,
      message: 'Successfully Deleted Cart!',
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 500,
      message: 'Internal Server Error',
      error,
    });
  }
};
