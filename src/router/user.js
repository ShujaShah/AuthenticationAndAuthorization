const express = require('express');
const {
  CreateUser,
  ActivateUser,
  LoginUser,
  LogoutUser,
} = require('../controllers/user-controller');

const userRouter = express.Router();

userRouter.post('/registration', CreateUser);
userRouter.post('/activate', ActivateUser);
userRouter.post('/login', LoginUser);
userRouter.post('/logout', LogoutUser);

module.exports = userRouter;
