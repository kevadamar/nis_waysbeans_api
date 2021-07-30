const { Cart, User, Product, sequelize } = require('../../models');
const { QueryTypes } = require('sequelize');
const { Op } = require('sequelize');

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

    //
    const strQuery = `SELECT c.user_id,c.product_id,SUM(c.total_price) AS total_price_cart, SUM(c.qty) AS qty, (SELECT name FROM product WHERE id = c.product_id) AS name, (SELECT photo FROM product WHERE id = c.product_id) AS photo FROM cart c WHERE c.user_id = ${user_id} AND product_id in (SELECT id FROM product) GROUP BY c.product_id`;

    const resultDetailCart = await sequelize.query(strQuery, {
      type: QueryTypes.SELECT,
    });

    let totalPrice = 0;
    resultDetailCart.map((cart) => {
      totalPrice += parseInt(cart.total_price_cart);
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
    res.status(200).json({
      status: 200,
      message: 'Success',
      data: { ...countCart[0] },
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
