require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const crypto = require('crypto');

const generateRandomString = (length) => {
  return crypto.randomBytes(length).toString('hex');
};

const secretKey = process.env.SESSION_SECRET || generateRandomString(32);

const configureSession = (app) => {
  app.set('view engine', 'ejs');
  app.use(session({
    secret: secretKey,
    resave: false,
    saveUninitialized: true
  }));
  app.use(passport.initialize());
  app.use(passport.session());
};

const configurePassport = () => {
  // Add your Passport configuration code here
  require('./passport-setup');
};

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
};

const app = express();

configureSession(app);
configurePassport();

app.get('/', (req, res) => {
  res.render('pages/index');
});

app.get('/success', (req, res) => {
  res.render('pages/profile', {
    name: req.user.displayName,
    email: req.user.emails[0].value,
    pic: req.user.photos[0].value
  });
});

app.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/google/callback', passport.authenticate('google', { failureRedirect: '/failed' }),
  (req, res) => {
    res.redirect('/success');
  });

app.get('/logout', (req, res) => {
  req.logout((e)=>{
    console.log(e);
  });
  res.redirect('/');
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on Port ${PORT}`);
});
