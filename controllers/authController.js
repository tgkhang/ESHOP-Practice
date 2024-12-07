'use strict';

const controller= {};
const passport = require('./passport');
controller.show= (req,res) => {
    if(req.isAuthenticated()) {
        return res.redirect('/');
    }
    res.render('login',{loginMessage:req.flash('loginMessage'),reqUrl: req.query.reqUrl});
};


// Login controller function
controller.login = (req, res, next) => {
    // Extracting the 'keepSignedIn' value from the request body
    let keepSignedIn = req.body.keepSignedIn;
    let cart= req.session.cart;
    let reqUrl= req.body.reqUrl ? req.body.reqUrl : '/users/my-account';
    // Authenticate using the 'local-login' strategy
    passport.authenticate('local-login', (error, user) => {
        // If there is an error during authentication, pass it to the next middleware
        if (error) {
            return next(error);
        }

        // If no user is found, redirect to the login page
        if (!user) {
            return res.redirect(`/users/login?reqUrl=${reqUrl}`);
        }

        // Log in the user using req.logIn provided by Passport.js
        req.logIn(user, (error) => {
            // Handle login errors
            if (error) {
                return next(error);
            }

            // Set the session cookie expiration based on 'keepSignedIn'
            req.session.cookie.maxAge = keepSignedIn ? (24 * 60 * 60 * 1000) : null;
            req.session.cart=cart;
            // Redirect the user to their account page after successful login
            return res.redirect(reqUrl);
        });
    })(req, res, next); // Passing req, res, and next to the authenticate middleware
};
controller.logout = (req, res, next) => {
    let cart=req.session.cart;
    req.logout((error) => {
        if(error) {return next(error);}
        req.session.cart=cart;
    res.redirect('/');
    });
}

//middleware
controller.isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect(`/users/login?reqUrl=${req.originalUrl}`);
}

module.exports= controller;