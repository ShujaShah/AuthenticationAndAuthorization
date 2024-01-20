const express = require('express');
const { app, configureServer } = require('./server'); // Adjust the path accordingly
require('dotenv').config();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dbConn = require('./src/bin/connection').dbConn;
const morgan = require('morgan');
require('winston-mongodb');
// const { logger } = require('./src/bin/winston-logger');

const userRouter = require('./src/router/user');

// Server Configurations
const port = process.env.PORT || 3000;
configureServer(port);

//body paser
app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());

let mongo_url = process.env.MONGO_URL;

// using morgan for showing the request status
app.use(morgan('tiny'));

//
app.use('/api/v1', userRouter);

//implement cors
app.use(
  cors({
    origin: 'http://localhost:5173',
    optionSuccessStatus: 200,
  })
);
