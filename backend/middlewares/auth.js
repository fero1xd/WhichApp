const { User } = require('../models');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
require('dotenv').config();

const authMiddleware = catchAsync(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) return next(new AppError('No Authorization Header', 401));

  const user = await User.findOne({
    jwt: token,
    jwtExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Invalid Token', 401));
  }

  jwt.verify(token, process.env.JWT_SECRET);

  req.user = user;
  next();
});

const checkActivated = (req, res, next) =>
  !req.user.activated
    ? next(new AppError('Acount not activated', 401))
    : next();

module.exports = { authMiddleware, checkActivated };
