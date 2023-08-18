const express = require('express');
var router = express.Router();
const reviewController = require('./../controllers/reviewcontroller');
const authcontroller = require(`./../controllers/authcontroller`);
const model = require('./../models/reviewModel');

router = express.Router({ mergeParams: true });
router.use(authcontroller.protect);

router
  .route('/:id')
  .get(reviewController.GetOneReview)
  .delete(reviewController.DeleteReview)
  .patch(reviewController.UpdateReview);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authcontroller.restrictTo('user'),
    reviewController.setvalues,
    reviewController.createReview
  );
module.exports = router;
