'use strict';

let controller= {};

let models= require('../models');
controller.add= async(req,res)=> {
    let id= isNaN(req.body.id)? 0 :parseInt(req.body.id);
    let quantity= isNaN(req.body.quantity)? 0 :parseInt(req.body.quantity);


    let product= await models.Product.findByPk(id);
    if(product && quantity>0)
    {
        req.session.cart.add(product,quantity);
    }
    return res.json({quantity: req.session.cart.quantity});
}
controller.show= async (req,res)=>{
    res.locals.cart= req.session.cart.getCart();
    return res.render('cart');
}
controller.update = async (req,res) =>{
    let id= isNaN(req.body.id)? 0 :parseInt(req.body.id);
    let quantity= isNaN(req.body.quantity)? 0 :parseInt(req.body.quantity);

    if(quantity>0)
    {
        let updatedItem= req.session.cart.update(id,quantity);
    
        return res.json({
            quantity: req.session.cart.quantity,
            item : updatedItem,
            subtotal:req.session.cart.subtotal,
            total: req.session.cart.total
        });
    }
    res.sendStatus(204).end();
}

module.exports= controller;