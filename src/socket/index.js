const { Order, Order_product, Product } = require('../../models');
const jwt = require('jsonwebtoken');

module.exports.socketIO = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.query.token;

    if (token) {
      const secretKey = process.env.SECRET_KEY;

      const verified = jwt.verify(token, secretKey, (error, decoded) => {
        if (error) {
          return -1;
        } else {
          return decoded;
        }
      });

      if (verified) {
        next(new Error('invalid token'));
      }

      socket.user = verified;

      next();
    } else {
      next(new Error('not valid'));
    }
  });

  io.on('connection', (socket) => {
    try {
      const email = socket.user.email;
      const emailAdmin = 'admin@gmail.com';

      socket.join(`room_${email}`);

      socket.on('load-notifications', async () => {
        const resultNotif = await getNotif();

        io.to(`room_${emailAdmin}`).emit('new-notifications', resultNotif);
      });

      socket.on('send-notifications', async () => {
        const resultNotif = await getNotif();

        io.to(`room_${emailAdmin}`).emit('new-notifications', resultNotif);
      });

      socket.on('disconnect', () => socket.disconnect());
    } catch (error) {
      throw new Error(error);
    }
  });
};

const getNotif = async () => {
  try {
    let resultNotif = await Order.findAll({
      where: {
        status: 'Waiting Approve',
      },
      include: [
        {
          model: Order_product,
          as: 'products',
          attributes: ['order_id'],
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

    resultNotif = resultNotif.map((notif) => ({
      id: notif.id,
      name: notif.name,
      product_name: notif.products.map(
        (product) => product.orders_products.name,
      ),
    }));

    return resultNotif;
  } catch (error) {
    console.log(error);
    return 'err db';
  }
};
