// redefine necessary function

'use strict'

const LocalTrategy = require('passport-local');
const bcrypt= require('bcrypt');
const models=require('../models');
const passport = require('passport');


//gọi xác thực thành công, save user information to session 
passport.serializeUser((user, done) => {
    done(null, user.id);
});

//call by passport.seesion, to take user info from db , push to req.user
passport.deserializeUser(async(id, done) => {
    try{
        let user= await models.User.findOne({
            attributes: ['id','firstName','lastName','email','mobile','isAdmin'],
            where: {id}
        });
        done(null, user);
    }
    catch(err){
        //console.error(err);
        done(err,null);
    }
})

//authen when login
passport.use('local-login',new LocalTrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true// cho phép truền vào call back để kiểm tra xem userr login chưa
}, async(req,email,password,done)=>{
    if(email){
        email=email.toLowerCase();// lowercase
    }
    try{
        if(!req.user){// not login yet
            let user=await models.User.findOne({where:{email}});
            if(!user){ //email not found
                return done(null, false, req.flash('loginMessage','Email does not exist!'));
            }
            if(!bcrypt.compareSync(password,user.password)){
                return done(null, false, req.flash('loginMessage','InvalidPassword'));
            }
            //true allow login
            return done(null, user);
        }
        // skip login , login already
        done(null, req.user);
    }catch(error){
        console.error('Error during login:', error);
        done(error);
    }
}));

module.exports =passport;