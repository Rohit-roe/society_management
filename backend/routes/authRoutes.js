const express = require('express');
const router = express.Router();
const { register, registerSocietyRequest, login } = require('../controllers/authController');

router.post('/register', register);
router.post('/register-society-request', registerSocietyRequest);
router.post('/login', login);

module.exports = router;
