const { Order, Order_product, Product, Cart, User } = require('../../models');

const { checkoutSchema } = require('../utils/schema/orderSchema');

exports.checkout = async (req, res) => {
  try {
    const { name, email, address, phone, postCode, products } = req.body;
    const payload = { name, email, address, phone, postCode };
    const user_id = req.user.id;

    const { error } = checkoutSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        status: 400,
        message: error.details[0].message,
      });
    }

    const resultOrdered = await Order.create({
      ...payload,
      user_id,
      attachment: req.files.imageFile[0].filename,
    });

    products.map(async (product) => {
      let item = product.split(',');
      let product_id = item[0];
      let qtyProductNew = item[1];
      const rest = await Order_product.create({
        product_id,
        orderQuantity: qtyProductNew,
        order_id: resultOrdered.id,
      });

      let resultProduct = await Product.findOne({
        where: { id: product_id },
        attributes: ['stock'],
      });
      const newStock = resultProduct.stock - qtyProductNew;
      await Product.update({ stock: newStock }, { where: { id: product_id } });
    });

    await Cart.sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, {
      raw: true,
    });

    const resultDelete = await Cart.destroy({ where: { user_id } });

    if (!resultDelete) {
      return res.status(404).json({
        status: 404,
        message: 'Order Not Found!',
      });
    }

    res.status(200).json({
      status: 200,
      message: 'Successfully Ordered!',
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

exports.getTransactions = async (req, res) => {
  try {
    let { rows, count } = await Order.findAndCountAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'fullname', 'email'],
        },
        {
          model: Order_product,
          as: 'products',
          include: [
            {
              model: Product,
              as: 'orders_products',
              attributes: ['name', 'photo', 'price', 'description'],
            },
          ],
          attributes: [['product_id', 'id'], 'orderQuantity'],
        },
      ],
      attributes: {
        exclude: ['createdAt', 'updatedAt', 'user_id'],
      },
      order: [['createdAt', 'DESC']],
    });

    let resultOrders = JSON.parse(JSON.stringify(rows));

    resultOrders = resultOrders.map((order) => {
      let newProducts = order.products.map((product) => {
        return {
          id: product.id,
          orderQuantity: product.orderQuantity,
          ...product.orders_products,
        };
      });

      return { ...order, products: newProducts };
    });

    res.status(200).json({
      status: 200,
      message: 'Successfully!',
      countData: resultOrders.length,
      data: resultOrders,
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

// exports.getMyTransactions = async (req, res) => {
//   try {
//     const user_id = req.user.id;


//     res.status(200).json({
//       status: 200,
//       message: 'Successfully!',
//       data: resultOrders,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({
//       status: 500,
//       message: 'Internal Server Error',
//       error,
//     });
//   }
// };
