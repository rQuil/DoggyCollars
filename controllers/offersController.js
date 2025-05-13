const mongoose  = require('mongoose');
const validator = require('validator');
const Offer     = require('../models/offer');
const Item      = require('../models/item');

exports.makeOffer = async (req, res) => {
  const itemId = req.params.id;
  let amountStr = validator.escape(validator.trim(req.body.amount));
  if (!validator.isFloat(amountStr, { min: 0.01 })) {
    req.flash('error', 'Offer must be at least 0.01');
    return res.redirect('back');
  }
  const amount = parseFloat(amountStr);
  try {
    const item = await Item.findById(itemId);
    if (!item.active) {
      req.flash('error', 'Cannot offer on inactive item.');
      return res.redirect('back');
    }
    // cant offer on own item
    if (item.seller.toString() === req.session.user._id) {
      return res.status(401).render('error', { code: 401, errorMessage: 'Unauthorized access' });
    }
    await Offer.create({ amount, buyer: req.session.user._id, item: itemId });
    await Item.findByIdAndUpdate(itemId, {
      $inc: { totalOffers: 1 },
      $max: { highestOffer: amount }
    });
    req.flash('success', 'Offer made successfully!');
    res.redirect(`/items/${itemId}`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Internal Server Error');
    res.redirect('back');
  }
};

exports.viewOffers = async (req, res) => {
  const item = await Item.findById(req.params.id);
  const offers = await Offer.find({ item: item._id }).populate('buyer');
  res.render('offers/offers', { offers, item });
};

exports.acceptOffer = async (req, res) => {
  const { id: itemId, offerId } = req.params;
  try {
    await Item.findByIdAndUpdate(itemId, { active: false });
    await Offer.findByIdAndUpdate(offerId, { status: 'accepted' });
    await Offer.updateMany(
      { item: itemId, _id: { $ne: offerId }, status: 'pending' },
      { status: 'rejected' }
    );
    req.flash('success', 'Offer accepted.');
    res.redirect(`/items/${itemId}/offers`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Internal Server Error');
    res.redirect('back');
  }
};