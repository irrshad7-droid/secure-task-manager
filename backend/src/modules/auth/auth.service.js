const User = require('../users/user.model');
const AppError = require('../../utils/AppError');
const { signToken, signRefreshToken } = require('../../utils/jwt');

class AuthService {
  async register(userData) {
    // Check if user exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new AppError('Email already in use', 400);
    }

    const newUser = await User.create({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: 'USER' // Prevent privilege escalation
    });

    // Remove password from output
    newUser.password = undefined;

    const accessToken = signToken(newUser._id);
    const refreshToken = signRefreshToken(newUser._id);

    return { user: newUser, accessToken, refreshToken };
  }

  async login(email, password) {
    // 1) Check if email and password exist
    if (!email || !password) {
      throw new AppError('Please provide email and password!', 400);
    }

    // 2) Check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.correctPassword(password, user.password))) {
      throw new AppError('Incorrect email or password', 401);
    }

    // 3) If everything ok, send token to client
    const accessToken = signToken(user._id);
    const refreshToken = signRefreshToken(user._id);
    
    user.password = undefined;

    return { user, accessToken, refreshToken };
  }

  async refreshToken(token) {
    if (!token) {
      throw new AppError('Refresh token is required', 401);
    }
    
    // Verify refresh token
    const decoded = await require('../../utils/jwt').verifyToken(token);
    
    // Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new AppError('The user belonging to this token does no longer exist.', 401);
    }

    const newAccessToken = signToken(user._id);
    return { accessToken: newAccessToken };
  }
}

module.exports = new AuthService();
