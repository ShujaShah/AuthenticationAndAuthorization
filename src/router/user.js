const express = require('express');
const {
  CreateUser,
  ActivateUser,
  LoginUser,
} = require('../controllers/user-controller');

const userRouter = express.Router();

userRouter.post('/registration', CreateUser);
userRouter.post('/activate', ActivateUser);
userRouter.post('/login', LoginUser);

module.exports = userRouter;
