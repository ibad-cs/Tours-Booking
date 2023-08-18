const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const appError = require('./../utils/appError');
const User = require('./../models/usermodels');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');
const { appendFile } = require('fs');
const signToken = (id) => {
  console.log(process.env.JWT_EXPIRES);
  return (token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  }));
};
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const CookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') CookieOptions.secure = true;
  res.cookie('jwt', token, CookieOptions);
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
  });
  const url = `${req.protocol}://${req.get('host')}/me`;
  // console.log(url);
  await new Email(newUser, url).sendWelcome();
  createSendToken(newUser, 201, res);
  next();
});

exports.login = catchAsync(async (req, res, next) => {
  console.log('here in login');
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new appError('Please provide email and password', 400));
  }
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect Email or Password', 401));
  }
  // console.log(user);
  //1 check if email and password exists
  //2 check if user exists and password is correct
  //3 if everything ok, send token to client
  user.password = undefined;
  createSendToken(user, 200, res);
});
exports.logOut = (req, res) => {
  // console.log('Function reached');
  res.cookie('jwt', 'loggedOut', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

//Only for rendered pages no error
exports.isLoggedIn = async (req, res, next) => {
  //1 Get JWT token and check if there
  var token;
  if (req.cookies.jwt) {
    try {
      //1 Validate Token verification

      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      //3 Check if user still exists
      const freshuser = await User.findById(decoded.id);

      if (!freshuser) {
        return next();
      }
      //4 Check if user changed password after JWT was issued
      if (freshuser.changedPasswordAfter(decoded.iat)) {
        return next();
      }
      //There is a logged in user
      res.locals.user = freshuser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.protect = catchAsync(async (req, res, next) => {
  //1 Get JWT token and check if there
  var token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in please log in to get attention', 401)
    );
  }
  //2 Validate Token verification
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //3 Check if user still exists
  const freshuser = await User.findById(decoded.id);

  if (!freshuser) {
    return next(
      new AppError('The user belonging to this token no longer exists', 401)
    );
  }
  //4 Check if user changed password after JWT was issued
  if (freshuser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed passwords.Please login again', 401)
    );
  }
  //grant access
  req.user = freshuser;
  res.locals.user = freshuser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //roles is an array which is a normal function which is wrapped around a middleware function
    // console.log(roles);
    // console.log(req.user.role);
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};
exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1 get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new appError('No user with this email address', 404));
  //2 generate random reset token
  const ResetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  //3 send it back to users email
  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${ResetToken}`;
    await new Email(user, resetURL).sendPasswordReset();
    // await sendEmail({
    //   email: user.email,
    //   subject: 'Your password reset token(Valid for 10 mins)',
    //   message,
    // });
    res.status(200).json({
      status: 'success',
      message: 'Token sent to mail',
    });
  } catch (err) {
    // console.log(err);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    // console.log(err);
    return next(new AppError('Error sending email try again', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1) Get user based on token
  const hashedtoken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedtoken,
    passwordResetExpires: { $gt: Date.now() },
  });

  //2) if token not expired, then there is user, set new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  //3) update changedpasswordat property
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save({ validateBeforeSave: false });
  //4) log user in send token
  createSendToken(user, 200, res);
  next();
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1 get user from collection

  var token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(
      new AppError('You are not logged in please log in to get attention', 401)
    );
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).select('+password');

  //2 check if password is correct
  if (
    !user ||
    !(await user.correctPassword(req.body.password, user.password))
  ) {
    return next(new AppError('Invalid JWT token or incorrect Password', 401));
  }
  //3 if so, update password
  user.password = req.body.newpass;
  user.passwordConfirm = req.body.newpassconfirm;
  await user.save();
  //4 Log user in, send JWT
  createSendToken(user, 200, res);
  return next();
});
