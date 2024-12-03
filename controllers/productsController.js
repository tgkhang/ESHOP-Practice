let controller= {};
const { where } = require('sequelize');
const models=require('../models');



controller.show=async (req,res)=> {

    //take the input category from client
    let category= isNaN(req.query.category) ? 0: parseInt(req.query.category);

    //take the input category from client
    let brand= isNaN(req.query.brand) ? 0: parseInt(req.query.brand);
    
    //take the input category from client
    let tag= isNaN(req.query.tag) ? 0: parseInt(req.query.tag);


    let brands=await models.Brand.findAll({
        include: [{
            model: models.Product
        }]
    })
    res.locals.brands=brands;

    //tagname
    let tags=await models.Tag.findAll();
    res.locals.tags=tags;
     

    //join table categories
    let categories= await models.Category.findAll({
        include: [ {
            model:models.Product
        }]
    });
    res.locals.categories=categories;


    let options= {
        attributes: ['id','name','imagePath','stars','price','oldPrice'],
        where: { }
    };
    if(category>0){
        options.where.categoryId= category;
    }
    if(brand>0){
        options.where.brandId= brand;
    }
    if(tag>0){
        options.include=[{
            model: models.Tag,
            where: {id:tag}
        }]
    }


    let products= await models.Product.findAll(options);
    res.locals.products= products;
    res.render('product-list')
}


module.exports= controller;