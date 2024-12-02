'use strict'
const express= require('express');
const router= express.Router();
const controller = require('../controllers/indexController');

// router.get('/createTable',(req,res) =>{
//     let models= require('./models');
//     models.sequelize.sync().then(()=> {
//         res.send('tables created');
//     })
// })

//home
router.get('/',controller.showHomepage);


//hay nè
router.get('/:page',controller.showPage)

module.exports= router;