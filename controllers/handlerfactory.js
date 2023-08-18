const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('./../utils/APIFeatures');

exports.DeleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('No document with that ID', 404));
    }
    res.status(204).json({});
    next();
  });
exports.UpdateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const newDoc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!newDoc) {
      return next(new AppError('No Tour with that ID', 404));
    }
    res.status(200).json({
      status: 'success',

      data: {
        newDoc,
      },
    });
  });
exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    if (!doc) return next(new AppError('Invalid Tour creation', 404));

    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
    next();
  });
exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    console.log(query);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;
    if (!doc) {
      return next(new AppError('No document found with that ID'));
    }

    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });
exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    //To allow for nested GET reviews
    let filter = {};
    if (req.params.tourId) filter.TourId = req.params.tourId;
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limit()
      .pagination();

    // const doc= await features.query.explain();
    const doc = await features.query;
    res.status(200).json({
      status: 'success',
      length: doc.length,
      data: {
        doc,
      },
    });
    next();
  });
