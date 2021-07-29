const { Product } = require('../../models');

exports.getAllProducts = async (req, res) => {
  try {
    const { rows, count } = await Product.findAndCountAll({
      attributes: {
        exclude: ['createdAt', 'updatedAt'],
      },
    });
    const resultProducts = JSON.parse(JSON.stringify(rows));

    res.status(200).json({
      status: 200,
      message: 'Successfully!',
      counData: count,
      data: resultProducts,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: 'Internal Server Error',
      error,
    });
    console.log(error);
  }
};



