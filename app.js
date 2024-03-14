require('dotenv').config();

const express = require('express');
const expressLayout = require('express-ejs-layouts');
const methodOverride = require('method-override');
const session = require('express-session');
/* per prendere/utilizzare/gestire cookies
in questo caso li usiamo per restare in sessione */
const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo');
const connectDB = require('./server/config/db');
const { isActiveRoute } = require('./server/helpers/routeHelpers');
global.rootPath = __dirname;

const app = express();
const PORT = 3000 || process.env.PORT;

// connect to DB
connectDB();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    /* MongoStore creerà i cookies che ci serviranno per la sessione */
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI
    }),
    /* nel caso voglio dare una scadenza al cookie */
    //cookie: { maxAge: new Date ( Date.now() + (3600000) ) }
}));

// abilito i file statici, vado a mettere gli assets
app.use(express.static('assets'));

// template engine
app.use(expressLayout);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

app.locals.isActiveRoute = isActiveRoute;

app.use('/', require('./server/routes/main'));
app.use('/', require('./server/routes/admin'));

app.listen(PORT, () => { 
    console.log(`App is running on port ${PORT}`);
});