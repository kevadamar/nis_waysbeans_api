const { signin } = require('../controllers/authController');
const { getAllUsers } = require('../controllers/userController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = require('express').Router();

// Users route
router.get('/users', authMiddleware, getAllUsers);

// AUTH
router.post('/login', signin);

module.exports = router;
