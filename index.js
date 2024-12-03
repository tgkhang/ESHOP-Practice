//ensure do not use var that not declare
'use strict';


const express= require('express');
const app=express();
//handlebar
const expressHandlebars= require('express-handlebars');
const {createStarList}= require('./controllers/handlebarsHelper')


const port=process.env.PORT || 3000;

//static folder
app.use(express.static(__dirname +'/public'));
//handlebar
app.engine('hbs',expressHandlebars.engine({
    extname:'hbs',
    defaultLayout:'layout',
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials',
    runtimeOptions: {
        allowProtoPropertiesByDefault:true,
    },
    helpers:{
        createStarList,
    }
}));
app.set('view engine','hbs');

// app.get('/createTable',(req,res) =>{
//     let models= require('./models');
//     models.sequelize.sync().then(()=> {
//         res.send('tables created');
//     })
// })

//route
app.use('/',require('./routes/indexRouter'))

app.use('/products',require('./routes/productsRouter'))

app.use((req,res,next)=>{
    res.status(404).render('error',{message: 'FILE NOT FOUND'});
})
//
app.use((error,req,res,next)=>{
    console.log(error);
    res.status(500).render('error',{message:'Internal Server Error'});
})

//start server
app.listen(port, () => {
    console.log(`server is running on port ${port}`);
})
