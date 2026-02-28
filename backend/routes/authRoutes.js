const express = require('express');
const router = express.Router();
// ADD githubLogin to the list below:
const { register, login, googleLogin, githubLogin } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/google-login', googleLogin);
router.post('/github-login', githubLogin); // This matches line 8 in your error

module.exports = router;