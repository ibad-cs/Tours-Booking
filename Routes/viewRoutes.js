const express = require('express');
const viewsController = require('../controllers/viewscontroller');
const authController = require('../controllers/authcontroller');
const bookingController = require('./../controllers/bookingController');

const router = express.Router();
router.get('/signup', viewsController.signup);
router.get('/', authController.isLoggedIn, viewsController.getOverview);
router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);
router.get('/login', authController.isLoggedIn, viewsController.login);
router.get('/me', authController.protect, viewsController.getAccount);

// router.get(
//   '/my-tours',
//   bookingController.createBookingCheckout,
//   authController.protect,
//   viewsController.getMyTours
// );
router.post(
  '/submit-user-data',
  authController.protect,
  viewsController.updateUserData
);
module.exports = router;
