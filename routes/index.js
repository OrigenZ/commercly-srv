const router = require('express').Router()
const { isAuthenticated } = require('../middleware/jwt.middleware')
const authRoutes = require('../routes/Auth.routes')
const productsRoutes = require('./Products.routes')
const categoriesRoutes = require('./Categories.routes')
const cartRoutes = require('./Cart.routes')
const ordersRoutes = require('./Orders.routes')
const usersRoutes = require('./Users.routes')

/* GET home page */
router.get('/', (req, res, next) => {
  res.json('Commercly-srv v1')
})

router.use('/auth', authRoutes)
router.use('/products', productsRoutes)
router.use('/categories', categoriesRoutes)
router.use('/cart', isAuthenticated, cartRoutes)
router.use('/orders', isAuthenticated, ordersRoutes)
router.use('/users', isAuthenticated, usersRoutes)

module.exports = router
