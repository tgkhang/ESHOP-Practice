'use strict';
const express= require('express');
const router= express.Router();
const controller = require('../controllers/usersController');

const {body, resultValidation, validationResult}= require("express-validator")

router.get('/checkout', controller.checkout);

router.post('/placeorders',
    body('firstName').notEmpty().withMessage('First name is require'),
    body('lastName').notEmpty().withMessage('Last name is require'),
    body('email').notEmpty().withMessage('Email is require').isEmail().withMessage('invalid Email'),
    body('mobile').notEmpty().withMessage('Mobile is require'),
    body('address').notEmpty().withMessage('Address is require'),
    (req,res,next)=>{

        let errors= validationResult(req);
        if(req.body.addressId=="0" && !errors.isEmpty())
        {
            let errorArray = errors.array();
            let message ='';
            for(let i=0;i<errorArray;i++)
            {
                message+= errorArray[i].msg +"<br/>"
            }
            return res.render('error',{message});
        }
        next();
    },
    controller.placeorders
);

router.get('/my-account',(req,res)=>{
    res.render('my-account');
})

module.exports= router;