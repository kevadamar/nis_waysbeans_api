const router = require('express').Router();

const { signin, signup } = require('../controllers/authController');
const { getAllProducts, getProduct } = require('../controllers/productController');
const { getAllUsers } = require('../controllers/userController');
const {
  authMiddleware,
  adminAccessMiddleware,
} = require('../middleware/authMiddleware');


// Users route
router.get('/users', authMiddleware, adminAccessMiddleware, getAllUsers);

// Product route
router.get('/products', getAllProducts);

// AUTH
router.post('/login', signin);
router.post('/register', signup);

module.exports = router;
