const mongoose = require('mongoose');

let mongo_url = process.env.MONGO_URL;

mongoose
  .connect(mongo_url)
  .then(() => console.log('Connected to the Database...'))
  .catch((err) => console.log('Error connecting the database', err));

module.exports = { dbConn: mongoose.connection };
