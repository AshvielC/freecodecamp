require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 3000;

const start = async () => {
  if (!process.env.JWT_SECRET) {
    console.warn('JWT_SECRET is not set. Use a strong secret before production deployment.');
  }

  await connectDB();
  app.listen(PORT, () => {
    console.log(`FarmConnect Marketplace running on port ${PORT}`);
  });
};

start();
