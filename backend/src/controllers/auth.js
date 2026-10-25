const User = require('../models/User');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/emailService');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Create user with a temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const user = await User.create({
      email,
      password: tempPassword,
      isVerified: false
    });

    // Generate verification code
    const verificationCode = await user.getVerificationCode();
    await user.save();

    console.log(`\n======================================================`);
    console.log(`🔑 FITTRACK VERIFICATION CODE FOR ${email}: [ ${verificationCode} ]`);
    console.log(`======================================================\n`);

    let emailSent = false;
    try {
      // Send verification code via email
      await sendEmail({
        to: email,
        subject: 'FitTrack - Verify Your Email',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #FF7E45;">FitTrack</h1>
            </div>
            <div style="margin-bottom: 30px;">
              <h2 style="color: #333;">Verify Your Email</h2>
              <p style="color: #666; line-height: 1.5;">Thank you for registering with FitTrack. Please use the verification code below to complete your registration:</p>
              <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
                <h2 style="color: #FF7E45; letter-spacing: 5px; margin: 0;">${verificationCode}</h2>
              </div>
              <p style="color: #666; line-height: 1.5;">This code will expire in 10 minutes.</p>
            </div>
            <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; font-size: 12px; color: #999; text-align: center;">
              <p>If you did not request this verification code, please ignore this email.</p>
              <p>&copy; ${new Date().getFullYear()} FitTrack. All rights reserved.</p>
            </div>
          </div>
        `
      });

      console.log(`Verification email sent to ${email}`);
      emailSent = true;
    } catch (error) {
      console.error('Failed to send verification email (check Gmail app password in .env):', error.message || error);
    }

    // Send response
    res.status(201).json({
      success: true,
      message: emailSent
        ? 'User registered successfully. Verification code sent to email.'
        : 'Registered successfully. Email delivery failed, but code is provided for development.',
      code: verificationCode,
      devCode: verificationCode,
      emailSent
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Verify user email
// @route   POST /api/auth/verify
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).select('+verificationCode');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if verification code matches
    const isMatch = await bcrypt.compare(code, user.verificationCode);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      });
    }

    // Update user to verified
    user.isVerified = true;
    user.verificationCode = undefined;
    await user.save();

    // Send token
    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      // Create a new unverified user
      return await exports.register(req, res);
    }

    // Generate verification code
    const verificationCode = await user.getVerificationCode();
    await user.save();

    console.log(`\n======================================================`);
    console.log(`🔑 FITTRACK LOGIN CODE FOR ${email}: [ ${verificationCode} ]`);
    console.log(`======================================================\n`);

    let emailSent = false;
    try {
      // Send verification code via email
      await sendEmail({
        to: email,
        subject: 'FitTrack - Your Login Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #FF7E45;">FitTrack</h1>
            </div>
            <div style="margin-bottom: 30px;">
              <h2 style="color: #333;">Login Verification Code</h2>
              <p style="color: #666; line-height: 1.5;">You requested to log in to your FitTrack account. Please use the verification code below:</p>
              <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
                <h2 style="color: #FF7E45; letter-spacing: 5px; margin: 0;">${verificationCode}</h2>
              </div>
              <p style="color: #666; line-height: 1.5;">This code will expire in 10 minutes.</p>
            </div>
            <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; font-size: 12px; color: #999; text-align: center;">
              <p>If you did not request this verification code, please ignore this email.</p>
              <p>&copy; ${new Date().getFullYear()} FitTrack. All rights reserved.</p>
            </div>
          </div>
        `
      });

      console.log(`Verification email sent to ${email}`);
      emailSent = true;
    } catch (error) {
      console.error('Failed to send verification email (check Gmail app password in .env):', error.message || error);
    }

    // Send response
    res.status(200).json({
      success: true,
      message: emailSent
        ? 'Verification code sent to email'
        : 'Verification code generated (Email service failed - see code in dev mode).',
      code: verificationCode,
      devCode: verificationCode,
      emailSent
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Google Sign-In
// @route   POST /api/auth/google
// @access  Public
exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'No token provided'
      });
    }

    // In a real implementation, you would verify the Google token
    // using the Google OAuth API and extract the user's email and profile info

    // For now, we'll simulate this process
    // In production, you would use the google-auth-library package to verify the token

    // Simulate extracting email from token (this is just a placeholder)
    const email = 'user@example.com'; // In reality, this would come from the verified token

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create a new user with the Google account
      user = await User.create({
        email,
        password: Math.random().toString(36).slice(-8), // Generate a random password
        isVerified: true // Google users are automatically verified
      });
    }

    // Send token response
    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during Google authentication'
    });
  }
};

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    token
  });
};
