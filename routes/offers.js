const express = require('express');
const router  = express.Router({ mergeParams: true });
const offersC = require('../controllers/offersController');
const { isLoggedIn, isSeller } = require('./middleware');

// Make an offer (login required)
router.post('/', isLoggedIn, offersC.makeOffer);

// View offers on your item (login + seller)
router.get('/', isLoggedIn, isSeller, offersC.viewOffers);

// Accept an offer (login + seller)
router.put('/:offerId/accept', isLoggedIn, isSeller, offersC.acceptOffer);

module.exports = router;