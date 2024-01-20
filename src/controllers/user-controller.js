const sendMail = require('../utils/send-mail');

const { User, validateUser } = require('../models/entities/user');
const Jwt = require('jsonwebtoken');
const ejs = require('ejs');
const path = require('path');

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

  user = await user.save();

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

module.exports = { CreateUser };
