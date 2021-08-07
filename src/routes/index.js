const router = require('express').Router();

const { signin, signup } = require('../controllers/authController');
const {
  getDetailCart,
  addCart,
  minusCart,
  getCountCart,
  deleteCart,
} = require('../controllers/cartController');
const {
  checkout,
  getTransactions,
  updateStatusTransaction,
  getDetailTransactions,
} = require('../controllers/orderController');
const {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  getAllProductsByAdmin,
  deleteProduct,
} = require('../controllers/productController');
const {
  getAllUsers,
  getUser,
  updateUser,
} = require('../controllers/userController');
const {
  authMiddleware,
  adminAccessMiddleware,
} = require('../middleware/authMiddleware');
const { uploadFileMiddleware } = require('../middleware/uploadFileMiddleware');

/** =================================================================================================== */

// Users route
router.get('/users', authMiddleware, adminAccessMiddleware, getAllUsers);
router.get('/user', authMiddleware, getUser);
router.patch(
  '/user',
  authMiddleware,
  uploadFileMiddleware('imageFile'),
  updateUser,
);

// Product route
router.get('/products', getAllProducts);
router.get('/product/:id', getProduct);
router.delete(
  '/product/:id',
  authMiddleware,
  adminAccessMiddleware,
  deleteProduct,
);
router.post(
  '/product',
  authMiddleware,
  adminAccessMiddleware,
  uploadFileMiddleware('imageFile'),
  createProduct,
);
router.patch(
  '/product/:id/update',
  authMiddleware,
  adminAccessMiddleware,
  uploadFileMiddleware('imageFile'),
  updateProduct,
);

router.get(
  '/products/admin',
  authMiddleware,
  adminAccessMiddleware,
  getAllProductsByAdmin,
);

// Cart route
router.post('/add-cart/:product_id', authMiddleware, addCart);
router.post('/minus-cart/:product_id', authMiddleware, minusCart);
router.get('/detail-cart', authMiddleware, getDetailCart);
router.get('/count-cart', authMiddleware, getCountCart);
router.delete('/cart/:cart_id/delete', authMiddleware, deleteCart);

// checkout
router.post(
  '/checkout',
  authMiddleware,
  uploadFileMiddleware('imageFile'),
  checkout,
);

// transactions
router.get('/transactions', authMiddleware, getTransactions);
router.get('/transactions/:order_id', authMiddleware, getDetailTransactions);
router.patch(
  '/transactions/:order_id/update',
  authMiddleware,
  updateStatusTransaction,
);

// AUTH
router.post('/login', signin);
router.post('/register', signup);

module.exports = router;
