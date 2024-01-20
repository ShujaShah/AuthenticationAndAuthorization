const express = require('express');
const { CreateUser, ActivateUser } = require('../controllers/user-controller');

const userRouter = express.Router();

userRouter.post('/registration', CreateUser);
userRouter.post('/activate', ActivateUser);

module.exports = userRouter;
