const { Op } = require('sequelize');
const { Order, Order_product, Product, Cart, User } = require('../../models');
const { baseUrlImage } = require('../utils/config');

const { checkoutSchema } = require('../utils/schema/orderSchema');

exports.checkout = async (req, res) => {
  try {
    const { name, email, address, phone, possCode, products } = req.body;
    const payload = { name, email, address, phone, possCode };
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
    const { id, fullname, email } = req.user;
    const isAdmin = id === 1 && true;
    const user = { id, fullname, email };

    let { rows, count } = await Order.findAndCountAll({
      where: {
        user_id: {
          [isAdmin ? Op.ne : Op.eq]: id,
        },
      },
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
        exclude: ['updatedAt', 'user_id'],
      },
      order: [['createdAt', 'DESC']],
    });

    let resultOrders = JSON.parse(JSON.stringify(rows));

    resultOrders = resultOrders.map((order) => {
      let totalPrice = 0;
      let newProducts = order.products.map((product) => {
        totalPrice += product.orders_products.price * product.orderQuantity;
        const newOrderProduct = {
          ...product.orders_products,
          name: product.orders_products.name,
          price: product.orders_products.price,
          description: product.orders_products.description,
          photo: `${baseUrlImage}${product.orders_products.photo}`,
        };
        return {
          id: product.id,
          orderQuantity: product.orderQuantity,
          ...newOrderProduct,
        };
      });

      return {
        ...order,
        attachment: `${baseUrlImage}${order.attachment}`,
        totalPrice,
        products: newProducts,
      };
    });

    resultOrders = isAdmin
      ? resultOrders
      : { user, transactions: resultOrders };

    res.status(200).json({
      status: 200,
      message: 'Successfully!',
      countData: count,
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

exports.updateStatusTransaction = async (req, res) => {
  try {
    const order_id = req.params.order_id;
    const user_id = req.user.id;
    const status = req.body.status;

    const isAdmin = user_id === 1 && true;

    const whereCondition = isAdmin
      ? { id: order_id }
      : { id: order_id, user_id };

    const resultOrder = await Order.findOne({
      where: whereCondition,
      include: [
        {
          model: Order_product,
          as: 'products',
          include: [
            {
              model: Product,
              as: 'orders_products',
              attributes: ['name', 'stock'],
            },
          ],
          attributes: ['order_id', 'product_id', 'orderQuantity'],
        },
      ],
      attributes: ['id', 'status', 'name'],
    });

    if (!resultOrder) {
      return res.status(404).json({
        status: 404,
        message: 'Order Not FOund. Cant update',
      });
    }

    if (isAdmin && resultOrder.status.toLowerCase() !== 'waiting approve') {
      return res.status(400).json({
        status: 400,
        message: `Admin Cant update Order User status ${resultOrder.status}!`,
      });
    }

    if (!isAdmin && resultOrder.status.toLowerCase() !== 'on the way') {
      return res.status(400).json({
        status: 400,
        message: `Order User ${resultOrder.status}!`,
      });
    }

    if (!isAdmin) {
      // user update status completed
      const resl = await Order.update({ status }, { where: whereCondition });
    } else {
      // convert to json object
      const newResultOrder = JSON.parse(JSON.stringify(resultOrder));
      // admin update status approve
      const resl = await Order.update({ status }, { where: whereCondition });
      newResultOrder.products.map(async (product) => {
        const newStock = product.orders_products.stock + product.orderQuantity;

        await Product.update(
          { stock: newStock },
          { where: { id: product.product_id } },
        );
      });
      console.log(newResultOrder.products[0]);
    }

    res.status(200).json({
      status: 200,
      message: 'Successfully Updated!',
      resultOrder,
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

exports.getDetailTransactions = async (req, res) => {
  try {
    const order_id = req.params.order_id;

    let resultOrdered = await Order.findOne({
      where: { id: order_id },
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
        exclude: ['updatedAt', 'user_id'],
      },
      order: [['createdAt', 'DESC']],
    });

    resultOrdered = JSON.parse(JSON.stringify(resultOrdered));
    let totalPrice = 0;
    let newProducts = resultOrdered.products.map((product) => {
      totalPrice += product.orders_products.price * product.orderQuantity;
      const newOrderProduct = {
        ...product.orders_products,
        name: product.orders_products.name,
        price: product.orders_products.price,
        description: product.orders_products.description,
        photo: `${baseUrlImage}${product.orders_products.photo}`,
      };
      return {
        id: product.id,
        orderQuantity: product.orderQuantity,
        ...newOrderProduct,
      };
    });

    resultOrdered = {
      ...resultOrdered,
      attachment: `${baseUrlImage}${resultOrdered.attachment}`,
      totalPrice,
      products: newProducts,
    };

    res.status(200).json({
      status: 200,
      message: 'Successfully!',
      data: resultOrdered,
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
