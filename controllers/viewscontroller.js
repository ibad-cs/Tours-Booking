const Tour = require('../models/tourmodels');
const auth = require('./authcontroller');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/usermodels');
const { getTourStats } = require('./tourcontrollers');
exports.getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();
  //1)Get all tour data from collection
  //2)Build template
  //3)Render template
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});
exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review ratings user',
  });
  if (!tour) {
    return next(new AppError('There is no tour with that name.', 404));
  }
  res.status(200).render('tour', { title: `${tour.name} Tour`, tour });
});

exports.login = (req, res, next) => {
  res.status(200).render('login', {
    title: 'Log in to your account',
  });
};
exports.signup = (req, res, next) => {
  res.status(200).render('signup', {
    title: 'Sign Up',
  });
};
exports.getAccount = (req, res, next) => {
  res.status(200).render('account', {
    title: 'Your Account',
  });
};

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).render('account', {
    title: 'Your Account',
    user: updatedUser,
  });
});
