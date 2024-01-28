const mongoose = require('mongoose');
const colors = require('colors/');
let mongo_url = process.env.MONGO_URL;

mongoose
  .connect(mongo_url)
  .then(() =>
    console.log(colors.bgGreen.bold.italic('Connected to the Database...😀'))
  )
  .catch((err) =>
    console.log(
      colors.bgRed.bold.italic('Error connecting the database💥', err)
    )
  );

module.exports = { dbConn: mongoose.connection };

//test commit
