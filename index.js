//ensure do not use var that not declare
'use strict';

require('dotenv').config();

const express= require('express');
const app=express();
//handlebar
const expressHandlebars= require('express-handlebars');
const {createStarList}= require('./controllers/handlebarsHelper')
const {createPagination} = require('express-handlebars-paginate');
const session=require('express-session');

//redis
const {RedisStore} = require("connect-redis")
const {createClient}= require('redis');
let redisClient= createClient({
    //dotenv
    url : process.env.REDIS_URL

    //internal link for server not run in local hosst any more
    //url:'redis://red-ct8ttb8gph6c73di5qag:6379'

    //external link for local host
    //url:'rediss://red-ct8ttb8gph6c73di5qag:AYkXdNGFp7TGYoXGgQgxqEPLD1zUVXQ5@singapore-redis.render.com:6379'
})
redisClient.connect().catch(console.error)

let redisStore = new RedisStore({
    client: redisClient,
    prefix: "myapp:",
  })

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
        createPagination,
    }
}));
app.set('view engine','hbs');

// app.get('/createTable',(req,res) =>{
//     let models= require('./models');
//     models.sequelize.sync().then(()=> {
//         res.send('tables created');
//     })
// })



//cau hinh read post data form body
app.use(express.json());
app.use(express.urlencoded({extended:false}));

//session
app.use(session({
    //secret:'S3cret',
    secret:process.env.SESSION_SECRET,
    store: redisStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 20*60 *1000 //20min
    }
}));


//middleware create shop bag 
app.use((req,res,next) => {
    let Cart =require('./controllers/cart')
    req.session.cart= new Cart(req.session.cart ? req.session.cart : {});
    res.locals.quantity= req.session.quantity;
    next();
});

//route
app.use('/',require('./routes/indexRouter'))

app.use('/products',require('./routes/productsRouter'))
app.use('/users',require('./routes/usersRouter'));

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
