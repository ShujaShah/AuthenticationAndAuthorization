const jwt = require('jsonwebtoken');
const redis = require('../utils/redis');

const isAuthenticated = async (req, res, next) => {
  const access_token = req.cookies.access_token;

  if (!access_token) {
    return next(new Error('your are not logged in', 400));
  }

  const decoded = jwt.verify(access_token, process.env.ACCESS_TOKEN);

  if (!decoded) {
    return next(new Error('Access token is not valid', 400));
  }
  const user = await redis.get(decoded.id);

  if (!user) {
    return next(new Error('User not found', 400));
  }

  req.user = JSON.parse(user);
  next();
};

module.exports = isAuthenticated;
