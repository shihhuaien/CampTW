const express = require('express');
//這邊{ mergeParams: true }很重要，如果沒有設定會導致更上級的:id params傳不進來
const router = express.Router({ mergeParams: true });
const { isLoggedIn, validateReview, isReviewAuthor } = require('../middleware');
const catchAsync = require('../utils/catchAsync');
const Review = require('../models/review');
const Campground = require('../models/campground');
const review = require('../controllers/reviews');

//route設定-new review
router.post('/', isLoggedIn, validateReview, catchAsync(review.newReview))

//route設定-delete review
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(review.deleteReview))


module.exports = router;