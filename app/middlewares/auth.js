const { UnauthenticatedError, UnauthorizedError } = require("../errors");
const { isTokenValid } = require("../utils");

const authenticateUser = async (req, res, next) => {
  try {
    let token;
    //check header
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) throw new UnauthenticatedError('Authentication invalid');

    const payload = isTokenValid({ token });

    //Attach user data to req object
    if (payload.role === 'user') {
      req.user = {
        name: payload.name,
        role: payload.role,
        email: payload.email,
        address: payload.address,
        status: payload.status,
        phone_num: payload.phone_num,
      }
    } else {
      req.user = {
        userId: payload.userId,
        name: payload.name,
        role: payload.role,
        email: payload.email,
        address: payload.address,
        status: payload.status,
        phone_num: payload.phone_num,
      }
    }

    //head to next function with new req
    next();
  } catch (error) {
    //head to router that receive err argument
    next(error);
  }
}


const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) throw new UnauthorizedError('Unauthorized to access this route');

    next();
  }
}

module.exports = {
  authenticateUser,
  authorizeRoles,
}