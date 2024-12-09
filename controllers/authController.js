'use strict';

const controller= {};
const sequelize= require('sequelize');
const models= require('../models');

const passport = require('./passport');
controller.show= (req,res) => {
    if(req.isAuthenticated()) {
        return res.redirect('/');
    }
    res.render('login',{loginMessage:req.flash('loginMessage'),reqUrl: req.query.reqUrl,registerMessage:req.flash('registerMessage')});
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

controller.register = (req, res, next) => {
    let reqUrl = req.body.reqUrl ? req.body.reqUrl : '/users/my-account';
    let cart = req.session.cart;
    passport.authenticate('local-register', (error, user) => {
        if (error) { return next(error); }
        if (!user) { return res.redirect(`/users/login?reqUrl=${reqUrl}`); }
        req.logIn(user, (error) => {
            if (error) { return next(error); }
            req.session.cart = cart;
            res.redirect(reqUrl);
        });
    })(req, res, next);
};


//forgot pass
controller.showForgotPassword = (req, res) => {
    res.render('forgot-password');
}

//forgot pass
controller.forgotPassword = async (req, res) => {
    let email = req.body.email;
    // kiem tra neu email ton tai
    let user = await models.User.findOne({ where: { email } });
    if (user) {
        // Tao link
        const {sign} = require('./jwt');
        const host = req.header('host');
        const resetLink = `${req.protocol}://${host}/users/reset?token=${sign(email)}&email=${email}`;
        console.log("resetlink"+resetLink);
        // Gui mail
        const {sendForgotPasswordMail} = require('./mail');
        sendForgotPasswordMail(user, host, resetLink)
            .then((result) => {
                console.log('email has been sent');
                return res.render('forgot-password', { done: true });
            })
            .catch(error =>{
                console.log(error.statusCode);
                return res.render('forgot-password', { message: 'Error occur , Failed to send email!, check your mail address' });
            })
    } else {
        // nguoc lai, thong bao email ko ton tai
        return res.render('forgot-password', { message: 'Email does not exist!' });
    }
};



//reset pass
controller.showResetPassword = (req, res) => {
    const email = req.query.email;
    const token = req.query.token;
    const { verify } = require('./jwt');

    console.log("Received token:", token);
    console.log("Received email:", email);

    if (!token) {
        console.error("Token is missing.");
        return res.render('reset-password', { expired: true, email, token });
    }

    const isTokenValid = verify(token);
    if (!isTokenValid) {
        console.error("Token is invalid or expired.");
        return res.render('reset-password', { expired: true, email, token });
    }

    console.log("Token is valid. Rendering reset password page.");
    return res.render('reset-password', { expired: false, email, token });
};


controller.resetPassword= async (req, res) => {
    console.log("In controller, req.body:", req.body); // Debugging
    let email = req.body.email;
    let token = req.body.token;

    if (!email || !token ) {
        console.error("Missing data in req.body:", req.body);
    }

    let bcrypt= require('bcrypt');
    console.log(email);
    let password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8));

    console.log("Updating user:", { email, password });

    try {
        await models.User.update({ password: password }, { where: { email } });
        return res.render('reset-password', { done: true });
      } catch (err) {
        console.error("Database update failed:", err);
        return res.status(500).send('An error occurred.');
      }
}
module.exports= controller;