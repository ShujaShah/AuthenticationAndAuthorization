const express = require('express');
const { app, configureServer } = require('./server');
require('dotenv').config();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dbConn = require('./bin/connection').dbConn;
const morgan = require('morgan');
require('winston-mongodb');

const error = require('./middlewares/error');
const routes = require('./router/routes');

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
app.use('/api/v1', routes);
//app.use(error);

//implement cors
app.use(
  cors({
    origin: 'http://localhost:5173',
    optionSuccessStatus: 200,
  })
);
