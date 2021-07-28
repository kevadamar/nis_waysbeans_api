const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Role } = require('../../models');
const { loginSchema } = require('../utils/schema/authSchema');

//sign in
exports.signin = async (req, res) => {
  try {
    const payload = req.body;
    const { email, password } = payload;

    const { error } = loginSchema.validate(payload);

    if (error) {
      return res.status(400).json({
        status: 400,
        message: error.details[0].message,
      });
    }

    let resultUser = await User.findOne({
      where: {
        email,
      },
      include: {
        model: Role,
        as: 'role',
        attributes: ['name'],
      },
      attributes: {
        exclude: ['createdAt', 'updatedAt', 'role_id'],
      },
    });
    if (!resultUser) {
      return res.status(401).json({
        status: 401,
        message: 'Invalid Credentials',
      });
    }

    resultUser = JSON.parse(JSON.stringify(resultUser));

    console.log(resultUser);
    const isValidPassword = bcrypt.compareSync(password, resultUser.password);

    if (!isValidPassword) {
      return res.status(401).json({
        status: 401,
        message: 'Invalid Credentials',
      });
    }
    const token = jwt.sign(
      {
        id: resultUser.id,
        role: resultUser.role.name,
        email: resultUser.email,
        fullname: resultUser.fullname,
      },
      process.env.SECRET_KEY,
    );

    res.status(200).json({
      status: 200,
      message: 'Successfully Login',
      data: {
        user: {
          username: resultUser.username,
          fullname: resultUser.fullname,
          email: resultUser.email,
        },
        token,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 500,
      message: 'Internal Server Error',
    });
  }
};
