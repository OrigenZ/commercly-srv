require('dotenv/config')
require('./db')
const express = require('express')

const app = express()
require('./config')(app)

//Middleware
const { isAuthenticated } = require('./middleware/jwt.middleware')

// Route handling
const auth = require('./routes/Auth.routes')
app.use('/api/auth', auth)

const products = require('./routes/Products.routes')
app.use('/api/products', products)

const categories = require('./routes/Categories.routes')
app.use('/api/categories', categories)

const cart = require('./routes/Cart.routes')
app.use('/api/cart', isAuthenticated, cart)

const users = require('./routes/Users.routes')
app.use('/api/users', isAuthenticated, users)

//Handle errors
require('./error-handling')(app)

module.exports = app
