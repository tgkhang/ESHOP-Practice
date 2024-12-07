'use strict';

const controller= {};
const passport = require('./passport');
controller.show= (req,res) => {
    res.render('login',{loginMessage:req.flash('loginMessage')});
};


// Login controller function
controller.login = (req, res, next) => {
    // Extracting the 'keepSignedIn' value from the request body
    let keepSignedIn = req.body.keepSignedIn;

    // Authenticate using the 'local-login' strategy
    passport.authenticate('local-login', (error, user) => {
        // If there is an error during authentication, pass it to the next middleware
        if (error) {
            return next(error);
        }

        // If no user is found, redirect to the login page
        if (!user) {
            return res.redirect('/users/login');
        }

        // Log in the user using req.logIn provided by Passport.js
        req.logIn(user, (error) => {
            // Handle login errors
            if (error) {
                return next(error);
            }

            // Set the session cookie expiration based on 'keepSignedIn'
            req.session.cookie.maxAge = keepSignedIn ? (24 * 60 * 60 * 1000) : null;

            // Redirect the user to their account page after successful login
            return res.redirect('/users/my-account');
        });
    })(req, res, next); // Passing req, res, and next to the authenticate middleware
};
controller.logout = (req, res, next) => {
    req.logout((error) => {
        if(error) {return next(error);}
    res.redirect('/');
    });
}

module.exports= controller;