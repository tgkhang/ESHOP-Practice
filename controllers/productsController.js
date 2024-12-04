'use strict'
let controller= {};
const { where } = require('sequelize');
const models=require('../models');
const sequelize= require('sequelize');
const Op=sequelize.Op;

controller.getData= async(req,res,next)=>{
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
    next();
}
controller.show=async (req,res)=> {

    //take the input category from client
    let category= isNaN(req.query.category) ? 0: parseInt(req.query.category);

    //take the input category from client
    let brand= isNaN(req.query.brand) ? 0: parseInt(req.query.brand);
    
    //take the input category from client
    let tag= isNaN(req.query.tag) ? 0: parseInt(req.query.tag);


    //search
    let keyword= req.query.keyword || '';

    //sort
    //let sort= req.query.sort ||'price';
    let sort= ['price','newest','popular'].includes(req.query.sort) ? req.query.sort: 'price';
    let page= isNaN(req.query.page)?1: Math.max(1,parseInt(req.query.page));
    // let brands=await models.Brand.findAll({
    //     include: [{
    //         model: models.Product
    //     }]
    // })
    // res.locals.brands=brands;

    // //tagname
    // let tags=await models.Tag.findAll();
    // res.locals.tags=tags;
     

    // //join table categories
    // let categories= await models.Category.findAll({
    //     include: [ {
    //         model:models.Product
    //     }]
    // });
    // res.locals.categories=categories;


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
    // console.log(keyword);
    if(keyword.trim()!=''){
        options.where.name = {
            [Op.iLike]: `%${keyword}%`,
        }
    }
    switch(sort){
        case 'newest':
            options.order= [['createdAt','DESC']];
            break;
        case 'popular':
            options.order= [['stars','DESC']];
            break;
        default:  
        options.order= [['price','ASC']];
    }
    //console.log(req.originalUrl);
    res.locals.sort=sort;
    res.locals.originalUrl =removeParam('sort',req.originalUrl) ;

    //sort in main page , adding ? to url
    if(Object.keys(req.query).length==0){
        res.locals.originalUrl= res.locals.originalUrl+"?"
    }

    //pagination
    const limit =6;
    options.limit=limit;
    options.offset= limit * (page-1);

    let {rows,count }= await models.Product.findAndCountAll(options);
    res.locals.pagination ={
        page:page,
        limit:limit,
        totalRows: count,
        queryParams: req.query
    }

    //let products= await models.Product.findAll(options);
    res.locals.products= rows;//products
    res.render('product-list')
}

controller.showDetails= async(req,res)=>{
    let id= isNaN(req.params.id)? 0: parseInt(req.params.id);


    //findByprimarykey
    //let product= await models.Product.findByPk(id);
    let product= await models.Product.findOne({
        attributes: ['id','name','stars','price','oldPrice','summary','description','specification'],
        where: {
            id:id,
        },
        include:[{
            model:models.Image,
            attributes: ['name','imagePath'],
        },
        {
            model:models.Review,
            attributes: ['id','review','stars','createdAt'],
            include: [{
                model: models.User,
                attributes: ['lastName','firstName'],
            }]
        }]
    })
    res.locals.product=product;
    res.render('product-detail')

}


function removeParam(key, sourceURL) {
    var rtn = sourceURL.split("?")[0],
        param,
        params_arr = [],
        queryString = (sourceURL.indexOf("?") !== -1) ? sourceURL.split("?")[1] : "";
    if (queryString !== "") {
        params_arr = queryString.split("&");
        for (var i = params_arr.length - 1; i >= 0; i -= 1) {
            param = params_arr[i].split("=")[0];
            if (param === key) {
                params_arr.splice(i, 1);
            }
        }
        if (params_arr.length) rtn = rtn + "?" + params_arr.join("&");
    }
    return rtn;
}

module.exports= controller;