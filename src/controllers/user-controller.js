const sendMail = require('../utils/send-mail');

const { User, validateUser } = require('../models/entities/user');
const Jwt = require('jsonwebtoken');
const ejs = require('ejs');
const path = require('path');
const {
  sendToken,
  refreshTokenOptions,
  accessTokenOptions,
} = require('../utils/jwt');
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
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString(); //Generate a random four digit code

  //Create a JSON Web Token, token contains the payload with two properties: user and 4 digit activation code
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

  //When the user entered incorrect code
  if (newUser.activationCode !== activation_code) {
    return next(new Error('Invalid Code', 400));
  }

  const { name, email, password } = newUser.user;

  //If there is an existing user with the same email
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

    //If the user or password is not entered
    if (!email | !password) {
      return next(new Error('Please enter email and password'));
    }

    //Check for the user if he exists
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(new Error('Invalid Email or Password', 400));
    }

    //Check if the password entered matches the password stored in DB
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

    redis.del(userId); // delete the cache from redis

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

//update Access token
const updateAccessToken = async (req, res, next) => {
  try {
    const refresh_token = req.cookies.refresh_token;
    const decoded = Jwt.verify(refresh_token, process.env.REFRESH_TOKEN);

    const message = 'Could not refresh the token';

    if (!decoded) {
      return next(new Error(message, 400));
    }
    const session = await redis.get(decoded.id);

    if (!session) {
      return next(new Error(message, 400));
    }

    const user = JSON.parse(session);

    const accessToken = Jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN, {
      expiresIn: '10m',
    });

    const refreshToken = Jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN, {
      expiresIn: '8d',
    });

    res.cookie('accessToken', accessToken, accessTokenOptions);
    res.cookie('refreshToken', refreshToken, refreshTokenOptions);

    res.status(200).json({
      status: 'success',
      accessToken,
    });
  } catch (error) {
    return next(new Error(error.message, 400));
  }
};

module.exports = {
  CreateUser,
  ActivateUser,
  LoginUser,
  LogoutUser,
  authorizeRoles,
  updateAccessToken,
};
