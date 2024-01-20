const express = require('express');
const { CreateUser } = require('../controllers/user-controller');

const userRouter = express.Router();

userRouter.post('/registration', CreateUser);

module.exports = userRouter;
