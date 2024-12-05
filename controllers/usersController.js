'use strict'

const controller= {};

const models= require('../models')

controller.checkout= async (req,res) => {
    if(req.session.cart.quatity>0)
    {
        let userId=1;
        res.locals.addresses= await models.Address.findAll({where: {userId}});


        res.locals.cart= req.session.cart.getCart();
        res.render('checkout');
    }
    res.redirect('/products');
    
}

module.exports=controller