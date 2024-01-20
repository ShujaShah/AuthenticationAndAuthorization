// server.js
const express = require('express');
const app = express();
const colors = require('colors/safe');

const configureServer = (port) => {
  app.listen(port, () => {
    console.log(colors.green.bold.underline(`Connected to port ${port}`));
  });
};
module.exports = { app, configureServer };
