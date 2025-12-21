const express = require('express');
const router = express.Router();
const { loginUser, forgotPassword, resetPassword } = require('../controllers/auth.controller');

router.post('/login', loginUser);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:token', resetPassword);

module.exports = router;