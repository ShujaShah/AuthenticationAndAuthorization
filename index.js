const express = require('express');
const { app, configureServer } = require('./server'); // Adjust the path accordingly
require('dotenv').config();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dbConn = require('./src/bin/connection').dbConn;

// Server Configurations
const port = process.env.PORT || 3000;
configureServer(port);

//body paser
app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());

//implement cors
app.use(
  cors({
    origin: 'http://localhost:5173',
    optionSuccessStatus: 200,
  })
);

app.get('/test', (req, res, next) => {
  res.status(200).json({
    message: 'hello world',
    success: 'true',
  });
});
