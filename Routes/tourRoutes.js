const { Router } = require('express');
const express = require('express');
const fs = require('fs');
const morgan = require('morgan');
const tourcontroller = require(`./../controllers/tourcontrollers`);
const TourRouter = express.Router();
const authcontroller = require(`./../controllers/authcontroller`);
const reviewrouter = require('./../Routes/reviewRoutes');

TourRouter.use('/:tourId/reviews', reviewrouter);
// TourRouter.param('id',tourcontroller.checkID);
TourRouter.route('/top-5-cheapest').get(
  tourcontroller.aliasToptours,
  tourcontroller.getAlltours
);
TourRouter.route(
  authcontroller.protect,
  authcontroller.restrictTo('admin', 'lead-guide'),
  '/monthlyplan/:year'
).get(tourcontroller.getMonthlyplan);
TourRouter.route('/tour-stats').get(tourcontroller.getTourStats);
TourRouter.route('/tours-within/:distance/center/:latlng/unit/:unit').get(
  tourcontroller.getToursWithin
);
TourRouter.route('/distances/:latlng/unit/:unit').get(
  tourcontroller.getDistances
);
TourRouter.route('/')
  .get(tourcontroller.getAlltours)
  .post(
    authcontroller.protect,
    authcontroller.restrictTo('admin', 'lead-guide', 'guide'),
    tourcontroller.Addtour
  );
TourRouter.route('/:id')
  .get(tourcontroller.getTour)
  .patch(
    authcontroller.protect,
    authcontroller.restrictTo('admin', 'lead-guide'),
    tourcontroller.uploadTourImage,
    tourcontroller.resizeTourImages,
    tourcontroller.Updatetour
  )
  .delete(
    authcontroller.protect,
    authcontroller.restrictTo('admin', 'lead-guide'),
    tourcontroller.DeleteTour
  );

module.exports = TourRouter;
