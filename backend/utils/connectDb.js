const mongoose = require('mongoose');
require('dotenv').config();

const connectDb = async () => {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log('Connected to Mongo DB');
    })
    .catch(() => {
      console.log('Error connecting to Mongo DB');
    });
};

module.exports = connectDb;
