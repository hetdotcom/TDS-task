const mongoose = require('mongoose');
require('dotenv').config();
const dbConnect = async () => {
  try {
    console.log(process.env.MONGODB_URI);
    const dbConnection = await mongoose.connect(process.env.MONGODB_URI);
    console.log(
      'Mongo connected at',
      dbConnection.connection.host + ':' + dbConnection.connection.port
    );
  } catch (error) {
    console.log(error);
  }
};

module.exports = dbConnect;
