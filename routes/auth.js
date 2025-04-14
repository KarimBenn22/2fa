const express = require('express');
const router = express.Router();
const path = require('path');
const rateLimit = require('express-rate-limit');
const User = require('../models/user');
const { sendEmail } = require('../config/mailer');
const { generateMfaCode } = require('../utils/mfa');

/* const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later',
}); */

router.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'views', 'register.html'));
});

router.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;

    const existingUser = await User.getByUsername(username);
    if (existingUser) {
      return res.status(400).send('Username already exists');
    }

    await User.create(username, password, email);
    res.redirect('/login');
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).send('Error registering user');
  }
});

router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'views', 'login.html'));
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.getByUsername(username);
    if (!user || user.password !== password) {
      return res.status(401).send('Invalid username or password');
    }

    req.session.username = username;

    // Set secure cookie for verification
    res.cookie('verify', username, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000, // 1 hour expiry
    });

    // Redirect to second-factor authentication page
    res.redirect('/login2');
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).send('Error during login');
  }
});

router.get('/login2', async (req, res) => {
  try {
    const verifyUser = req.cookies.verify;

    if (!verifyUser) {
      return res.status(400).send('Invalid verification request');
    }

    const user = await User.getByUsername(verifyUser);

    if (!user) {
      return res.status(400).send('User not found');
    }

    const mfaCode = generateMfaCode();
    await User.storeMfaCode(user.id, mfaCode);

    await sendEmail(user.email, mfaCode);

    res.sendFile(path.join(__dirname, '..', 'public', 'views', 'login2.html'));
  } catch (error) {
    console.error('2FA page error:', error);
    res.status(500).send('Error displaying 2FA page');
  }
});

router.post('/login2', async (req, res) => {
  try {
    const { 'mfa-code': mfaCode } = req.body;
    verifyUser = req.cookies.verify;
    if (!verifyUser) {
      return res.status(400).send('Invalid verification request');
    }

    const user = await User.getByUsername(verifyUser);
    if (!user) {
      return res.status(400).send('User not found');
    }

    const isValid = await User.verifyMfaCode(user.id, mfaCode);
    if (!isValid) {
      //console.log(isValid);
      return res.status(401).send('Invalid or expired 2FA code');
    }
    const removed = await User.removeMfaCode(user.id);
    //console.log(removed);

    req.session.user = user.username;
    req.session.authenticated = true;
    req.session.email = user.email;

    res.redirect('/user/my-account');
  } catch (error) {
    console.error('2FA verification error:', error);
    res.status(500).send(error);
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
