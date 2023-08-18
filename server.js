const mongoose = require('mongoose');
const dotenv = require('dotenv');
const DB =
  'mongodb+srv://ibad:1234@cluster0.0i7q5ea.mongodb.net/natours?retryWrites=true&w=majority';
process.on('uncaughtException', (err) => {
  console.log(err);
  console.log('Unhandled exception! shutting down...');
  process.exit(1);
});

//use following lines hamesha chote kaamon ke
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindandModify: false,
  })
  .then((con) => {
    console.log('db connections successful');
  })
  .catch((err) => console.log(err));
dotenv.config({ path: './config.env' });
const app = require('./app');
const port = process.env.port || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}....`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('Unhandled rejection! shutting down...');
  server.close(() => {
    process.exit(1);
  });
});
