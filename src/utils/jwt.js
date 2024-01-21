const { User, validateUser } = require('../models/entities/user');
const redis = require('./redis');

const sendToken = (User, statusCode, res) => {
  const accessToken = User.SignAccessToken();
  const refreshToken = User.SignRefreshToken();

  //Todo: uplaod session to the redis
  redis.set(User._id, JSON.stringify(User));

  // parse environment variables to integrate with fallback values
  const accessTokenExpire = parseInt(
    process.env.ACCESS_TOKEN_EXPIRE || '300',
    10
  );
  const refreshTokenExpire = parseInt(
    process.env.REFRESH_TOKEN_EXPIRE || '1200',
    10
  );

  // options for cookies
  const accessTokenOptions = {
    expires: new Date(Date.now() + accessTokenExpire * 1000),
    maxAge: accessTokenExpire * 1000,
    httpOnly: true,
    sameSite: 'lax',
  };

  const refreshTokenOptions = {
    expires: new Date(Date.now() + refreshTokenExpire * 1000),
    maxAge: accessTokenExpire * 1000,
    httpOnly: true,
    sameSite: 'lax',
  };

  // only set secure to true in production
  if (process.env.NODE_ENV === 'production') {
    accessTokenOptions.secure = true;
  }

  res.cookie('access_token', accessToken, accessTokenOptions);
  res.cookie('refresh_token', refreshToken, refreshTokenOptions);

  res.status(statusCode).json({
    success: true,
    User,
    accessToken,
  });
};

module.exports = sendToken;
