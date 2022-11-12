const { UnauthenticatedError } = require('../errors');
const User = require('../models/User');
const { isTokenValid } = require('../utils/jwt');

const authenticationMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthenticatedError('No token provide');
  }

  const token = authHeader.split(' ')[1];
  // console.log(token);
  try {
    const decoded = await isTokenValid(token);
    const { email, id } = decoded;

    const currentUser = await User.findOne({ email });
    // console.log(currentUser);

    if (!currentUser) {
      throw new UnauthenticatedError("The user doesn't exists");
    }
    req.user = currentUser;
    next();
  } catch (error) {
    // console.log(29, error.message);
    if (error.message === 'jwt malformed') {
      throw new UnauthenticatedError('Invalid login.try to login again');
    }
    throw new UnauthenticatedError(error.message);
  }
};

module.exports = authenticationMiddleware;
