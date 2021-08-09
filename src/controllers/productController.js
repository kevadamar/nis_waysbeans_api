const { Product } = require('../../models');
const { pathImage, baseUrlImage } = require('../utils/config');
const {
  addProductSchema,
  updateProductSchema,
} = require('../utils/schema/productSchema');
const fs = require('fs');
const { Op } = require('sequelize');

exports.getAllProducts = async (req, res) => {
  try {
    const { rows, count } = await Product.findAndCountAll({
      where: { stock: { [Op.gt]: { stock: 0 } } },
      attributes: {
        exclude: ['createdAt', 'updatedAt'],
      },
      order: [['createdAt', 'DESC']],
    });
    let resultProducts = JSON.parse(JSON.stringify(rows));
    resultProducts = resultProducts.map((product) => ({
      ...product,
      photo: `${baseUrlImage}${product.photo}`,
    }));
    res.status(200).json({
      status: 200,
      message: 'Successfully!',
      countData: count,
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

    let resultProduct = await Product.findOne({
      where: { id, stock: { [Op.gt]: { stock: 0 } } },
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

    resultProduct = JSON.parse(JSON.stringify(resultProduct));

    res.status(200).json({
      status: 200,
      message: 'Successfully!',
      data: {
        ...resultProduct,
        photo: `${baseUrlImage}${resultProduct.photo}`,
        namePhoto: resultProduct.photo,
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
exports.getProductAdmin = async (req, res) => {
  try {
    const id = req.params.id;

    let resultProduct = await Product.findOne({
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

    resultProduct = JSON.parse(JSON.stringify(resultProduct));

    res.status(200).json({
      status: 200,
      message: 'Successfully!',
      data: {
        ...resultProduct,
        photo: `${baseUrlImage}${resultProduct.photo}`,
        namePhoto: resultProduct.photo,
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

exports.createProduct = async (req, res) => {
  try {
    const payload = req.body;

    const { error } = addProductSchema.validate(payload);

    if (error) {
      return res.status(400).json({
        status: 400,
        message: error.details[0].message,
      });
    }

    const resultProduct = await Product.create({
      ...payload,
      photo: req.files.imageFile[0].filename,
    });

    res.status(200).json({
      status: 200,
      message: 'Successfully Created!',
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

exports.updateProduct = async (req, res) => {
  try {
    let payload = req.body;
    const id = req.params.id;

    const { error } = updateProductSchema.validate(payload);

    if (error) {
      return res.status(400).json({
        status: 400,
        message: error.details[0].message,
      });
    }

    const resultProduct = await Product.findOne({
      where: { id },
      attributes: ['id'],
    });

    if (!resultProduct) {
      return res.status(404).json({
        status: 404,
        message: "Product Not Found, can't update.",
      });
    }

    //handle if image changed
    if (req.files.imageFile) {
      const { photo } = await Product.findOne({
        where: {
          id,
        },
        attributes: ['photo'],
      });
      const currentImage = `${pathImage}${photo}`;
      console.log(`currtenImage`, currentImage);
      if (fs.existsSync(currentImage)) {
        fs.unlinkSync(currentImage);
      }

      payload = { ...payload, photo: req.files.imageFile[0].filename };
    }

    await Product.update(payload, {
      where: { id },
    });

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

exports.getAllProductsByAdmin = async (req, res) => {
  try {
    let { page } = req.query;

    const maxLimit = 50;

    page = parseInt(page) + 1;

    const limit = page === undefined ? 20 : 5;
    const offset = page === undefined ? 0 : (page - 1) * limit;

    const { rows, count } = await Product.findAndCountAll({
      attributes: {
        exclude: ['createdAt', 'updatedAt'],
      },
      offset,
      limit,
      order: [['createdAt', 'DESC']],
    });
    let resultProducts = JSON.parse(JSON.stringify(rows));
    resultProducts = resultProducts.map((product) => ({
      ...product,
      photo: `${baseUrlImage}${product.photo}`,
    }));
    res.status(200).json({
      status: 200,
      message: 'Successfully!',
      countData: count,
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

exports.deleteProduct = async (req, res) => {
  try {
    const id = req.params.id;

    const resultDelete = await Product.destroy({
      where: { id },
    });

    if (!resultDelete) {
      return res.status(404).json({
        status: 404,
        message: 'Product Not Found!',
      });
    }

    res.status(200).json({
      status: 200,
      message: 'Successfully Deleted Product!',
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
