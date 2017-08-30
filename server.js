const express = require('express');
const app = express();
const port = process.env.PORT || 8888;
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const httpProxy = require('http-proxy');
const proxy = httpProxy.createProxyServer();

const morgan = require('morgan');
const cookieParser = require('cookie-parser');
//const bodyParser = require('body-parser');
const session = require('express-session');

const configDB = require('./config/database.js');

mongoose.connect(configDB.url);

require('./config/passport')(passport);

app.use(morgan('dev'));
app.use(cookieParser());

//NOTE: bodyParser does not play well with http-proxy
//app.use(bodyParser());

app.set('view engine', 'ejs');

app.use(session({ secret: 'ilovejavacript'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

require('./app/routes.js')(app, passport, proxy);

app.listen(port);
console.log(`The magic is on port ${port}`);