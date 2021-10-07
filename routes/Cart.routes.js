const router = require('express').Router()
const mongoose = require('mongoose')
const Product = require('../models/Product.model')
const Cart = require('../models/Cart.model')

//GET /api/cart/:customerId - gets a cart from the database
router.get('/:customerId', (req, res, next) => {
  const { customerId } = req.params

  Cart.findOne({ customer: customerId })
    .populate('products')
    .then((cart) => {
      res.status(200).json(cart)
    })
    .catch((err) => next(err))
})

//POST /api/cart/add-item - Adds an item to the cart
router.post('/add-item', async (req, res, next) => {
  const { productId, cartId } = req.body

  try {
    const isProductInCart = await Product.findOne({
      _id: productId,
      inCarts: { $elemMatch: { cartId: mongoose.Types.ObjectId(cartId) } },
    })

    let product
    if (!isProductInCart) {
      console.log('product is NOT in cart')
      product = await Product.findOneAndUpdate(
        {
          _id: productId,
          quantity: { $gte: 1 },
        },
        {
          $inc: { quantity: -1 },
          $push: {
            inCarts: {
              cartId: cartId,
              quantity: 1,
              timestamp: new Date(),
            },
          },
        },
      )
    } else {
      product = await Product.findOneAndUpdate(
        {
          _id: productId,
          'inCarts.CartId': cartId,
          quantity: { $gte: 1 },
        },
        {
          $inc: { quantity: -1, 'inCarts.$.quantity': 1 },
          $set: {
            'inCarts.$.timestamp': new Date(),
          },
        },
      )
    }

    if (product) {
      const cart = await Cart.findOneAndUpdate(
        { _id: cartId },
        {
          $push: { products: { _id: productId } },
        },
        { new: true },
      ).populate('products')

      res.status(200).json(cart)
    } else {
      throw new Error('This product is out of stock')
    }
  } catch (err) {
    next(err)
  }
})

//POST /api/cart/remove-item - Removes an item from the cart
router.post('/remove-item', async (req, res, next) => {
  const { productId, cartId } = req.body

  try {
    const cart = await Cart.findById(cartId)

    const prodIndex = cart.products.findIndex(
      (productRef) => String(productRef) === productId,
    )

    if (prodIndex >= 0) cart.products.splice(prodIndex, 1)

    const newCart = await Cart.findByIdAndUpdate(
      cartId,
      {
        products: cart.products,
      },
      { new: true },
    ).populate('products')

    const product = await Product.findOneAndUpdate(
      {
        _id: productId,
        'inCarts.CartId': cartId,
        'inCarts.quantity': { $gte: 1 },
      },
      {
        $inc: { quantity: 1, 'inCarts.$.quantity': -1 },
        $set: {
          'inCarts.$.timestamp': new Date(),
        },
      },
      { new: true },
    )

    const isInSomeCart = product.inCarts[0].quantity

    if (!isInSomeCart) {
      await Product.findOneAndUpdate(
        {
          _id: productId,
          'inCarts.CartId': cartId,
        },
        {
          $pull: {
            inCarts: {
              quantity: { $lte: 0 },
            },
          },
        },
      )
    }

    res.status(200).json(newCart)
  } catch (err) {
    next(err)
  }
})

//POST /api/cart/remove-line - remove product line from cart
router.post('/remove-line', async (req, res, next) => {
  const { productId, cartId } = req.body

  await Cart.findOneAndUpdate(
    { _id: cartId },
    {
      $pull: { products: { $in: [productId] } },
    },
    { new: true },
  )
    .populate('products')
    .then((cart) => res.status(200).json(cart))
    .catch((err) => next(err))
})

// PATCH /api/cart/clear/:cartId - clears a cart by cart id
router.patch('/clear/:cartId', async (req, res, next) => {
  const { cartId } = req.params

  console.log(cartId)

  const emptiedCart = await Cart.findByIdAndUpdate(cartId, {
    $set: { products: [] },
  })

  await Product.updateMany(
    {},
    {
      $pull: { inCarts: { cartId: emptiedCart._id } },
    },
  )
  res.status(200).json({ emptiedCart })
})

module.exports = router
