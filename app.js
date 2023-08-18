const express = require('express');
const morgan = require('morgan');
const globalerrorhandler = require('./controllers/errorcontroller');
const appError = require('./utils/appError');
const { dirname } = require('path');
const { url } = require('inspector');
const TourRouter = require('./Routes/tourRoutes');
const UserRouter = require('./Routes/userRoutes');
const ReviewRouter = require('./Routes/reviewRoutes');
const viewRouter = require('./Routes/viewRoutes');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');
const port = 3000;
const cookieParser = require('cookie-parser');
const app = express();
var cors = require('cors');
const compression = require('compression');
app.use(compression());
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
//Serving static files
app.use(express.static(path.join(__dirname, 'public')));
//Set security HTTP headers
app.use(helmet());
// app.use(helmet.ContentSecurityPolicy());
// app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
const connectSrcUrls = [
  'https://*.stripe.com',
  'https://unpkg.com',
  'https://api.mapbox.com/',
  'https://*.cloudflare.com',
  'http://127.0.0.1:3000/api/v1/users/login',
  'http://127.0.0.1:3000/api/v1/bookings/checkout-session/',
];
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);
app.use(
  helmet({
    crossOriginEmbedderPolicy: true,
    crossOriginResourcePolicy: {
      allowOrigins: [
        "'self'",
        'https://api.mapbox.com/',
        'https://cdnjs.cloudflare.com',
        'http://127.0.0.1:3000',
      ],
    },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [
          "'self'",
          'https://api.mapbox.com/',
          'http://cdnjs.cloudflare.com',
          'http://127.0.0.1:3000',
        ],
        scriptSrc: [
          "* data: 'unsafe-eval' 'unsafe-inline' blob:",
          "'self'",
          'https://api.tiles.mapbox.com/',
          'https://api.mapbox.com/',
          'http://127.0.0.1:3000',
        ],
        connectSrc: ["'self'", ...connectSrcUrls],
      },
    },
  })
);
// app.use((req, res, next) => {
//   res.setHeader(
//     'Content-Security-Policy',
//     "script-src  'self' api.mapbox.com",
//     "script-src-elem 'self' api.mapbox.com"
//   );
//   next();
// });
//1 middlewares
//Development Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
//global
//Sets limit from one particular IP address
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP please try again in an hour',
});
app.use('/api', limiter);

//Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
//Data Sanitization against NOSQL query injection
app.use(mongoSanitize());
//Data Sanitization against XSS
app.use(xss());

//Prevent Parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

//routehandlers
app.use('/', viewRouter);
app.use('/api/v1/users', UserRouter);
app.use('/api/v1/tours', TourRouter);
app.use('/api/v1/reviews', ReviewRouter);

app.all('*', (req, res, next) => {
  // const err= new Error(`can't find ${req.originalUrl} on this url`);
  // err.statusCode=404;

  next(new appError(`can't find ${req.originalUrl} on this url`, 404));
});
app.use(globalerrorhandler);
module.exports = app;

//3.routes

//iske neeche yehi kaam kra wa but in a better way
// app.get('/api/v1/tours',getAlltours);
// app.post('/api/v1/tours',Addtour);
// app.get('/api/v1/tours/:id',getTour);
// app.patch('/api/v1/tours/:id',Updatetour);
// app.delete('/api/v1/tours/:id',DeleteTour);
