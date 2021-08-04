const bcrypt = require('bcrypt');
const fs = require('fs');
const { User, Role } = require('../../models');
const { updateUserSchema } = require('../utils/schema/authSchema');
const { pathImage, baseUrlImage } = require('../utils/config');

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
        exclude: ['password', 'createdAt', 'updatedAt', 'role_id'],
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

exports.getUser = async (req, res) => {
  try {
    const id = req.user.id;
    let resultUser = await User.findOne({
      where: { id },
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['name'],
        },
      ],
      attributes: {
        exclude: ['password', 'createdAt', 'updatedAt', 'role_id'],
      },
    });

    if (!resultUser) {
      return res.status(404).json({
        status: 404,
        message: 'Invalid user!',
      });
    }
    resultUser = JSON.parse(JSON.stringify(resultUser));
    resultUser = {
      ...resultUser,
      photo: !resultUser.photo ? null : `${baseUrlImage}${resultUser.photo}`,
    };

    res.status(200).json({
      status: 200,
      message: 'Successfully!',
      data: resultUser,
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

exports.updateUser = async (req, res) => {
  try {
    const id = req.user.id;
    let payload = req.body;

    const { error } = updateUserSchema.validate(payload);

    if (error) {
      return res.status(400).json({
        status: 400,
        message: error.details[0].message,
      });
    }

    const resultUser = await User.findOne({
      where: {
        id,
      },
      attributes: ['photo'],
    });

    if (!resultUser) {
      return res.status(404).json({
        status: 404,
        message: 'Invalid Update PRofile!',
      });
    }

    if (req.files.imageFile) {
      const currentImage = `${pathImage}${resultUser.photo}`;

      if (fs.existsSync(currentImage)) {
        fs.unlinkSync(currentImage);
      }
      payload = { ...payload, photo: req.files.imageFile[0].filename };
    }

    if (!payload?.password) {
      await User.update(payload, { where: { id } });
    } else {
      const SALT = 10;
      const hashedPassword = await bcrypt.hash(payload.password, SALT);
      payload = { ...payload, password: hashedPassword };

      await User.update(payload, { where: { id } });
    }

    res.status(200).json({
      status: 200,
      message: 'Successfuly Updated profile!',
      photo: !req.files.imageFile
        ? null
        : `${baseUrlImage}${req.files.imageFile[0].filename}`,
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
