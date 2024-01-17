const express = require('express');
require('dotenv').config();
const dbConn = require('./src/bin/connection').dbConn;

var app = express();
app.use(express.json());

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Connected to port ${port}`);
});
