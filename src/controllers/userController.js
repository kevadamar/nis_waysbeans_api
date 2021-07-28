const { User, Role } = require('../../models');

exports.getAllUsers = async (req, res) => {
  try {
    const { rows, count } = await User.findAndCountAll({
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['name'],
        },
      ],
      attributes: {
        exclude: ['password', 'createdAt', 'updatedAt','role_id'],
      },
    });

    const resultUsers = JSON.parse(JSON.stringify(rows));

    res.status(200).json({
      status: 200,
      message: 'Successfully!',
      countData: count,
      data: resultUsers,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: 'Internal Server Error!',
      error,
    });
  }
};
