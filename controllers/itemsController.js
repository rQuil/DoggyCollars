const mongoose = require('mongoose');
const Item  = require('../models/item');
const Offer = require('../models/offer');
const validator = require('validator');

exports.index = async (req, res) => {
  try {
    const filter = { active: true };
    if (req.query.search) {
      filter.$or = [
        { title:   { $regex: req.query.search, $options: 'i' } },
        { details: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    const items = await Item.find(filter).sort({ price: 1 });
    res.render('items', { items, search: req.query.search || '' });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { code: 500, errorMessage: 'Internal Server Error' });
  }
};

exports.show = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).render('error', { code: 400, errorMessage: 'Invalid item ID' });
  }
  try {
    const item = await Item.findById(id).populate('seller');
    if (!item) {
      return res.status(404).render('error', { code: 404, errorMessage: 'Item not found' });
    }
    res.render('item', { item });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { code: 500, errorMessage: 'Internal Server Error' });
  }
};

exports.new = (req, res) => {
  res.render('new');
};

exports.create = async (req, res) => {
  if (!req.session.user) {
    req.flash('error', 'Please log in to list an item.');
    return res.redirect('/users/login');
  }
  let { title, condition, price, details } = req.body;
  title   = validator.escape(validator.trim(title));
  details = validator.escape(validator.trim(details));
  if (!validator.isFloat(price, { min: 0.01 })) {
    req.flash('error', 'Price must be at least 0.01');
    return res.redirect('back');
  }
  price = parseFloat(price);
  if (!['New','Like New','Very Good','Good','Other'].includes(condition)) {
    req.flash('error', 'Invalid condition.');
    return res.redirect('back');
  }
  const imagePath = req.file ? req.file.path.replace('public','') : '/images/titledog.jpg';

  try {
    await Item.create({
      title, seller: req.session.user._id,
      condition, price, details,
      image: imagePath, active: true
    });
    req.flash('success', 'Item created successfully!');
    res.redirect('/items');
  } catch (err) {
    console.error(err);
    req.flash('error', err.message || 'Internal Server Error');
    res.redirect('back');
  }
};

exports.edit = async (req, res) => {
  const item = await Item.findById(req.params.id);
  res.render('edit', { item });
};

exports.update = async (req, res) => {
  let { title, condition, price, details } = req.body;
  title   = validator.escape(validator.trim(title));
  details = validator.escape(validator.trim(details));
  if (!validator.isFloat(price, { min: 0.01 })) {
    req.flash('error', 'Price must be at least 0.01');
    return res.redirect('back');
  }
  price = parseFloat(price);
  if (!['New','Like New','Very Good','Good','Other'].includes(condition)) {
    req.flash('error', 'Invalid condition.');
    return res.redirect('back');
  }
  const updateData = { title, condition, price, details };
  if (req.file) updateData.image = req.file.path.replace('public','');

  try {
    await Item.findByIdAndUpdate(req.params.id, updateData, { runValidators: true });
    req.flash('success', 'Item updated successfully!');
    res.redirect(`/items/${req.params.id}`);
  } catch (err) {
    console.error(err);
    req.flash('error', err.message || 'Internal Server Error');
    res.redirect('back');
  }
};

exports.delete = async (req, res) => {
  try {
    await Offer.deleteMany({ item: req.params.id });
    await Item.findByIdAndDelete(req.params.id);
    req.flash('success', 'Item & its offers deleted successfully!');
    res.redirect('/items');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Internal Server Error');
    res.redirect('back');
  }
};
