// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require('dotenv/config')

// ℹ️ Connects to the database
require('./db')

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require('express')

const app = express()

// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require('./config')(app)

//Middleware
const { isAuthenticated } = require('./middleware/jwt.middleware')

// 👇 Start handling routes here
// Contrary to the views version, all routes are controlled from the routes/index.js
const allRoutes = require('./routes')
app.use('/api', allRoutes)

const auth = require('./routes/Auth.routes')
app.use('/auth', auth)

const products = require('./routes/Products.routes')
app.use('/api/products', isAuthenticated, products)

const categories = require('./routes/Categories.routes')
app.use('/api/categories', isAuthenticated, categories)

const shop = require('./routes/Shop.routes')
app.use('/api/shop', isAuthenticated, shop)

const admin = require('./routes/Admin.routes')
app.use('/api/admin', isAuthenticated, admin)

const customer = require('./routes/Customer.routes')
app.use('/api/customer', isAuthenticated, customer)

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require('./error-handling')(app)

module.exports = app
