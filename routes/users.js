  
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');

// const User = require('../../models/User');
const db = require('../models');

// Login Page
router.get('/login', (req, res) => res.render('login', {layout: "dashboard"}));

// Register Page
router.get('/register', (req, res) => res.render('register', {layout: "dashboard"}));

// Register
router.post('/register', (req, res) => {
  console.log(req.body);
  const { name, email, password, password2, businessType, employees, zipCode, mileage, totalPayroll } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
      console.log(errors);
    res.render('register', {
      errors,
      name,
      email,
      password,
      password2
    });
  } else {
    db.User.findOne({ email: email }).then(user => {
      if (user) {
        errors.push({ msg: 'Email already exists' });
        res.render('register', {
          errors,
          name,
          email,
          password,
          password2
        });
      } else {
        const newUser = new db.User({
          name,
          email,
          password,
          businessType,
          employees,
          totalPayroll,
          mileage,
          zipCode
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                res.redirect('/users/login');
              })
              .catch(err => console.log(err));
          });
        });
      }
    }).catch(err => console.log(err));
  }
});

// Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/users/myInfo',
    failureRedirect: '/users/login',
    // failureFlash: true
  })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/users/login');
});

// Dashboard
router.get('/myInfo', (req, res) =>
  res.render('myInfo', {
    user: req.user
  })
);


module.exports = router;