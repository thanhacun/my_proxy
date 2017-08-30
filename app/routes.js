const bodyParser = require('body-parser');

//const User = require('./models/user');

//TODO: using mongodb to save apps data
const Apps = require('../config/apps');

module.exports = function(app, passport, proxy) {
    //Handle main logic reversing here
    app.use(function(req, res, next){
        switch (req.originalUrl){
            //using RegEx in case string: https://stackoverflow.com/questions/2896626/switch-statement-for-string-matching-in-javascript
            case (req.originalUrl.match(/^\/login/) || {}).input:
            case (req.originalUrl.match(/^\/signup/) || {}).input:
                next();
                break;
            default:
                let reverseUrl;
                if (req.isAuthenticated()){
                    
                    reverseUrl = Apps.reduce(function(finalUri, app){
                        if (app.app_des == req.session.app) {
                            return finalUri + app.app_uri;
                        } else {
                            return finalUri;
                        }
                    }, "");
                    
                    switch (req.user.local.email) {
                        case 'trang.pham@ttncorp.vn':
                            //console.log('Reverse to TTNCORP');
                            reverseUrl = {target: reverseUrl || 'http://192.168.0.125:8090'};
                            break;
                            
                        case 'thanhacun@yahoo.com':
                            //console.log('Reverse to KDVN');
                            reverseUrl = {target: reverseUrl || 'http://192.168.0.64:8890'};
                            break;
                        
                        case 'info@kinden.com.vn':
                            reverseUrl = {target: reverseUrl || 'http://192.168.0.64:8890'};
                            break;
                        
                        default:
                            reverseUrl = {};
                            
                    }
                    if (reverseUrl.target) return proxy.web(req, res, reverseUrl);
                    res.render('index.ejs');
                } else {
                    //console.log(req.originalUrl, req.path);
                    res.redirect('/login' + req.path);
                }
        }
    });
    
    //handle proxy error
    proxy.on('error', function(e, req, res){
        switch (e.code){
            case 'ECONNREFUSED':
                res.end(`Connection error code: ${e.code}, please contact Mr. Thanh :)`);
                break;
                
            default:
                res.end(`Error code: ${e.code}, please contact Mr. Thanh :)`);
        }
    });
    
    //Handle login and signin
    //Only use body-parser here
    
    app.use(bodyParser());
    app.get('/login*', function(req, res){
        //Remember path to be return
        req.session.returnTo = req.path;
        //TODO get apps list
        res.render('login.ejs', { message: req.flash('loginMessage'), apps: Apps.map(function(app){return {name: app.app_des}}) });
    });
    
    app.post('/login', passport.authenticate('local-login', {
        //successRedirect: '/',
        failureRefesh: true,
        failureRedirect: '/login'
    }), function(req, res){
        console.log('Redirect to', req.body.app, " @ ", req.session.returnTo);
        req.session.app = req.body.app;
        //req.session.returnTo = req.session.returnTo.replace("/login", "");
        res.redirect(req.session.returnTo.replace("/login", "") || '/');
    });
    
    app.get('/signup', function(req, res){
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });
    
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/login',
        failureRedirect: '/signup',
        failureRefesh: true
    }));
    
    // app.get('/logout', function(req, res){
    //     req.logout();
    //     res.redirect('/');
    // });
};

//route middleware to make sure a user is logged in
function isLoggedIn(req, res, next){
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}