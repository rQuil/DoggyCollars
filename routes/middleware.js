const mongoose = require('mongoose');
const Item     = require('../models/item');

exports.isLoggedIn = (req, res, next) => {
  if (!req.session.user) {
    req.flash('error', 'Please log in first.');
    return res.redirect('/users/login');
  }
  next();
};

exports.isSeller = async (req, res, next) => {
  const itemId = req.params.id;
  if (!mongoose.isValidObjectId(itemId)) {
    return res.status(400).render('error', { code: 400, errorMessage: 'Invalid item ID' });
  }
  const item = await Item.findById(itemId);
  if (!item) {
    return res.status(404).render('error', { code: 404, errorMessage: 'Item not found' });
  }
  if (!req.session.user || item.seller.toString() !== req.session.user._id) {
    return res.status(401).render('error', { code: 401, errorMessage: 'Unauthorized access' });
  }
  next();
};