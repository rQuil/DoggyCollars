const express = require('express');
const router  = express.Router();
const uc      = require('../controllers/userController');

const guestOnly  = (req,res,next) => {
  if (req.session.user) {
    req.flash('error','You are already logged in.');
    return res.redirect('/users/profile');
  }
  next();
};
const isLoggedIn = (req,res,next) => {
  if (!req.session.user) {
    req.flash('error','Please log in first.');
    return res.redirect('/users/login');
  }
  next();
};

router.get('/new',      guestOnly, uc.renderSignUp);
router.post('/',        guestOnly, uc.register);
router.get('/login',    guestOnly, uc.renderLogin);
router.post('/login',   guestOnly, uc.login);
router.get('/profile',  isLoggedIn, uc.profile);
router.get('/logout',   isLoggedIn, uc.logout);

module.exports = router;
