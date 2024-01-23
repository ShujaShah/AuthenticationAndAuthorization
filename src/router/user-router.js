const express = require('express');
const {
  CreateUser,
  ActivateUser,
  LoginUser,
  LogoutUser,
  authorizeRoles,
  updateAccessToken,
  getAuthenticatedUser,
  socialAuth,
} = require('../controllers/user-controller');
const isAuthenticated = require('../middlewares/auth');

const userRouter = express.Router();

userRouter.post('/registration', CreateUser);
userRouter.post('/activate', ActivateUser);
userRouter.post('/login', LoginUser);
userRouter.get('/me', isAuthenticated, getAuthenticatedUser);
userRouter.post('/logout', isAuthenticated, LogoutUser);
userRouter.get('/refresh-token', updateAccessToken);
userRouter.post('/social', socialAuth);

module.exports = userRouter;
