const Review= require('./../models/reviewModel');
// const AppError= require('./../utils/appError');
// const catchAsync= require('./../utils/catchAsync');
const handlerfactory=require('./handlerfactory');
exports.getAllReviews=handlerfactory.getAll(Review);
exports.setvalues = (req,res,next)=>{
if(!req.body.TourId) req.body.tour=req.params.tourId;
if(!req.body.userid) req.body.user=req.user._id;
console.log(req.body);
next();
}
exports.callfunction=(req,res,next)=>{
    Review.calcAverageRatings(req.body.tour);
    next();
}
exports.createReview=handlerfactory.createOne(Review);

exports.UpdateReview=handlerfactory.UpdateOne(Review);

exports.DeleteReview= handlerfactory.DeleteOne(Review);

exports.GetOneReview=handlerfactory.getOne(Review);