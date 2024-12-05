const models = require("./models");
models.sequelize.sync().then(()=> console.log("table created"));