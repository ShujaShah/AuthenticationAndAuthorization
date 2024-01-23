const mongoose = require('mongoose');
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const Jwt = require('jsonwebtoken');
require('dotenv').config();

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
      minlength: 5,
      maxlength: 50,
    },
    name: {
      type: String,
      minlength: 3,
      maxlength: 30,
    },
    password: {
      type: String,
      trim: true,
      required: true,
      minlength: 5,
      select: false,
    },
    avatar: {
      public_id: String,
      url: String,
    },
    role: {
      type: String,
      default: 'user',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    courses: [
      {
        courseId: String,
      },
    ],
  },
  { timestamps: true }
);

//Hash the password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

//Sign Access Token
userSchema.methods.SignAccessToken = function () {
  return Jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN || '', {
    expiresIn: '10m',
  });
};

//Sign refresh token
userSchema.methods.SignRefreshToken = function () {
  return Jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN || '', {
    expiresIn: '7d',
  });
};

//Compare the passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

function validateUser(user) {
  const schema = Joi.object({
    email: Joi.string().email().min(5).required(),
    name: Joi.string().min(3).required(),
    password: Joi.string().min(5).required(),
    avatar: Joi.string(),
    role: Joi.string(),
    isVerified: Joi.boolean(),
    courses: Joi.array(),
  });
  return schema.validate(user);
}

module.exports = {
  User,
  validateUser,
};
