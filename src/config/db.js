const mongoose = require('mongoose');

const connectDB = async () => {
  mongoose.set('strictQuery', true);

  await mongoose.connect(process.env.MONGODB_URI, {
    autoIndex: process.env.NODE_ENV !== 'production'
  });

  console.log('MongoDB connected');
};

module.exports = connectDB;
