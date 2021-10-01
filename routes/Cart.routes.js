const router = require('express').Router()
const User = require('../models/User.model')
const Cart = require('../models/Cart.model')

//GET /api/cart/:customerId - gets a cart from the database
router.get('/:customerId', (req, res, next) => {
  const { customerId } = req.params

  Cart.findById(customerId)
    .then((cart) => res.status(200).json(cart))
    .catch((err) => next(err))
})

//GET /api/cart/checkout  - Gets relevant data from the cart for the checkout
router.get('/checkout', async (req, res, next) => {
  const { userId } = req.body

  try {
    const user = await User.findById(userId).populate(
      'addresses.billing addresses.shipping',
    )

    const cart = await Cart.findById(user.cart).populate('products')

    let itemsCounter = {}
    let productsArray = []
    let totalItems = 0
    let totalPrice = 0

    cart.products.forEach((obj) => {
      const key = JSON.stringify(obj)
      itemsCounter[key] = (itemsCounter[key] || 0) + 1
    })

    itemsCounter = Object.entries(itemsCounter)

    for (const item of itemsCounter) {
      const product = JSON.parse(item[0])
      const quantity = item[1]
      const totalLine = quantity * product.price
      totalItems += item[1]
      totalPrice += totalLine

      productsArray.push({
        product: product,
        quantity: quantity,
        totalLine: totalLine,
      })
    }

    res.status(200).json({
      products: productsArray,
      totalItems: totalItems,
      totalPrice: totalPrice,
      billing: user.addresses.billing,
    })
  } catch (err) {
    next(err)
  }
})

//POST /api/cart/add-item - Adds an item to the cart
router.post('/add-item', (req, res, next) => {
  const { productId, cartId } = req.body

  Cart.findOneAndUpdate(
    { _id: cartId },
    {
      $push: { products: { _id: productId } },
    },
    { new: true },
  )
    .then((cart) => res.status(200).json({ cart }))
    .catch((err) => next(err))
})

//POST /api/cart/remove-item - Removes an item from the cart
router.post('/remove-item', async (req, res, next) => {
  const { productId, cartId } = req.body

  try {
    const cart = await Cart.findById(cartId)

    const prodIndex = cart.products.findIndex(
      (product) => String(product) === productId,
    )

    if (prodIndex >= 0) cart.products.splice(prodIndex, 1)

    const newCart = await Cart.findByIdAndUpdate(
      cartId,
      {
        products: cart.products,
      },
      { new: true },
    )

    res.status(200).json(newCart)
  } catch (err) {
    next(err)
  }
})

//POST /api/cart/remove-line - remove product line from cart
router.post('/remove-line', async (req, res, next) => {
  const { productId, cartId } = req.body

  Cart.findOneAndUpdate(
    { _id: cartId },
    {
      $pull: { products: { $in: [productId] } },
    },
    { new: true },
  )
    .then((cart) => res.status(200).json(cart))
    .catch((err) => next(err))
})

module.exports = router
