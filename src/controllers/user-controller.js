const sendMail = require('../utils/send-mail');

const { User, validateUser } = require('../models/entities/user');
const Jwt = require('jsonwebtoken');
const ejs = require('ejs');
const path = require('path');
const sendToken = require('../utils/jwt');
require('dotenv').config();
const redis = require('../utils/redis');

const CreateUser = async (req, res, next) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const checkMail = await User.findOne({ email: req.body.email });
  if (checkMail) {
    return next(new Error('Email already exists'));
  }
  let user = new User({
    email: req.body.email,
    name: req.body.name,
    password: req.body.password,
  });

  //create token and email
  const activationToken = createActivationToken(user);
  const activationCode = activationToken.activationCode;
  const data = { user: { name: user.name }, activationCode };
  const html = await ejs.renderFile(
    path.join(__dirname, '../mails/activation-mail.ejs'),
    data
  );
  try {
    await sendMail({
      email: user.email,
      subject: 'Activate your account',
      template: 'activation-mail.ejs',
      data,
    });
    res.status(201).json({
      success: true,
      message: `Please check your email ${user.email} to activate your account!`,
      activationCode: activationCode,
      activationToken: activationToken.token,
    });
  } catch (error) {
    console.log(error);
  }
};

const createActivationToken = (user) => {
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
  const token = Jwt.sign(
    {
      user,
      activationCode,
    },
    process.env.JWTPrivateKey,
    {
      expiresIn: '10m',
    }
  );
  return { token, activationCode };
};

//Activate User
const ActivateUser = async (req, res, next) => {
  const { activation_token, activation_code } = req.body;
  const newUser = Jwt.verify(activation_token, process.env.JWTPrivateKey);

  if (newUser.activationCode !== activation_code) {
    return next(new Error('Invalid Code', 400));
  }

  const { name, email, password } = newUser.user;

  let existing_user = await User.findOne({ email });
  if (existing_user) {
    return next(new Error('user already exists'));
  }
  let user = await User.create({
    name,
    email,
    password,
  });
  res.status(201).json({
    success: true,
    data: user,
  });
};

//Login User

const LoginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email | !password) {
      return next(new Error('Please enter email and password'));
    }
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(new Error('Invalid Email or Password', 400));
    }
    const passwordMatch = await user.comparePassword(password);
    if (!passwordMatch) {
      return next(new Error('Email or Password incorrect'));
    }
    sendToken(user, 200, res);
  } catch (error) {
    return next(new Error(error.message));
  }
};

//handle logout
const LogoutUser = async (req, res, next) => {
  try {
    res.cookie('access_token', '', { maxAge: 1 });
    res.cookie('refresh_token', '', { maxAge: 1 });
    const userId = req.user?._id || '';

    redis.del(userId);

    res.status(201).json({
      success: true,
      message: 'logged out successfully',
    });
  } catch (error) {
    return next(new Error(error.message, 400));
  }
};

//validate user role
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role || '')) {
      return next(
        new Error(
          `Role: ${req.user?.role} is not allowed to access this resource`,
          403
        )
      );
    }
    next();
  };
};

module.exports = {
  CreateUser,
  ActivateUser,
  LoginUser,
  LogoutUser,
  authorizeRoles,
};
