const fs = require('fs');
const Tour = require('./../../models/tourmodels');
const User = require('./../../models/usermodels');
const Review = require('./../../models/reviewModel');
const mongoose = require('mongoose');
const DB =
  'mongodb+srv://ibad:1234@cluster0.0i7q5ea.mongodb.net/natours?retryWrites=true&w=majority';
//use following lines hamesha chote kaamon ke
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindandModify: false,
  })
  .then((con) => {
    console.log('db connections successful');
  });
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

//importing data into database
const Tours = JSON.parse(fs.readFileSync(`${__dirname}\\tours.json`, 'utf-8'));
const Users = JSON.parse(fs.readFileSync(`${__dirname}\\users.json`, 'utf-8'));
const Reviews = JSON.parse(
  fs.readFileSync(`${__dirname}\\reviews.json`, 'utf-8')
);

const importData = async () => {
  try {
    await Tour.create(Tours);
    await User.create(Users, { validateBeforeSave: false });
    await Review.create(Reviews);
    //   console.log('Data successfully loaded');
  } catch (err) {
    //    console.log(err);
  }
};
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Deleted all');
  } catch (err) {
    console.log('error in deleting');
  }
};
if (process.argv[2] == '--import') {
  console.log('In condition');
  importData();
}
if (process.argv[2] == '--delete') {
  deleteData();
}
console.log(process.argv);
