const express = require('express');
const fs = require('fs');
const morgan = require('morgan');
const sharp = require('sharp');
const User = require('./../models/usermodels');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const handlerfactory = require('./handlerfactory');

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const extension = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${extension}`);
//   },
// });
const multer = require('multer');
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image. Please upload only images', 400), false);
  }
};
const multerStorage = multer.memoryStorage();
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single('photo');
// const users= JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/users.json`));
const filterObj = (obj, ...allowedFields) => {
  var newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

exports.Getallusers = handlerfactory.getAll(User);
//Do NOT update password
exports.UpdateUser = handlerfactory.UpdateOne(User);
exports.getUser = handlerfactory.getOne(User);
exports.Deleteuser = handlerfactory.DeleteOne(User);
exports.Adduser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined. Please use signup instead',
  });
};
exports.getMe = catchAsync(async (req, res, next) => {
  req.params.id = req.user.id;

  next();
});
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
});
exports.updateMe = catchAsync(async (req, res, next) => {
  var filterbody = filterObj(req.body, 'name', 'email');

  if (req.file) filterbody.photo = req.file.filename;
  //1 create error if user tries to post password
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'Password Update not allowed here, please use /updatePassword',
        400
      )
    );
  }
  //2 if not update document
  const updateduser = await User.findByIdAndUpdate(req.user.id, filterbody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      user: updateduser,
    },
  });
});
exports.DeleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
