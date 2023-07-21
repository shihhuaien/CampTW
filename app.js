if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}


const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');

const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');
const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/campTW';

const MongoStore = require('connect-mongo');
//連線atlas db 
// mongoose.connect(dbUrl);
// const db = mongoose.connection;
// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', () => {
//     console.log('Database connected!')
// });

// const store = MongoStore.create({
//     mongoUrl: dbUrl,
//     touchAfter: 24 * 60 * 60,
//     crypto: {
//         secret: 'thisshouldbeabettersecret!'
//     }
// });


//連線local db 
mongoose.connect('mongodb://127.0.0.1:27017/campTW');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected!')
});

const store = MongoStore.create({
    mongoUrl: 'mongodb://127.0.0.1:27017/campTW',
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: 'thisshouldbeabettersecret!'
    }
});




store.on('error', function (e) {
    console.log('session store error', e);
})

const app = express();

//設定 ejs template
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//設定style的模板
app.engine('ejs', ejsMate);

// 使用session
const sessionConfig = {
    //下面這行也可以寫成store:store,
    store,
    name: 'session',
    secret: 'thisisacampingsecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure:true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));

app.use(flash());//使用flash

app.use(mongoSanitize());
// 使用public作為靜態檔案
app.use(express.static(path.join(__dirname, 'public')));
// req.body解碼
app.use(express.urlencoded({ extended: true }));
// 使用POST和GET之外的method
app.use(methodOverride('_method'));
// 使用passport，注意：passport.session()要放在pp.use(session(sessionConfig))之後
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//通用的middleware
app.use((req, res, next) => {
    res.locals.currentUser = req.user;//req.user是passport幫我們設定的
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


//route設定-home
app.get('/', (req, res) => {
    res.render('home')
})

//campground router
app.use('/campgrounds', campgroundRoutes)
//review router
app.use('/campgrounds/:id/reviews', reviewRoutes)
//user router
app.use('/', userRoutes)

//不想顯示任何 favicon，也不想讓瀏覽器對 favicon.ico 的請求觸發錯誤，所以寫這行處理錯誤訊息
app.get('/favicon.ico', (req, res) => res.status(204));

//錯誤處理-如果前面的路徑全部都無效，走這步
app.all('*', (req, res, next) => {
    console.log(`Unhandled request path: ${req.path}`);
    next(new ExpressError('找不到頁面', 404))
})

//捕捉錯誤的最後一道防線
app.use((err, req, res, next) => {
    if (!err.status) { err.status = 500 };
    if (!err.message) { err.message = '怪怪的' };
    res.status(err.status).render('errors/error', { err });
    console.log('發生錯誤（最後一道防線捕捉）', err)
})

//express server 啟動
app.listen(3000, () => { console.log('Serving on port 3000') })
