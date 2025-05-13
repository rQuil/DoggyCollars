const express = require('express');
const router  = express.Router();
const itemsC  = require('../controllers/itemsController');
const multer  = require('multer');
const offersR = require('./offers');
const { isLoggedIn, isSeller } = require('./middleware');

// Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/images'),
  filename:    (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// list & search
router.get('/', itemsC.index);

// NEW & CREATE require login
router.get('/new', isLoggedIn, itemsC.new);
router.post('/', isLoggedIn, upload.single('image'), itemsC.create);

// item detail
router.get('/:id', itemsC.show);

// EDIT, UPDATE, DELETE require seller
router.get('/:id/edit', isSeller, itemsC.edit);
router.put('/:id', isSeller, upload.single('image'), itemsC.update);
router.delete('/:id', isSeller, itemsC.delete);

// nested
router.use('/:id/offers', offersR);

module.exports = router;
