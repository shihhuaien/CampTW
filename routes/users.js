const express = require('express');
const router = express.Router();
const catchAcync = require('../utils/catchAsync');
const User = require('../models/user');
const passport = require('passport');
const { storeReturnTo } = require('../middleware');
const { isLoggedIn } = require('../middleware');
const user = require('../controllers/users')


router.route('/register')
    .get(user.renderRegister)
    .post(catchAcync(user.register))

router.route('/login')
    .get(user.renderLogin)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), user.login)

router.get('/logout', user.logout);


module.exports = router;