require('dotenv/config')
require('./db')
const express = require('express')

const app = express()
require('./config')(app)


// Route handling
const allRoutes = require("./routes");
app.use("/api", allRoutes);

//Handle errors
require('./error-handling')(app)

module.exports = app
