const express = require('express');
const {
  CreateUser,
  ActivateUser,
  LoginUser,
  LogoutUser,
  authorizeRoles,
} = require('../controllers/user-controller');
const isAuthenticated = require('../middlewares/auth');

const userRouter = express.Router();

userRouter.post('/registration', CreateUser);
userRouter.post('/activate', ActivateUser);
userRouter.post('/login', LoginUser);
userRouter.post('/logout', isAuthenticated, LogoutUser);

module.exports = userRouter;
