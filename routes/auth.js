const express = require('express');
const router = express.Router();
const path = require('path');
const rateLimit = require('express-rate-limit');
const User = require('../models/user');
const { sendEmail } = require('../config/mailer');
const { generateMfaCode } = require('../utils/mfa');

// Rate limiting for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  //max: 2000, // 2 requests per windowMs
  message: 'Too many login attempts, please try again later',
});

// Registration page
router.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'views', 'register.html'));
});

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;

    // Check if user already exists
    const existingUser = await User.getByUsername(username);
    if (existingUser) {
      return res.status(400).send('Username already exists');
    }

    // Create new user
    await User.create(username, password, email);
    res.redirect('/login');
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).send('Error registering user');
  }
});

// Login page
router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'views', 'login.html'));
});

// First-factor authentication
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.getByUsername(username);
    if (!user || user.password !== password) {
      return res.status(401).send('Invalid username or password');
    }

    // First-factor authentication successful
    req.session.username = username;

    /*
    
    // By generating and sending the 2FA code during the first-factor authentication,
    // we ensure that the attacker cannot generate the 2FA code without the password,
    // thereby mitigating the 2FA vulnerability.
    
    // Generate and store 2FA code
    const mfaCode = generateMfaCode();
    await User.storeMfaCode(user.id, mfaCode);

    // Send the code via email
    await sendEmail(user.email, mfaCode); 
    */

    // Redirect to second-factor authentication page
    res.redirect(`/login2?verify=${username}`);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).send('Error during login');
  }
});

// Second-factor authentication page
router.get('/login2', async (req, res) => {
  try {
    const verifyUser = req.query.verify;

    if (!verifyUser) {
      return res.status(400).send('Invalid verification request');
    }

    const user = await User.getByUsername(verifyUser);

    if (!user) {
      return res.status(400).send('User not found');
    }

    // By generating and sending the 2FA code during the second-factor authentication,
    // we allow the attacker to generate the 2FA code without the password and only using the username,
    // thereby demonstrating the 2FA vulnerability.

    // Generate and store 2FA code
    const mfaCode = generateMfaCode();
    await User.storeMfaCode(user.id, mfaCode);

    // Send the code via email
    await sendEmail(user.email, mfaCode);

    res.sendFile(path.join(__dirname, '..', 'public', 'views', 'login2.html'));
  } catch (error) {
    console.error('2FA page error:', error);
    res.status(500).send('Error displaying 2FA page');
  }
});

// Verify second-factor authentication
router.post('/login2', async (req, res) => {
  try {
    const { 'mfa-code': mfaCode, verify: verifyUser } = req.body;
    if (!verifyUser) {
      return res.status(400).send('Invalid verification request');
    }

    const user = await User.getByUsername(verifyUser);
    if (!user) {
      return res.status(400).send('User not found');
    }

    // This code is exploitable because it does not verify if the first-factor authentication was completed for this user
    // and lacks rate limiting
    const isValid = await User.verifyMfaCode(user.id, mfaCode);
    if (!isValid) {
      //console.log(isValid);
      return res.status(401).send('Invalid or expired 2FA code');
    }
    // Remove the 2FA code from the database to prevent reuse
    const removed = await User.removeMfaCode(user.id);
    //console.log(removed);

    // Authentication successful
    req.session.user = user.username;
    req.session.authenticated = true;
    req.session.email = user.email;

    res.redirect('/user/my-account');
  } catch (error) {
    console.error('2FA verification error:', error);
    res.status(500).send(error);
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
