const express = require('express');
const fs = require('fs');
const morgan = require('morgan');
const usercontroller = require(`./../controllers/usercontrollers`);
const UserRouter = express.Router();
const authcontroller = require(`./../controllers/authcontroller`);

UserRouter.post('/signup', authcontroller.signup);
UserRouter.post('/login', authcontroller.login);
UserRouter.get('/logout', authcontroller.logOut);
UserRouter.post('/forgotPassword', authcontroller.forgotPassword);
UserRouter.patch('/resetPassword/:token', authcontroller.resetPassword);

UserRouter.get(
  '/me',
  authcontroller.protect,
  usercontroller.getMe,
  usercontroller.getUser
);

UserRouter.use(authcontroller.protect);
UserRouter.patch('/updatePassword', authcontroller.updatePassword);
UserRouter.patch(
  '/updatedata',
  usercontroller.uploadUserPhoto,
  usercontroller.resizeUserPhoto,
  usercontroller.updateMe
);
UserRouter.delete('/deleteMe', usercontroller.DeleteMe);

UserRouter.use(authcontroller.protect, authcontroller.restrictTo('admin'));
UserRouter.route('/')
  .get(usercontroller.Getallusers)
  .post(usercontroller.Adduser);
UserRouter.route('/:id')
  .get(usercontroller.getUser)
  .patch(usercontroller.UpdateUser)
  .delete(usercontroller.Deleteuser);

module.exports = UserRouter;
