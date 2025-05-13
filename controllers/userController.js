const validator = require('validator');
const bcrypt    = require('bcryptjs');
const User      = require('../models/user');
const Item      = require('../models/item');
const Offer     = require('../models/offer');

exports.renderSignUp = (req, res) => {
  res.render('users/new');
};

exports.register = async (req, res) => {
  try {
    const fn = validator.escape(validator.trim(req.body.firstName));
    const ln = validator.escape(validator.trim(req.body.lastName));
    let email = validator.normalizeEmail(req.body.email);
    email     = validator.escape(email);
    const pass = validator.trim(req.body.password);

    if (!fn || !ln || !email || !pass) {
      req.flash('error', 'All fields are required.');
      return res.redirect('back');
    }
    if (!validator.isEmail(email)) {
      req.flash('error', 'Invalid email address.');
      return res.redirect('back');
    }
    if (!validator.isLength(pass, { min: 8, max: 64 })) {
      req.flash('error', 'Password must be 8–64 characters.');
      return res.redirect('back');
    }

    const hash = await bcrypt.hash(pass, 12);
    const user = await User.create({ firstName: fn, lastName: ln, email, password: hash });
    req.session.user = { _id: user._id, firstName: fn, lastName: ln, email };
    req.flash('success', 'Account created.');
    return res.redirect('/users/profile');
  } catch (err) {
    if (err.code === 11000) {
      req.flash('error', 'Email already in use. Please log in or choose another email.');
      return res.redirect('back');
    }
    console.error(err);
    req.flash('error', 'Internal Server Error');
    return res.redirect('back');
  }
};

exports.renderLogin = (req, res) => {
  res.render('users/login');
};

exports.login = async (req, res) => {
  try {
    let email = validator.trim(req.body.email);
    email     = validator.escape(email);
    email     = validator.normalizeEmail(email);
    const pass = validator.trim(req.body.password);

    if (!email || !pass) {
      req.flash('error', 'All fields are required.');
      return res.redirect('back');
    }
    if (!validator.isEmail(email)) {
      req.flash('error', 'Invalid email address.');
      return res.redirect('back');
    }
    if (!validator.isLength(pass, { min: 8, max: 64 })) {
      req.flash('error', 'Password must be 8–64 characters.');
      return res.redirect('back');
    }

    const user = await User.findOne({ email });
    if (!user) {
      req.flash('error', 'Invalid credentials.');
      return res.redirect('back');
    }
    const match = await bcrypt.compare(pass, user.password);
    if (!match) {
      req.flash('error', 'Invalid credentials.');
      return res.redirect('back');
    }

    req.session.user = { _id: user._id, firstName: user.firstName, lastName: user.lastName, email };
    req.flash('success', 'Logged in.');
    return res.redirect('/users/profile');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Internal Server Error');
    return res.redirect('back');
  }
};

exports.profile = async (req, res) => {
  const userId = req.session.user._id;
  const items  = await Item.find({ seller: userId });
  const offers = await Offer.find({ buyer: userId }).populate('item');
  res.render('users/profile', { items, offers });
};

exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) console.error(err);
    res.redirect('/users/login');
  });
};