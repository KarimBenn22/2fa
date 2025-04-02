const express = require('express');
const router = express.Router();
const path = require('path');
const ejs = require('ejs');

const isAuthenticated = (req, res, next) => {
  //console.log('------checking if user is authenticated------');
  //console.log('req.session.user: ', req.session.user);
  if (!req.session.user || !req.session.authenticated) {
    return res.redirect('/login');
  }
  next();
};

router.get('/my-account', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'views', 'my-account.html'));
});

router.post('/user-info', (req, res) => {
  if (!req.session.authenticated) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  //console.log(req.session);
  res.json({ username: req.session });
});

module.exports = router;
