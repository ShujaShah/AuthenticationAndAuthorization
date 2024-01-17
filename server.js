// server.js
const express = require('express');
const app = express();

const configureServer = (port) => {
  app.listen(port, () => {
    console.log(`Connected to port ${port}`);
  });
};
module.exports = { app, configureServer };
