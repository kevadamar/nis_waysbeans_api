const jwt = require('jsonwebtoken');

exports.authMiddleware = (req, res, next) => {
  try {
    let header = req.header('Authorization');

    if (!header) {
      return res.status(401).send({
        status: 401,
        message: 'Unauthenticated!',
      });
    }

    let token = header.replace('Bearer ', '');

    const secretKey = process.env.SECRET_KEY;

    const verified = jwt.verify(token, secretKey, (error, decoded) => {
      if (error) {
        return res.status(401).send({
          status: 401,
          message: 'Invalid Credentials!',
        });
      } else {
        return decoded;
      }
    });

    req.user = verified;

    next();
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: 500,
      message: 'Internal Server Error',
    });
  }
};

exports.adminAccessMiddleware = (req, res, next) => {
  try {
    // console.log(req.user);
    if (req.user.role !== 'admin') {
      return res.status(403).send({
        status: 403,
        message: 'Access Denied!',
      });
    }

    next();
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: 500,
      message: 'Internal Server Error',
    });
  }
};
