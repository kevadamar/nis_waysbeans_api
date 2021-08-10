const jwt = require('jsonwebtoken');
const { Order, Order_product, Product } = require('../../models');

module.exports.socketIO = (io) => {
  // middleware
  io.use((socket, next) => {
    // token
    const token = socket.handshake.query.token;

    if (token) {
      // decoded
      const secretKey = process.env.SECRET_KEY;

      const verified = jwt.verify(token, secretKey, (error, decoded) => {
        if (error) {
          return -1;
        } else {
          return decoded;
        }
      });

      if (verified === -1) {
        next(new Error('invalid credentials!'));
      }

      socket.user = verified;

      next();
    } else {
      next(new Error('unauthorized!'));
    }
  });

  // listen connection
  io.on('connection', (socket) => {
    try {
      const email = socket.user.email;
      const emailAdmin = 'admin@gmail.com';

      socket.join(`room_${email}`);

      socket.on('load-notifications', async () => {
        const resultNotif = await getOrder();

        io.to(`room_${emailAdmin}`).emit('new-notifications', resultNotif);
      });

      socket.on('send-notifications', async () => {
        const resultNotif = await getOrder();

        io.to(`room_${emailAdmin}`).emit('new-notifications', resultNotif);
      });
    } catch (error) {
      console.log(`error`, error);
      throw new Error('error server socket');
    }
  });
};

const getOrder = async () => {
  try {
    let resultNotif = await Order.findAll({
      where: {
        status: 'Waiting Approve',
      },
      include: [
        {
          model: Order_product,
          as: 'products',
          attributes: ['orderQuantity'],
          include: [
            {
              model: Product,
              as: 'orders_products',
              attributes: ['name'],
            },
          ],
        },
      ],
      limit: 20,
      attributes: ['id', 'name', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });

    resultNotif = JSON.parse(JSON.stringify(resultNotif));
    resultNotif = resultNotif.map((result) => {
      return {
        id: result.id,
        name: result.name,
        product_name: result.products
          .map((product) => product.orders_products.name)
          .join(', '),
      };
    });

    return resultNotif;
  } catch (error) {
    console.log(`error`, error);
    return 'internal server error';
  }
};
