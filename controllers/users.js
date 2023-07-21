const User = require('../models/user');

//註冊
module.exports.renderRegister = (req, res) => {
    res.render('users/register')
}
module.exports.register = async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', '成功註冊');
            res.redirect('/campgrounds');
        })
    } catch (e) {
        req.flash('error', '該名稱已被註冊');
        res.redirect('/register');
    }
}


//登入-authenticate是passport內建的功能
module.exports.renderLogin = (req, res) => {
    res.render('users/login');
}


module.exports.login = (req, res) => {
    req.flash('success', '好久不見!');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

//登出
module.exports.logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', '成功登出');
        res.redirect('/campgrounds');
    });
}