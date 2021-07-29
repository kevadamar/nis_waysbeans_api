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

exports.getProduct = async (req, res) => {
  try {
    const id = req.params.id;

    const resultProduct = await Product.findOne({
      where: { id },
      attributes: {
        exclude: ['createdAt', 'updatedAt'],
      },
    });

    if (!resultProduct) {
      return res.status(404).json({
        status: 404,
        message: 'Product Not Found!',
      });
    }

    res.status(200).json({
      status: 200,
      message: 'Successfully!',
      data: resultProduct,
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



