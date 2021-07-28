const { signin, signup } = require('../controllers/authController');
const { getAllUsers } = require('../controllers/userController');
const { authMiddleware, adminAccessMiddleware } = require('../middleware/authMiddleware');

const router = require('express').Router();

// Users route
router.get('/users', authMiddleware, adminAccessMiddleware, getAllUsers);

// AUTH
router.post('/login', signin);
router.post('/register', signup);

module.exports = router;
