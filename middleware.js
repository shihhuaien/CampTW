const { CampgroundSchema, ReviewSchema } = require('./schemas.js');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');


module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', '需要先登入');
        return res.redirect('/login');
    };
    next();
}

module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}


// 設定server端的validation
module.exports.validateCampground = (req, res, next) => {
    const { error } = CampgroundSchema.validate(req.body);
    if (error) {
        console.log(error);
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400)
    } else { next() }
}

//  middleware：檢查campground中的author
module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', '沒有權限');
        return res.redirect(`/campgrounds/${id}`)
    } else { next() }
}

//  middleware：檢查view中的author
module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', '沒有權限');
        return res.redirect(`/campgrounds/${id}`)
    } else { next() }
}

// 設定server端的validation
module.exports.validateReview = (req, res, next) => {
    const { error } = ReviewSchema.validate(req.body);
    if (error) {
        console.log(error);
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400)
    }
    else { next() }
}