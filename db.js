const models = require("./models");
models.sequelize.sync().then(()=> console.log("table created"));

// {
//     "username": "postgres",
//     "password": "123",
//     "database": "eshop",
//     "host": "127.0.0.1",
//     "dialect": "postgres"
//   }